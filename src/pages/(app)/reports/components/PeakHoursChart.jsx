'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value} users`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function PeakHoursChart({ sessions, isLoading }) {
  // Generate peak hours data from sessions
  const peakHoursData = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return []
    }

    // Helper function to format date as hour
    const formatHour = (date) => {
      const hours = date.getHours()
      return hours === 0 ? '12AM' :
             hours === 12 ? '12PM' :
             hours < 12 ? `${hours}AM` : `${hours-12}PM`
    }

    // Initialize hourly data
    const hourlyData = {}

    // Count sessions by hour
    sessions.forEach(session => {
      if (session.in_time) {
        const date = new Date(session.in_time)
        const hour = formatHour(date)

        hourlyData[hour] = hourlyData[hour] || { hour, users: 0 }
        hourlyData[hour].users += 1
      }
    })

    // Convert to array and sort by hour
    return Object.values(hourlyData).sort((a, b) => {
      // Sort by time (AM/PM format)
      const aHour = a.hour.includes('AM') ?
        (a.hour === '12AM' ? 0 : parseInt(a.hour)) :
        (a.hour === '12PM' ? 12 : parseInt(a.hour) + 12)
      const bHour = b.hour.includes('AM') ?
        (b.hour === '12AM' ? 0 : parseInt(b.hour)) :
        (b.hour === '12PM' ? 12 : parseInt(b.hour) + 12)
      return aHour - bHour
    })
  }, [sessions])

  if (isLoading) {
    return (
      <Card className="h-full bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart
            data={peakHoursData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="users"
              name="Users"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
