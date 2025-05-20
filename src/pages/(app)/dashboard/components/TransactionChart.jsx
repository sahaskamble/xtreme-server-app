'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

// We'll generate data from sessions and snacks

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ₹ ${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function TransactionChart({ sessions, snacks }) {
  // Generate transaction data from sessions and snacks
  const transactionData = [];

  // Get days of the week
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayData = {};

  // Initialize data for each day
  days.forEach(day => {
    dayData[day] = { name: day, gaming: 0, snacks: 0, memberships: 0 };
  });

  // Process session data
  if (sessions && sessions.length > 0) {
    sessions.forEach(session => {
      if (session.in_time) {
        const date = new Date(session.in_time);
        const day = days[date.getDay()];
        dayData[day].gaming += session.session_total || 0;
        dayData[day].snacks += session.snacks_total || 0;
      }
    });
  }

  // Process snack data (assuming snacks have a 'sold' property with timestamp and 'price')
  if (snacks && snacks.length > 0) {
    snacks.forEach(snack => {
      if (snack.sold_at) {
        const date = new Date(snack.sold_at);
        const day = days[date.getDay()];
        dayData[day].snacks += snack.price || 0;
      }
    });
  }

  // Convert to array for chart
  days.forEach(day => {
    transactionData.push(dayData[day]);
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Latest sales and bookings
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={transactionData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="gaming" name="Gaming Sessions" fill="var(--chart-1)" />
            <Bar dataKey="snacks" name="Snack Sales" fill="var(--chart-2)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
