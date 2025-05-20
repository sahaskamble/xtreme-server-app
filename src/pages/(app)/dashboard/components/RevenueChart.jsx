import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

// We'll generate data from sessions

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ₹${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function RevenueChart({ sessions }) {
  // Generate revenue data from sessions
  const revenueData = [];

  // Get months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthData = {};

  // Initialize data for each month
  months.forEach(month => {
    monthData[month] = { month, revenue: 0 };
  });

  // Process session data
  if (sessions && sessions.length > 0) {
    sessions.forEach(session => {
      if (session.in_time) {
        const date = new Date(session.in_time);
        const month = months[date.getMonth()];
        monthData[month].revenue += session.amount_paid || 0;
      }
    });
  }

  // Convert to array for chart
  months.forEach(month => {
    revenueData.push(monthData[month]);
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trends</CardTitle>
        <CardDescription>
          Monthly revenue breakdown
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
