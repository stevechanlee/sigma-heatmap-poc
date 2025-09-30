# Sigma Risk Bubble Heatmap Plugin

A custom bubble heatmap visualization plugin for Sigma Computing that displays data as bubbles on a gradient background for two-dimensional analysis.

## Features

🎯 **Two-Dimensional Visualization**: Plots Y-axis vs X-axis values with gradient background  
💬 **Dynamic Tooltips**: Hover for detailed information that adapts to your column names  
📊 **Size Encoding**: Bubble size represents count of risks or magnitude  
🎨 **Color Coding**: Custom colors for different risk categories  
⚡ **Opacity Weighting**: Risk scores determine visual prominence  
🏷️ **Smart Labels**: Axis labels automatically use your column names  
🎨 **Custom Styling**: Override labels and add titles through properties  
📱 **Responsive**: Adapts to different screen sizes  

## Data Structure

Your Sigma data should include:

| Column Type | Description | Example Values |
|-------------|-------------|----------------|
| **Y-Axis** | Vertical positioning values | 1-5 scale |
| **X-Axis** | Horizontal positioning values | 1-5 scale |
| **Size** | Bubble size (count, magnitude) | 5, 17, 86 |
| **Score** | Overall score for opacity weighting | 6.25, 11.6 |
| **Color** | Category colors | #27B65A, #7ED321 |
| **Label** | Category names | "Financial", "Operational" |

## Example Data

```csv
Y_Value,X_Value,Size,Score,Color,Label
2.98,3.68,17,7.53,#7ED321,Access Control
3.16,2.40,6,3.80,#27B65A,Asset Management
3.82,3.82,25,11.61,#27B65A,Operational
3.27,3.27,86,7.72,#27B65A,Financial
```

## Configuration

1. **Data Source**: Select your data table
2. **Y-Axis**: Column for Y-axis positioning (vertical values)
3. **X-Axis**: Column for X-axis positioning (horizontal values)
4. **Size**: Column for bubble sizing (count, magnitude)
5. **Score**: Column for opacity weighting (calculated scores)
6. **Color**: Column with hex color codes for categories
7. **Label**: Column with text labels for bubble identification

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