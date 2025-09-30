import * as d3 from "d3";
import React, { useMemo, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useConfig, useEditorPanelConfig, useElementColumns, useElementData } from "@sigmacomputing/plugin";

function renderBubbleHeatmap(data) {
  const container = d3.select("#heatmapContainer");
  container.selectAll("*").remove();

  const containerRect = container.node()?.getBoundingClientRect();
  const width = containerRect?.width || 800;
  const height = containerRect?.height || 600;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };

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
    d.likelihood !== null && d.likelihood !== undefined && 
    d.impact !== null && d.impact !== undefined
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
    .style("background-image", "url('/heatmap-bg.svg')")
    .style("background-size", "cover")
    .style("background-position", "center")
    .style("background-repeat", "no-repeat")
    .style("opacity", "0.8")
    .style("z-index", "1");

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(validData, d => d.impact) + 0.5])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(validData, d => d.likelihood) + 0.5])
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

  // Calculate opacity based on risk values
  const maxRisk = d3.max(validData, d => d.risk) || 1;

  // Add bubbles
  const bubbles = svg.selectAll(".bubble")
    .data(validData)
    .join("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.impact))
    .attr("cy", d => yScale(d.likelihood))
    .attr("r", d => sizeScale(d.size))
    .attr("fill", d => d.color || "#27B65A")
    .attr("opacity", d => Math.max(0.4, Math.min(0.9, (d.risk || 0) / maxRisk)))
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  // Add labels on bubbles
  svg.selectAll(".bubble-label")
    .data(validData)
    .join("text")
    .attr("class", "bubble-label")
    .attr("x", d => xScale(d.impact))
    .attr("y", d => yScale(d.likelihood))
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("font-weight", "bold")
    .style("fill", "#000")
    .style("pointer-events", "none")
    .text(d => d.label);

  // Add tooltips
  bubbles.append("title")
    .text(d => `${d.label}\nLikelihood: ${d.likelihood}\nImpact: ${d.impact}\nRisks: ${d.size}\nRisk Score: ${d.risk}`);

  // Add axis labels
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Average Likelihood");

  svg.append("text")
    .attr("transform", `translate(${width / 2}, ${height - 10})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Average Impact");

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
    { name: "source", type: "element" },
    { name: "likelihood", type: "column", source: "source", allowedTypes: ["number", "integer"] }, // Y-axis (likelihood/frequency)
    { name: "impact", type: "column", source: "source", allowedTypes: ["number", "integer"] }, // X-axis (impact/severity)  
    { name: "size", type: "column", source: "source", allowedTypes: ["number", "integer"] }, // Bubble size (count of risks)
    { name: "risk_score", type: "column", source: "source", allowedTypes: ["number", "integer"] }, // Risk score for opacity
    { name: "color", type: "column", source: "source" }, // Color column (hex colors)
    { name: "label", type: "column", source: "source" }, // Labels for bubbles
  ]);

  // Get configuration and data using React Hooks
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const columnInfo = useElementColumns(config.source);

  // Process the data into the format we need
  const data = useMemo(() => {
    if (!config.likelihood || !config.impact || !config.size || !sigmaData) {
      return [];
    }

    const likelihoodData = sigmaData[config.likelihood] || [];
    const impactData = sigmaData[config.impact] || [];
    const sizeData = sigmaData[config.size] || [];
    const riskData = sigmaData[config.risk_score] || [];
    const colorData = sigmaData[config.color] || [];
    const labelData = sigmaData[config.label] || [];

    const len = Math.min(
      likelihoodData.length, 
      impactData.length, 
      sizeData.length
    );
    
    return Array.from({ length: len }, (_, i) => ({
      likelihood: Number(likelihoodData[i]) || null,
      impact: Number(impactData[i]) || null,
      size: Number(sizeData[i]) || 0,
      risk: Number(riskData[i]) || 0,
      color: String(colorData[i] || "#27B65A"),
      label: String(labelData[i] || `Item ${i + 1}`),
    }));
  }, [config, sigmaData]);

  // Render the heatmap when data changes
  useEffect(() => {
    renderBubbleHeatmap(data);
  }, [data]);

  return null; // React component doesn't render anything directly
}

// Initialize React component when DOM is ready
const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(React.createElement(BubbleHeatmapPlugin));
