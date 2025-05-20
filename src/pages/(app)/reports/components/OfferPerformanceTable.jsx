import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function OfferPerformanceTable({ sessions, sessionSnacksLogs, snacks, isLoading }) {
  const [activeTab, setActiveTab] = useState('sessions')

  // Generate performance data from sessions and snacks logs
  const performanceData = useMemo(() => {
    if (!sessions || !sessionSnacksLogs || !snacks) {
      return { sessions: [], snacks: [] }
    }

    // Process session data
    const sessionsByType = {}
    sessions.forEach(session => {
      const deviceType = session.expand?.device?.type || 'Unknown'

      if (!sessionsByType[deviceType]) {
        sessionsByType[deviceType] = {
          id: deviceType,
          name: `${deviceType} Sessions`,
          redemptions: 0,
          revenue: 0,
          conversion: 0
        }
      }

      sessionsByType[deviceType].redemptions += 1
      sessionsByType[deviceType].revenue += (session.session_total || 0)
    })

    // Calculate conversion rates for sessions (simplified)
    Object.values(sessionsByType).forEach(item => {
      const totalSessions = sessions.length
      item.conversion = totalSessions > 0 ? Math.round((item.redemptions / totalSessions) * 100) : 0
    })

    // Process snacks data
    const snacksByType = {}
    sessionSnacksLogs.forEach(log => {
      const snackId = log.snack
      const snackItem = snacks.find(s => s.id === snackId)
      const snackType = snackItem?.type || 'Unknown'

      if (!snacksByType[snackType]) {
        snacksByType[snackType] = {
          id: snackType,
          name: `${snackType} Items`,
          redemptions: 0,
          revenue: 0,
          conversion: 0
        }
      }

      snacksByType[snackType].redemptions += (log.quantity || 0)
      snacksByType[snackType].revenue += (log.price || 0)
    })

    // Calculate conversion rates for snacks (simplified)
    const totalSnacksSold = sessionSnacksLogs.reduce((total, log) => total + (log.quantity || 0), 0)
    Object.values(snacksByType).forEach(item => {
      item.conversion = totalSnacksSold > 0 ? Math.round((item.redemptions / totalSnacksSold) * 100) : 0
    })

    // Process individual snack items
    const snackItems = {}
    sessionSnacksLogs.forEach(log => {
      const snackId = log.snack
      const snackItem = snacks.find(s => s.id === snackId)

      if (!snackItem) return

      if (!snackItems[snackId]) {
        snackItems[snackId] = {
          id: snackId,
          name: snackItem.name || `Snack #${snackId}`,
          redemptions: 0,
          revenue: 0,
          conversion: 0
        }
      }

      snackItems[snackId].redemptions += (log.quantity || 0)
      snackItems[snackId].revenue += (log.price || 0)
    })

    // Calculate conversion rates for individual snacks
    Object.values(snackItems).forEach(item => {
      item.conversion = totalSnacksSold > 0 ? Math.round((item.redemptions / totalSnacksSold) * 100) : 0
    })

    return {
      sessions: Object.values(sessionsByType).sort((a, b) => b.revenue - a.revenue),
      snackTypes: Object.values(snacksByType).sort((a, b) => b.revenue - a.revenue),
      snackItems: Object.values(snackItems).sort((a, b) => b.revenue - a.revenue)
    }
  }, [sessions, sessionSnacksLogs, snacks])

  if (isLoading) {
    return (
      <Card className="bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sales Performance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sales Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="sessions">Gaming Sessions</TabsTrigger>
            <TabsTrigger value="snackTypes">Snack Categories</TabsTrigger>
            <TabsTrigger value="snackItems">Individual Snacks</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            <PerformanceTable data={performanceData.sessions} />
          </TabsContent>

          <TabsContent value="snackTypes">
            <PerformanceTable data={performanceData.snackTypes} />
          </TabsContent>

          <TabsContent value="snackItems">
            <PerformanceTable data={performanceData.snackItems} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Reusable table component
function PerformanceTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No performance data available
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Quantity Sold</TableHead>
          <TableHead>Revenue</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.redemptions}</TableCell>
            <TableCell>₹{item.revenue.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
