import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"

// We'll generate data from users

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function UserGrowthChart({ users }) {
  // Generate user growth data
  const userGrowthData = [];

  // Get months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthData = {};

  // Get current date to limit future projections
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  // Initialize data for each month
  months.forEach(month => {
    monthData[month] = { month, users: 0 };
  });

  // Process user data - we'll count users by their creation date
  if (users && users.length > 0) {
    // Sort users by creation date
    const sortedUsers = [...users].sort((a, b) => {
      return new Date(a.created) - new Date(b.created);
    });

    // Count cumulative users by month
    let runningTotal = 0;
    sortedUsers.forEach(user => {
      if (user.created) {
        const date = new Date(user.created);
        const month = months[date.getMonth()];
        runningTotal++;

        // Only update months up to the current month
        const monthIndex = date.getMonth();
        for (let i = monthIndex; i <= currentMonth; i++) {
          monthData[months[i]].users = Math.max(monthData[months[i]].users, runningTotal);
        }
      }
    });
  }

  // Convert to array for chart and add a property to indicate future months
  months.forEach((month, index) => {
    const monthObj = monthData[month];
    // Add a property to indicate if this is a future month
    monthObj.isFuture = index > currentMonth;
    userGrowthData.push(monthObj);
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>
          New user registrations over time
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={userGrowthData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {/* Line for actual data */}
            <Line
              type="monotone"
              dataKey="users"
              name="Users"
              stroke="var(--chart-2)"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />

            {/* Add a reference line for the current month */}
            <ReferenceLine
              x={months[currentDate.getMonth()]}
              stroke="var(--chart-4)"
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
