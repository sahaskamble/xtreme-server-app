import { Card, CardContent } from "@/components/ui/card"
import { UserCheck, ShoppingCart, Monitor, Package, HardDrive } from "lucide-react"
import { motion } from "framer-motion"

export default function LogsStats({ stats }) {
  const statItems = [
    {
      title: "Login Logs",
      value: stats.loginLogs || 0,
      icon: UserCheck,
      color: "bg-blue-500/10 text-blue-500",
      trend: stats.loginLogsTrend || 0
    },
    {
      title: "Snacks Sales",
      value: stats.snacksSalesLogs || 0,
      icon: ShoppingCart,
      color: "bg-green-500/10 text-green-500",
      trend: stats.snacksSalesLogsTrend || 0
    },
    {
      title: "Snacks Inventory",
      value: stats.snacksMaintenanceLogs || 0,
      icon: Package,
      color: "bg-purple-500/10 text-purple-500",
      trend: stats.snacksMaintenanceLogsTrend || 0
    },
    {
      title: "Session Logs",
      value: stats.sessionLogs || 0,
      icon: Monitor,
      color: "bg-yellow-500/10 text-yellow-500",
      trend: stats.sessionLogsTrend || 0
    },
    {
      title: "Device Logs",
      value: stats.deviceLogs || 0,
      icon: HardDrive,
      color: "bg-red-500/10 text-red-500",
      trend: stats.deviceLogsTrend || 0
    }
  ]

  // Get trend icon and class
  const getTrendIndicator = (trend) => {
    if (trend > 0) {
      return {
        icon: "↑",
        class: "text-green-500"
      }
    } else if (trend < 0) {
      return {
        icon: "↓",
        class: "text-red-500"
      }
    } else {
      return {
        icon: "→",
        class: "text-muted-foreground"
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statItems.map((stat, index) => {
          const trendIndicator = getTrendIndicator(stat.trend)

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
            >
              <Card className="backdrop-blur-sm bg-card/80 border border-border/50 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{stat.value.toLocaleString()}</h3>
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
