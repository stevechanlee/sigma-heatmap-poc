import * as d3 from "d3";
import React, { useMemo, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import { useConfig, useEditorPanelConfig, useElementColumns, useElementData, useActionTrigger } from "@sigmacomputing/plugin";

// Debounce function to prevent excessive re-renders
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Cache for the last render to prevent unnecessary DOM updates
let renderCache = null;

function renderBubbleHeatmap(data, config = {}, columnNames = {}, onBubbleClick = null) {
  // Create a cache key to check if we need to re-render
  const cacheKey = JSON.stringify({
    dataLength: data.length,
    dataHash: data.length > 0 ? JSON.stringify(data.slice(0, 3)) : '', // Sample first 3 items
    config: config,
    columnNames: columnNames
  });
  
  // Skip rendering if nothing changed
  if (renderCache === cacheKey) {
    console.log('Skipping render - no changes detected');
    return;
  }
  
  console.log('Rendering bubble heatmap with data:', data);
  renderCache = cacheKey;
  const container = d3.select("#heatmapContainer");
  container.selectAll("*").remove();

  const containerRect = container.node()?.getBoundingClientRect();
  const width = containerRect?.width || 800;
  const height = containerRect?.height || 600;
  const margin = { top: 50, right: 50, bottom: 50, left: 80 };

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  if (!data.length) {
    document.getElementById("empty").style.display = "flex";
    return;
  }
  document.getElementById("empty").style.display = "none";

  // Filter out data with null values for positioning
  const validData = data.filter(d => 
    d.yValue !== null && d.yValue !== undefined && 
    d.xValue !== null && d.xValue !== undefined
  );

  if (!validData.length) {
    document.getElementById("empty").style.display = "flex";
    return;
  }

  // Create background using the actual heatmap SVG image
  const backgroundDiv = d3.select("#heatmapContainer")
    .insert("div", "svg")
    .attr("class", "heatmap-background")
    .style("position", "absolute")
    .style("top", margin.top + "px")
    .style("left", margin.left + "px")
    .style("width", (width - margin.left - margin.right) + "px")
    .style("height", (height - margin.top - margin.bottom) + "px")
    .style("background-image", "url('/Heatmap-bg.png')")
    .style("background-size", "cover")
    .style("background-position", "center")
    .style("background-repeat", "no-repeat")
    .style("opacity", "0.8")
    .style("z-index", "1");

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(validData, d => d.xValue) + 0.5])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(validData, d => d.yValue) + 0.5])
    .range([height - margin.bottom, margin.top]);

  const sizeScale = d3.scaleSqrt()
    .domain([0, d3.max(validData, d => d.size) || 1])
    .range([5, 60]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .attr("class", "axis");

  // Add Y axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
    .attr("class", "axis");

  // Create tooltip div
  const tooltip = d3.select("body")
    .selectAll(".heatmap-tooltip")
    .data([null])
    .join("div")
    .attr("class", "heatmap-tooltip")
    .style("position", "absolute")
    .style("background", "rgba(45, 45, 45, 0.95)")
    .style("color", "white")
    .style("padding", "12px")
    .style("border-radius", "6px")
    .style("font-size", "14px")
    .style("font-family", "system-ui, sans-serif")
    .style("line-height", "1.4")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 1000);

  // Add bubbles with hover events
  const bubbles = svg.selectAll(".bubble")
    .data(validData)
    .join("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.xValue))
    .attr("cy", d => yScale(d.yValue))
    .attr("r", d => sizeScale(d.size))
    .attr("fill", d => d.color || "#27B65A")
    .attr("opacity", 0.7)
    .attr("stroke", "#000")
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      // Show tooltip
      tooltip.transition()
        .duration(200)
        .style("opacity", 1);
      
      // Format tooltip content dynamically based on available data and column names
      let content = `<div style="font-weight: bold; margin-bottom: 8px; color: #fff;">${d.label}</div>`;
      
      // Add X-axis info
      if (d.xValue !== undefined && d.xValue !== null) {
        content += `<div style="margin-bottom: 4px;">${columnNames.x || 'X-Axis'}: <span style="color: #ccc;">${d.xValue.toFixed(2)}</span></div>`;
      }
      
      // Add Y-axis info  
      if (d.yValue !== undefined && d.yValue !== null) {
        content += `<div style="margin-bottom: 4px;">${columnNames.y || 'Y-Axis'}: <span style="color: #ccc;">${d.yValue.toFixed(2)}</span></div>`;
      }
      
      // Add size info
      if (d.size !== undefined && d.size !== null) {
        content += `<div style="margin-bottom: 4px;">Size: <span style="color: #ccc;">${d.size}</span></div>`;
      }
      
      // Add count info for grouped data
      if (d.count !== undefined && d.count > 1) {
        content += `<div style="margin-bottom: 4px;">Items: <span style="color: #ccc;">${d.count}</span></div>`;
      }
      
      tooltip.html(content)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      
      // Highlight bubble
      d3.select(this)
        .attr("stroke-width", 3)
        .attr("stroke", "#fff");
    })
    .on("mouseout", function(event, d) {
      // Hide tooltip
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
      
      // Reset bubble style
      d3.select(this)
        .attr("stroke-width", 1)
        .attr("stroke", "#000");
    })
    .on("mousemove", function(event, d) {
      // Update tooltip position as mouse moves
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("click", function(event, d) {
      // Trigger navigation action when bubble is clicked
      if (onBubbleClick) {
        onBubbleClick(d);
      }
    });

  // Add labels on bubbles
  svg.selectAll(".bubble-label")
    .data(validData)
    .join("text")
    .attr("class", "bubble-label")
    .attr("x", d => xScale(d.xValue))
    .attr("y", d => yScale(d.yValue))
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("fill", "#000")
    .style("pointer-events", "none")
    .text(d => d.label);

  // Add axis labels
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 20)
    .attr("x", 0 - (height / 2))
    .attr("dy", "0")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(config["Y_AXIS_LABEL"] || columnNames.y || "Y-Axis");

  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - 10})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text(config["X_AXIS_LABEL"] || columnNames.x || "X-Axis");

  // Add chart title (only if specified by user)
  if (config["TITLE"]) {
    svg.append("text")
      .attr("transform", `translate(${width / 2}, 20)`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(config["TITLE"]);
  }

  // Notify Sigma about height changes
  queueMicrotask(() => {
    try { 
      parent.postMessage({ 
        type: "sigma-plugin:height", 
        height: document.body.scrollHeight 
      }, "*"); 
    } catch {}
  });
}

