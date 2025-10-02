# Sigma Bubble Heatmap Plugin

A custom bubble heatmap visualization plugin for Sigma Computing that displays data as positioned bubbles with size and color encoding, supporting optional grouping for data aggregation.

## Features

🎯 **Multi-Dimensional Visualization**: Plots Y vs X values with size and color encoding  
📊 **Grouping Support**: Optional multi-column grouping with automatic aggregation  
💬 **Dynamic Tooltips**: Hover for detailed information that adapts to your data  
� **Size Encoding**: Bubble size represents counts, magnitude, or other numeric values  
🎨 **Color Coding**: Support for both categorical and continuous color mapping  
🏷️ **Smart Labels**: Auto-generated labels for grouped or individual data points  
⚙️ **Configurable**: Custom axis labels and chart titles  
📱 **Responsive**: Adapts to different screen sizes  
🔗 **Interactive**: Click bubbles to navigate to other workbooks with data context  

## Data Structure

Your Sigma data should include:

| Property | Description | Required | Example Values |
|----------|-------------|----------|----------------|
| **Data Source** | Your data table | ✅ | Sales table, Risk data, etc. |
| **Grouping** | Columns to group by | ❌ | Region, Category, Product |
| **X** | Horizontal positioning | ✅ | Revenue, Impact, Performance |
| **Y** | Vertical positioning | ✅ | Growth Rate, Likelihood, Quality |
| **Size** | Bubble size | ✅ | Count, Volume, Investment |
| **Color** | Color encoding | ✅ | Category, Risk Level, #FF6B6B |

## Example Data

```csv
Region,Product,Revenue,Growth_Rate,Count,Risk_Level
North,Electronics,50000,2.5,125,Low
North,Clothing,32000,1.8,89,Medium  
South,Electronics,75000,3.2,200,Low
South,Clothing,28000,1.2,67,High
```

## Configuration

1. **Data Source**: Select your data table
2. **Grouping** (Optional): Select columns to group data by (e.g., Region + Product)
3. **X**: Column for X-axis positioning (horizontal values)
4. **Y**: Column for Y-axis positioning (vertical values)  
5. **Size**: Column for bubble sizing (aggregated when grouping)
6. **Color**: Column for color encoding (categorical or hex values)

## How Grouping Works

### Without Grouping
- Each data row becomes one bubble
- Direct positioning and sizing

### With Grouping (e.g., by Region + Product)
- Multiple rows are combined into single bubbles
- X/Y positions are averaged within groups
- Size values are summed across group items
- Labels show grouped dimensions: "North | Electronics"

## Development

### Local Development Setup

1. **Clone and install dependencies**:
```bash
git clone https://github.com/stevechanlee/sigma-heatmap-poc.git
cd sigma-heatmap-poc
npm install
```

2. **Start development server**:
```bash
npm run dev
```
This starts a local server at `http://localhost:5173/`

3. **Configure Sigma Admin**:
- Go to **Admin** → **Plugins** in Sigma
- Create/edit your plugin configuration
- Set both Development and Production URLs to: `http://localhost:5173/`
- Set Main File to: `index.html`
- Save configuration

4. **Development workflow**:
- Make changes to code files
- Vite automatically reloads the browser
- Test changes immediately in Sigma workbooks
- Commit changes when ready

### Building for Production

```bash
npm run build
```

## Configuration Properties

The plugin provides these configurable properties in Sigma:

| Property | Type | Description |
|----------|------|-------------|
| **Source** | Element | Select your data table/element |
| **y-axis** | Column | Y-axis values (numeric) |
| **x-axis** | Column | X-axis values (numeric) |
| **size** | Column | Bubble size values (count, magnitude) |
| **risk_score** | Column | Scores for opacity weighting (optional) |
| **color** | Column | Hex color codes for categories |
| **label** | Column | Text labels for bubbles |
| **X-AXIS LABEL** | Text | Custom X-axis label (optional) |
| **Y-AXIS LABEL** | Text | Custom Y-axis label (optional) |
| **HEATMAP TITLE** | Text | Custom title for the heatmap (optional) |

## Usage in Workbook

1. Add new element → **Custom Plugin** → **Bubble Heatmap Plugin**
2. Configure columns in Properties panel
3. View your data visualization with interactive bubbles

## Visual Design

- **Background**: Green to red gradient
- **X-axis**: Horizontal values from your data
- **Y-axis**: Vertical values from your data
- **Bubbles**: Positioned by X/Y coordinates
- **Size**: Proportional to count or magnitude values
- **Color**: Category specific (from your data)
- **Opacity**: Higher scores = more prominent display
- **Labels**: Category names displayed on bubbles
- **Hover**: Detailed tooltips with all metrics

Perfect for two-dimensional data analysis, risk assessments, compliance dashboards, and strategic planning!