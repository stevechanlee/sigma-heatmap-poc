# Sigma Risk Bubble Heatmap Plugin

A custom risk bubble heatmap visualization plugin for Sigma Computing that displays risk data as bubbles on a gradient background, similar to traditional risk assessment matrices.

## Features

🎯 **Risk Matrix Visualization**: Plots likelihood vs impact with risk gradient background  
💬 **Interactive Bubbles**: Hover for detailed risk information  
📊 **Size Encoding**: Bubble size represents count of risks or magnitude  
🎨 **Color Coding**: Custom colors for different risk categories  
⚡ **Opacity Weighting**: Risk scores determine visual prominence  
📱 **Responsive**: Adapts to different screen sizes  

## Data Structure

Your Sigma data should include:

| Column Type | Description | Example Values |
|-------------|-------------|----------------|
| **Likelihood** | Probability/Frequency (Y-axis) | 1-5 scale |
| **Impact** | Severity/Consequences (X-axis) | 1-5 scale |
| **Size** | Bubble size (count, magnitude) | 5, 17, 86 |
| **Risk Score** | Overall risk score (opacity) | 6.25, 11.6 |
| **Color** | Risk category colors | #27B65A, #7ED321 |
| **Label** | Risk category names | "Financial", "Operational" |

## Example Data

```csv
Likelihood,Impact,Size,RiskScore,Color,Label
2.98,3.68,17,7.53,#7ED321,Access Control
3.16,2.40,6,3.80,#27B65A,Asset Management
3.82,3.82,25,11.61,#27B65A,Operational
3.27,3.27,86,7.72,#27B65A,Financial
```

## Configuration

1. **Data Source**: Select your risk data table
2. **Likelihood**: Column for Y-axis positioning (frequency/probability)
3. **Impact**: Column for X-axis positioning (severity/consequences)
4. **Size**: Column for bubble sizing (count of risks, magnitude)
5. **Risk Score**: Column for opacity weighting (calculated risk scores)
6. **Color**: Column with hex color codes for risk categories
7. **Label**: Column with text labels for bubble identification

## Deployment

### Build & Deploy
```bash
npm run deploy
```

## Usage in Workbook

1. Add new element → **Custom Plugin** → **Risk Bubble Heatmap Plugin**
2. Configure columns in Properties panel
3. View your risk landscape with interactive bubbles

## Visual Design

- **Background**: Green (low risk) to red (high risk) gradient
- **X-axis**: Average Impact/Severity
- **Y-axis**: Average Likelihood/Frequency  
- **Bubbles**: Positioned by likelihood/impact coordinates
- **Size**: Proportional to count of risks or magnitude
- **Color**: Risk category specific (from your data)
- **Opacity**: Higher risk scores = more prominent display
- **Labels**: Risk category names displayed on bubbles
- **Hover**: Detailed tooltips with all risk metrics

Perfect for risk assessment visualizations, compliance dashboards, and strategic planning!