'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

// Custom tooltip for charts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}%`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Custom label for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function DeviceUsageChart({ devices, className }) {
  // Generate chart data from devices
  const deviceUsageData = [];

  if (devices && devices.length > 0) {
    // Count devices by type
    const deviceTypes = {};
    devices.forEach(device => {
      const type = device.type || 'Other';
      deviceTypes[type] = (deviceTypes[type] || 0) + 1;
    });

    // Convert to chart data format
    Object.entries(deviceTypes).forEach(([type, count]) => {
      deviceUsageData.push({
        name: type,
        value: Math.round((count / devices.length) * 100)
      });
    });
  } else {
    // Fallback data if no devices
    deviceUsageData.push(
      { name: 'No Data', value: 100 }
    );
  }
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Device Usage</CardTitle>
        <CardDescription>
          Distribution of gaming station usage
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={deviceUsageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {deviceUsageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
