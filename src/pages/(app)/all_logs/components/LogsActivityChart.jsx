'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { motion } from "framer-motion"

export default function LogsActivityChart({ data }) {
  const [chartType, setChartType] = useState("line")

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 backdrop-blur-sm p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-1">{`Time: ${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <p className="text-sm">
                  {`${entry.name}: ${entry.value}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="backdrop-blur-sm bg-card/80 border border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Log Activity</CardTitle>
              <CardDescription>
                Number of log entries over time
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setChartType("line")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  chartType === "line"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  chartType === "area"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Area
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-80 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSnacksSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSnacksMaintenance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a569bd" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a569bd" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="logins"
                  name="Login Logs"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="snacksSales"
                  name="Snacks Sales"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="snacksMaintenance"
                  name="Snacks Inventory"
                  stroke="#a569bd"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  name="Session Logs"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="devices"
                  name="Device Logs"
                  stroke="#ff6b6b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            ) : (
              <AreaChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSnacksSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSnacksMaintenance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a569bd" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a569bd" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="logins"
                  name="Login Logs"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorLogins)"
                />
                <Area
                  type="monotone"
                  dataKey="snacksSales"
                  name="Snacks Sales"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorSnacksSales)"
                />
                <Area
                  type="monotone"
                  dataKey="snacksMaintenance"
                  name="Snacks Inventory"
                  stroke="#a569bd"
                  fillOpacity={1}
                  fill="url(#colorSnacksMaintenance)"
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  name="Session Logs"
                  stroke="#ffc658"
                  fillOpacity={1}
                  fill="url(#colorSessions)"
                />
                <Area
                  type="monotone"
                  dataKey="devices"
                  name="Device Logs"
                  stroke="#ff6b6b"
                  fillOpacity={1}
                  fill="url(#colorDevices)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  )
}
