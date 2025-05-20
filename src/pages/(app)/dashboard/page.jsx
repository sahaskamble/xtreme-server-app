import { useEffect, useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRealTime } from "@/hooks/useRealTime"
import { useAuth } from "@/contexts/AuthContext"
import { isWithinInterval } from "date-fns"
import ProfitProgressBar from "@/components/ProfitProgressBar"

// Import components
import StatsOverview from "./components/StatsOverview"
import ActiveSessions from "./components/ActiveSessions"
import RecentLogins from "./components/RecentLogins"
import TransactionChart from "./components/TransactionChart"
import RevenueChart from "./components/RevenueChart"
import UserGrowthChart from "./components/UserGrowthChart"
import DeviceUsageChart from "./components/DeviceUsageChart"
import DateFilter from "./components/DateFilter"

export default function DashboardPage() {
	const { currentUser } = useAuth()
	const { data: users } = useRealTime('xtreme_users')
	const { data: devices } = useRealTime('devices')
	const { data: sessions } = useRealTime('sessions', {
		queryParams: { expand: 'device' }
	})
	const { data: snacks } = useRealTime('inventory')
	const { data: loginLogs } = useRealTime('login_logs', {
		queryParams: { sort: '-created', expand: 'user' }
	})

	// State for date filtering
	const [dateRange, setDateRange] = useState({
		from: new Date(),
		to: new Date()
	})

	// Filtered data based on date range
	const [filteredSessions, setFilteredSessions] = useState([])
	const [filteredLoginLogs, setFilteredLoginLogs] = useState([])

	const [stats, setStats] = useState({
		totalUsers: 0,
		totalDevices: 0,
		activeDevices: 0,
		totalSnacks: 0,
		lowStockItems: 0,
		activeSessions: 0,
		totalRevenue: 0
	})

	// Handle date filter changes
	const handleDateFilterChange = useCallback((newDateRange) => {
		setDateRange(newDateRange)
	}, [])

	// Filter data based on date range
	useEffect(() => {
		if (sessions) {
			const filtered = sessions.filter(session => {
				const sessionDate = new Date(session.in_time)
				return isWithinInterval(sessionDate, { start: dateRange.from, end: dateRange.to })
			})
			setFilteredSessions(filtered)
		}

		if (loginLogs) {
			const filtered = loginLogs.filter(log => {
				const logDate = new Date(log.created)
				return isWithinInterval(logDate, { start: dateRange.from, end: dateRange.to })
			})
			setFilteredLoginLogs(filtered)
		}
	}, [sessions, loginLogs, dateRange])

	// Calculate dashboard stats
	useEffect(() => {
		if (users && devices && snacks && filteredSessions) {
			setStats({
				totalUsers: users.length,
				totalDevices: devices.length,
				activeDevices: devices.filter(device => device.status === 'Occupied').length,
				totalSnacks: snacks.length,
				lowStockItems: snacks.filter(snack => snack.status === 'Low Stock').length,
				activeSessions: filteredSessions.length,
				totalRevenue: filteredSessions.reduce((total, session) => total + (session.amount_paid || 0), 0)
			})
		}
	}, [users, devices, snacks, filteredSessions])

	return (
		<div className="p-6 space-y-6">
			{/* Profit Progress Bar - Moved to top */}
			<ProfitProgressBar
				currentProfit={stats.totalRevenue}
				targetProfit={100000}
				title="Monthly Profit Target"
				description="Track your monthly profit goals"
			/>

			<div className="flex items-center justify-between mt-6">
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<div className="flex items-center gap-4">
					<DateFilter onFilterChange={handleDateFilterChange} />
					<p className="text-muted-foreground">
						Welcome back, {currentUser?.name || 'User'}
					</p>
				</div>
			</div>

			{/* Stats Overview */}
			<StatsOverview stats={stats} />

			{/* Tabs for different dashboard sections */}
			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="activity">Recent Activity</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4 grid gap-4">
					{/* Station Usage */}
					<DeviceUsageChart devices={devices} className='' />

					{/* Active Sessions */}
					<ActiveSessions sessions={filteredSessions} />
				</TabsContent>

				<TabsContent value="activity" className="space-y-4">
					<TransactionChart sessions={filteredSessions} snacks={snacks} />
					<RecentLogins loginLogs={filteredLoginLogs} />
				</TabsContent>

				<TabsContent value="analytics" className="space-y-4">
					<RevenueChart sessions={filteredSessions} />

					<UserGrowthChart users={users} />
				</TabsContent>
			</Tabs>
		</div>
	)
}
