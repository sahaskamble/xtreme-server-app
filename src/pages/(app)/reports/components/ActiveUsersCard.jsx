import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"

export default function ActiveUsersCard({ sessions, isLoading }) {
  // Calculate active users and trend
  const { activeUsers, trend } = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return { activeUsers: 0, trend: 0 }
    }

    // Count sessions with status 'Active' or 'Occupied'
    const active = sessions.filter(session =>
      session.status === 'Active' ||
      session.status === 'Occupied' ||
      (!session.out_time && session.in_time)
    ).length

    // Calculate trend (simplified for demo)
    // In a real app, you would compare with previous period
    const trend = sessions.length > 0 ? Math.round((active / sessions.length) * 100) : 0

    return { activeUsers: active, trend }
  }, [sessions])

  // Determine trend direction and color
  const isTrendPositive = trend >= 0
  const trendColor = isTrendPositive ? 'text-emerald-500' : 'text-red-500'
  const TrendIcon = isTrendPositive ? TrendingUp : TrendingDown

  if (isLoading) {
    return (
      <Card className="h-auto bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-auto bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{activeUsers}</div>
        <div className={`flex items-center mt-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3 mr-1" />
          <span>{Math.abs(trend)}% from total sessions</span>
        </div>
      </CardContent>
    </Card>
  )
}
