import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, ShoppingCart, Monitor, Package, HardDrive } from "lucide-react"
import { motion } from "framer-motion"
import { default as LoginTable } from "./LoginTable.jsx"
import { default as SnacksSalesTable } from "./SnacksSalesTable.jsx"
import { default as SnacksMaintenanceTable } from "./SnacksMaintenanceTable.jsx"
import { default as SessionTable } from "./SessionTable.jsx"
import { default as DeviceLogsTable } from "./DeviceLogsTable.jsx"

export default function LogsTabsContainer({
  loginLogs,
  snacksSalesLogs,
  snacksMaintenanceLogs,
  sessionLogs,
  deviceLogs
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Tabs defaultValue="login" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="login" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Login Logs</span>
          </TabsTrigger>
          <TabsTrigger value="snacksSales" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Snacks Sales</span>
          </TabsTrigger>
          <TabsTrigger value="snacksMaintenance" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Inventory Logs</span>
          </TabsTrigger>
          <TabsTrigger value="session" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Session Logs</span>
          </TabsTrigger>
          <TabsTrigger value="device" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>Device Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-6">
          <LoginTable data={loginLogs} />
          {/*
          <LogsTable
            title="Login Logs"
            description="User login activity and authentication events"
            logs={loginLogs}
            searchColumn="user"
            searchPlaceholder="Search by user..."
            exportFileName="LoginLogs.pdf"
          />
          */}
        </TabsContent>

        <TabsContent value="snacksSales" className="space-y-6">
          <SnacksSalesTable data={snacksSalesLogs} />
        </TabsContent>

        <TabsContent value="snacksMaintenance" className="space-y-6">
          <SnacksMaintenanceTable data={snacksMaintenanceLogs} />
        </TabsContent>

        <TabsContent value="session" className="space-y-6">
          <SessionTable data={sessionLogs} />
        </TabsContent>

        <TabsContent value="device" className="space-y-6">
          <DeviceLogsTable data={deviceLogs} />
        </TabsContent>

      </Tabs>
    </motion.div>
  )
}