// React component for the bubble heatmap
function BubbleHeatmapPlugin() {
  // Configure the editor panel using React Hooks API
  useEditorPanelConfig([
    { name: "source", type: "element" }, // Data Source
    { name: "grouping", type: "column", source: "source", allowMultiple: true }, // Grouping columns (top priority)
    { name: "x", type: "column", source: "source", allowedTypes: ["number", "integer"] }, // X-axis positioning
    { name: "y", type: "column", source: "source", allowedTypes: ["number", "integer"] }, // Y-axis positioning
    { name: "size", type: "column", source: "source", allowedTypes: ["number", "integer"] }, // Bubble size
    { name: "color", type: "column", source: "source" }, // Color encoding
    { name: "label", type: "column", source: "source" }, // Labels for bubbles
    { name: "X_AXIS_LABEL", type: "text" }, // X-axis label
    { name: "Y_AXIS_LABEL", type: "text" }, // Y-axis label
    { name: "TITLE", type: "text" }, // Chart title
    { name: "navigate_to_workbook", type: "action-trigger" }, // Action trigger for navigation
  ]);

  // Get configuration and data using React Hooks
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const columnInfo = useElementColumns(config.source);
  
  // Action trigger for navigation
  const triggerNavigation = useActionTrigger("navigate_to_workbook");

  // Process the data into the format we need with grouping support
  const processedData = useMemo(() => {
    if (!config.y || !config.x || !config.size || !sigmaData) {
      return [];
    }

    const yData = sigmaData[config.y] || [];
    const xData = sigmaData[config.x] || [];
    const sizeData = sigmaData[config.size] || [];
    const colorData = sigmaData[config.color] || [];
    const labelData = sigmaData[config.label] || [];
    
    // Get grouping columns data
    const groupingData = config.grouping ? 
      (Array.isArray(config.grouping) ? config.grouping : [config.grouping]).map(col => sigmaData[col] || []) : 
      [];

    const len = Math.min(yData.length, xData.length, sizeData.length);
    
    // Create raw data array
    const rawData = Array.from({ length: len }, (_, i) => ({
      yValue: Number(yData[i]) || null,
      xValue: Number(xData[i]) || null,
      sizeValue: Number(sizeData[i]) || 0,
      colorValue: colorData[i] || "#27B65A",
      labelValue: String(labelData[i] || `Item ${i + 1}`),
      groupingValues: groupingData.map(group => String(group[i] || 'Unknown')),
      originalIndex: i
    }));

    // If no grouping, return raw data
    if (!config.grouping || groupingData.length === 0) {
      return rawData.map(d => ({
        yValue: d.yValue,
        xValue: d.xValue,
        size: d.sizeValue,
        color: d.colorValue,
        label: d.labelValue
      }));
    }

    // Group data by grouping columns
    const grouped = d3.group(rawData, d => d.groupingValues.join(' | '));
    
    // Aggregate each group
    return Array.from(grouped, ([groupKey, groupItems]) => {
      const validItems = groupItems.filter(d => d.yValue !== null && d.xValue !== null);
      
      if (validItems.length === 0) return null;
      
      return {
        yValue: d3.mean(validItems, d => d.yValue), // Average Y
        xValue: d3.mean(validItems, d => d.xValue), // Average X
        size: d3.sum(validItems, d => d.sizeValue), // Sum of sizes
        color: validItems[0].colorValue, // First color in group
        label: groupKey, // Group identifier as label
        count: validItems.length // Number of items in group
      };
    }).filter(d => d !== null);
  }, [config, sigmaData]);

  // Memoize column names to prevent unnecessary recalculations
  const columnNames = useMemo(() => ({
    x: (columnInfo && columnInfo[config.x] && columnInfo[config.x].name) || config.x,
    y: (columnInfo && columnInfo[config.y] && columnInfo[config.y].name) || config.y
  }), [columnInfo, config]);

  // Memoize the click handler to prevent recreation on every render
  const handleBubbleClick = useCallback((bubbleData) => {
    console.log("Bubble clicked:", bubbleData);
    // Pass all bubble data through the action trigger
    triggerNavigation({
      label: bubbleData.label,
      x_value: bubbleData.xValue,
      y_value: bubbleData.yValue,
      size: bubbleData.size,
      color: bubbleData.color,
      count: bubbleData.count || 1
    });
  }, [triggerNavigation]);

  // Create a debounced render function to prevent excessive re-renders
  const debouncedRender = useCallback(
    debounce((data, config, columnNames, handleBubbleClick) => {
      renderBubbleHeatmap(data, config, columnNames, handleBubbleClick);
    }, 100), // 100ms debounce
    []
  );

  // Use ref to track last render to prevent unnecessary re-renders
  const lastRenderRef = useRef();
  
  // Render the heatmap when data changes
  useEffect(() => {
    // Create a render key to check if we actually need to re-render
    const renderKey = JSON.stringify({
      dataLength: processedData.length,
      hasX: !!config.x,
      hasY: !!config.y, 
      hasSize: !!config.size
    });
    
    // Only render if something actually changed
    if (lastRenderRef.current === renderKey) {
      return;
    }
    
    lastRenderRef.current = renderKey;
    debouncedRender(processedData, config, columnNames, handleBubbleClick);
  }, [processedData, config, columnNames, handleBubbleClick, debouncedRender]);

  return null; // React component doesn't render anything directly
}

// Initialize React component when DOM is ready
const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(React.createElement(BubbleHeatmapPlugin));
