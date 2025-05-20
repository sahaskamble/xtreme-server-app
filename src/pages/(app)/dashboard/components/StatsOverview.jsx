'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MonitorSmartphone, ShoppingBag, IndianRupee } from "lucide-react"

export default function StatsOverview({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Across all user types
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Gaming Stations</CardTitle>
          <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDevices}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeDevices} currently active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSnacks}</div>
          <p className="text-xs text-muted-foreground">
            {stats.lowStockItems} items low in stock
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹ {stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From all sessions and sales
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
