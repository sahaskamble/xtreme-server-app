'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ₹${entry.value.toFixed(2)}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function RevenueOverviewChart({ sessions, sessionSnacksLogs, isLoading }) {
  const [timeframe, setTimeframe] = useState('today')

  // Generate revenue data from sessions and snacks logs
  const revenueData = useMemo(() => {
    if (!sessions || !sessionSnacksLogs) {
      return { today: [], week: [], month: [] }
    }

    // Helper function to format date as hour
    const formatHour = (date) => {
      const hours = date.getHours()
      return hours === 0 ? '12AM' :
        hours === 12 ? '12PM' :
          hours < 12 ? `${hours}AM` : `${hours - 12}PM`
    }

    // Helper function to get day of week
    const getDayOfWeek = (date) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return days[date.getDay()]
    }

    // Helper function to get week of month
    const getWeekOfMonth = (date) => {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
      return Math.ceil((date.getDate() + firstDay) / 7)
    }

    // Initialize data structures
    const hourlyData = {}
    const dailyData = {}
    const weeklyData = {}

    // Process session revenue
    sessions.forEach(session => {
      const date = new Date(session.created)
      const hour = formatHour(date)
      const day = getDayOfWeek(date)
      const week = `Week ${getWeekOfMonth(date)}`

      // Session revenue
      const sessionRevenue = session.session_total || 0

      // Hourly data (today)
      hourlyData[hour] = hourlyData[hour] || { time: hour, sessionRevenue: 0, snacksRevenue: 0 }
      hourlyData[hour].sessionRevenue += sessionRevenue

      // Daily data (week)
      dailyData[day] = dailyData[day] || { time: day, sessionRevenue: 0, snacksRevenue: 0 }
      dailyData[day].sessionRevenue += sessionRevenue

      // Weekly data (month)
      weeklyData[week] = weeklyData[week] || { time: week, sessionRevenue: 0, snacksRevenue: 0 }
      weeklyData[week].sessionRevenue += sessionRevenue
    })

    // Process snacks revenue
    sessionSnacksLogs.forEach(log => {
      const date = new Date(log.created)
      const hour = formatHour(date)
      const day = getDayOfWeek(date)
      const week = `Week ${getWeekOfMonth(date)}`

      // Snack revenue
      const snackRevenue = log.price || 0

      // Hourly data (today)
      hourlyData[hour] = hourlyData[hour] || { time: hour, sessionRevenue: 0, snacksRevenue: 0 }
      hourlyData[hour].snacksRevenue += snackRevenue

      // Daily data (week)
      dailyData[day] = dailyData[day] || { time: day, sessionRevenue: 0, snacksRevenue: 0 }
      dailyData[day].snacksRevenue += snackRevenue

      // Weekly data (month)
      weeklyData[week] = weeklyData[week] || { time: week, sessionRevenue: 0, snacksRevenue: 0 }
      weeklyData[week].snacksRevenue += snackRevenue
    })

    // Convert to arrays and calculate total revenue
    const today = Object.values(hourlyData).map(item => ({
      ...item,
      revenue: item.sessionRevenue + item.snacksRevenue
    })).sort((a, b) => {
      // Sort by time (AM/PM format)
      const aHour = a.time.includes('AM') ?
        (a.time === '12AM' ? 0 : parseInt(a.time)) :
        (a.time === '12PM' ? 12 : parseInt(a.time) + 12)
      const bHour = b.time.includes('AM') ?
        (b.time === '12AM' ? 0 : parseInt(b.time)) :
        (b.time === '12PM' ? 12 : parseInt(b.time) + 12)
      return aHour - bHour
    })

    // Sort days of week
    const daysOrder = { 'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6 }
    const week = Object.values(dailyData).map(item => ({
      ...item,
      revenue: item.sessionRevenue + item.snacksRevenue
    })).sort((a, b) => daysOrder[a.time] - daysOrder[b.time])

    // Sort weeks
    const month = Object.values(weeklyData).map(item => ({
      ...item,
      revenue: item.sessionRevenue + item.snacksRevenue
    })).sort((a, b) => parseInt(a.time.split(' ')[1]) - parseInt(b.time.split(' ')[1]))

    return { today, week, month }
  }, [sessions, sessionSnacksLogs])

  if (isLoading) {
    return (
      <Card className="h-full bg-card text-card-foreground">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>
          <Select value={timeframe} onValueChange={setTimeframe} disabled>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-card text-card-foreground">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart
            data={revenueData[timeframe]}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
            <Area
              type="monotone"
              dataKey="sessionRevenue"
              name="Sessions"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.3}
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="snacksRevenue"
              name="Snacks"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.3}
              stackId="1"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Total"
              stroke="var(--chart-4)"
              fill="var(--chart-4)"
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
