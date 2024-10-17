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

export const renderChart = () => {
  const chartData = [
    { month: 'January', desktop: 186, mobile: 80 },
    { month: 'February', desktop: 305, mobile: 200 },
    { month: 'March', desktop: 237, mobile: 120 },
    { month: 'April', desktop: 73, mobile: 190 },
    { month: 'May', desktop: 209, mobile: 130 },
    { month: 'June', desktop: 214, mobile: 140 },
  ];

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis
          dataKey="month"
          label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
        />
        <YAxis
          label={{ value: 'Number of Users', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="desktop" fill="#8884d8" />
        <Bar dataKey="mobile" fill="#82ca9d" />
        <text
          x={550}
          y={10}
          fill="#000"
          textAnchor="middle"
          dominantBaseline="central"
        >
          <tspan fontSize="24">Desktop vs Mobile Users</tspan>
        </text>
      </BarChart>
    </ResponsiveContainer>
  );
};