'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TodaysSummary({ sessions, sessionSnacksLogs, isLoading }) {
  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!sessions || !sessionSnacksLogs) {
      return {
        totalRevenue: 0,
        activeSessions: 0,
        newUsers: 0,
        sessionRevenue: 0,
        snacksRevenue: 0,
        avgSessionTime: '0h 0m'
      }
    }

    // Calculate total revenue (sessions + snacks)
    const sessionRevenue = sessions.reduce((total, session) => {
      return total + (session.session_total || 0)
    }, 0)

    const snacksRevenue = sessionSnacksLogs.reduce((total, log) => {
      return total + (log.price || 0)
    }, 0)

    const totalRevenue = sessionRevenue + snacksRevenue

    // Count active sessions
    const activeSessions = sessions.filter(session =>
      session.status === 'Active' ||
      session.status === 'Occupied' ||
      (!session.out_time && session.in_time)
    ).length

    // Count new users (simplified - using sessions created today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const newUsers = sessions.filter(session => {
      const sessionDate = new Date(session.created)
      return sessionDate >= today
    }).length

    // Calculate average session time
    let totalMinutes = 0
    let completedSessions = 0

    sessions.forEach(session => {
      if (session.in_time && session.out_time) {
        const inTime = new Date(session.in_time)
        const outTime = new Date(session.out_time)
        const durationMinutes = Math.round((outTime - inTime) / (1000 * 60))
        totalMinutes += durationMinutes
        completedSessions++
      }
    })

    const avgMinutes = completedSessions > 0 ? Math.round(totalMinutes / completedSessions) : 0
    const hours = Math.floor(avgMinutes / 60)
    const minutes = avgMinutes % 60
    const avgSessionTime = `${hours}h ${minutes}m`

    return {
      totalRevenue,
      sessionRevenue,
      snacksRevenue,
      activeSessions,
      newUsers,
      avgSessionTime
    }
  }, [sessions, sessionSnacksLogs])

  if (isLoading) {
    return (
      <Card className="h-full bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today's Summary</CardTitle>
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
        <CardTitle className="text-sm font-medium">Today's Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Revenue</span>
          <span className="font-medium">₹{summaryStats.totalRevenue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Active Sessions</span>
          <span className="font-medium">{summaryStats.activeSessions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">New Users</span>
          <span className="font-medium">{summaryStats.newUsers}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Avg Session Time</span>
          <span className="font-medium">{summaryStats.avgSessionTime}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Snacks Revenue</span>
          <span className="font-medium">₹{summaryStats.sessionRevenue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Session Revenue</span>
          <span className="font-medium">₹{summaryStats.snacksRevenue.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
