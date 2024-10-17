import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


interface BarChartDataPoint {
  category: string;
  [key: string]: string | number;
}

export interface ChartData {
    title: string;
    xAxisLabel: string;
    yAxisLabel: string;
    data: BarChartDataPoint[];
}



export const barChartDataPoint: BarChartDataPoint[] = [
    { category: 'January', desktop: 186, mobile: 80 },
    { category: 'February', desktop: 305, mobile: 200 },
    { category: 'March', desktop: 237, mobile: 120 },
    { category: 'April', desktop: 73, mobile: 190 },
    { category: 'May', desktop: 209, mobile: 130 },
    { category: 'June', desktop: 214, mobile: 140 },
]

export const barChartData: ChartData = {
    title: 'Desktop vs Mobile Users',
    xAxisLabel: 'Month',
    yAxisLabel: 'Number of Users',
    data: barChartDataPoint,
}

export function renderBarChart(
  chartData: ChartData
): React.ReactNode {
  // Get all keys except 'category' to use as data keys for bars
  const dataKeys = Object.keys(chartData.data[0]).filter(key => key !== 'category');

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
