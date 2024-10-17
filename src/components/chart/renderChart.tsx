import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
} from 'recharts';


interface BarChartDataPoint {
  category: string;
  [key: string]: string | number;
}

export interface ChartData<T> {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: T[];
  type: ChartType;
}
export interface ScatterPlotDataPoint {
  x: number;
  y: number;
  category: string;
}

export type BarChartData = ChartData<BarChartDataPoint>;
export type ScatterPlotChartData = ChartData<ScatterPlotDataPoint>;

export const barChartDataPoint: BarChartDataPoint[] = [
    { category: 'January', desktop: 186, mobile: 80 },
    { category: 'February', desktop: 305, mobile: 200 },
    { category: 'March', desktop: 237, mobile: 120 },
    { category: 'April', desktop: 73, mobile: 190 },
    { category: 'May', desktop: 209, mobile: 130 },
    { category: 'June', desktop: 214, mobile: 140 },
]
export enum ChartType {
  BAR = 'bar',
  SCATTER = 'scatter',
  LINE = 'line',
  PIE = 'pie',
  AREA = 'area',
}

export const barChartData: BarChartData = {
    title: 'Desktop vs Mobile Users',
    xAxisLabel: 'Month',
    yAxisLabel: 'Number of Users',
    data: barChartDataPoint,
    type: ChartType.BAR,
}

export const scatterPlotDataPoint: ScatterPlotDataPoint[] = [
  { x: 100, y: 200, category: 'A' },
  { x: 120, y: 100, category: 'B' },
  { x: 170, y: 300, category: 'C' },
  { x: 140, y: 250, category: 'A' },
  { x: 150, y: 400, category: 'B' },
  { x: 110, y: 280, category: 'C' },
];

export const scatterPlotChartData: ScatterPlotChartData = {
  title: 'Sample Scatter Plot',
  xAxisLabel: 'X Axis',
  yAxisLabel: 'Y Axis',
  data: scatterPlotDataPoint,
  type: ChartType.SCATTER,
};

export function renderChart(
  chartData: BarChartData | ScatterPlotChartData
): React.ReactNode {
  const isBarChart = (
    data: BarChartData | ScatterPlotChartData
  ): data is BarChartData => {
    return data.type === ChartType.BAR;
  };
  // Get all keys except 'category' to use as data keys for bars
  const dataKeys = Object.keys(chartData.data[0]).filter(key => key !== 'category');
  if (isBarChart(chartData)) {
    // Generate a random color for each data key
    const colors = dataKeys.reduce((acc, key) => {
        acc[key] = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        return acc;
    }, {} as {[key: string]: string});

    return (
        <ResponsiveContainer width="100%" height={500}>
        <BarChart
            data={chartData.data}
            margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
            dataKey="category"
            label={{ value: chartData.xAxisLabel, position: 'insideBottom', offset: -5 }}
            />
            <YAxis
            label={{ value: chartData.yAxisLabel, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend />
            {dataKeys.map((key) => (
            <Bar key={key} dataKey={key} fill={colors[key]} />
            ))}
            <text
            x={300}
            y={10}
            fill="#000"
            textAnchor="middle"
            dominantBaseline="central"
            >
            <tspan fontSize="24">{chartData.title}</tspan>
            </text>
        </BarChart>
        </ResponsiveContainer>
    );
  }
  else {
    // ScatterPlot implementation
    return (
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name={chartData.xAxisLabel}
            label={{
              value: chartData.xAxisLabel,
              position: 'insideBottom',
              offset: -5,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={chartData.yAxisLabel}
            label={{
              value: chartData.yAxisLabel,
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter
            name={chartData.title}
            data={chartData.data}
            fill="#8884d8"
          />
          <text
            x={300}
            y={10}
            fill="#000"
            textAnchor="middle"
            dominantBaseline="central"
          >
            <tspan fontSize="24">{chartData.title}</tspan>
          </text>
        </ScatterChart>
      </ResponsiveContainer>
    );
  }
}
