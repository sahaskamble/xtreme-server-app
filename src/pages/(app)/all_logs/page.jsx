import { useState, useCallback, useEffect } from "react"
import { toast } from "sonner"

// Import our custom components
import LogsHeader from "./components/LogsHeader"
import LogsActivityChart from "./components/LogsActivityChart"
import LogsStats from "./components/LogsStats"
import LogsTabsContainer from "./components/LogsTabsContainer"

// Import PocketBase hooks
import { useRealTime } from "@/hooks/useRealTime"

export default function LogsPage() {
	// State for filters
	const [filters, setFilters] = useState(() => {
		// Initialize with today's date range
		const today = new Date()
		const startOfDay = new Date(today)
		startOfDay.setHours(0, 0, 0, 0)

		const endOfDay = new Date(today)
		endOfDay.setHours(23, 59, 59, 999)

		return {
			search: "",
			type: "all",
			dateRange: {
				from: startOfDay,
				to: endOfDay
			}
		}
	})

	// Fetch data from PocketBase collections
	const { data: loginLogs, loading: loginLogsLoading } = useRealTime('login_logs', {
		queryParams: {
			sort: '-created',
			expand: 'user'
		}
	})

	const { data: sessionSnacksLogs, loading: snacksLogsLoading } = useRealTime('session_snacks_logs', {
		queryParams: {
			sort: '-created',
			expand: 'session,snack,session.device'
		}
	})

	const { data: snacksLogs, loading: inventoryLogsLoading } = useRealTime('inventory_logs', {
		queryParams: {
			sort: '-created',
			expand: 'inventory_id,user'
		}
	})

	const { data: sessionLogs, loading: sessionLogsLoading } = useRealTime('session_logs', {
		queryParams: {
			sort: '-created',
			expand: 'session_id,billed_by'
		}
	})

	const { data: deviceLogs, loading: deviceLogsLoading } = useRealTime('device_logs', {
		queryParams: {
			sort: '-created',
			expand: 'device,user'
		}
	})

	// State for filtered logs
	const [filteredLogs, setFilteredLogs] = useState({
		loginLogs: [],
		snacksSalesLogs: [],
		snacksMaintenanceLogs: [],
		sessionLogs: [],
		deviceLogs: []
	})

	// Process and format the data from PocketBase
	const processLoginLogs = (logs) => {
		if (!logs) return []
		console.log(logs);
		return logs.map(log => ({
			user: log.expand?.user?.name || 'Unknown User',
			login: log?.login,
			logout: log?.logout,
			timestamp: log?.created,
			// ...log,
		}))
	}

	// Process sales logs (session_snacks_logs)
	const processSnacksSalesLogs = (logs) => {
		if (!logs) return []
		return logs.map(log => ({
			item: log.expand?.snack?.name || 'Unknown Item',
			action: 'Sale',
			quantity: log.quantity || 0,
			price: `Rs. ${log.price}` || 0,
			status: '-',
			timestamp: log.created,
			order: `ORD_${log.session?.slice(0, 10)}` || 'Unknown User',
			details: `Sold ${log.quantity || 0} ${log.expand?.snack?.name || 'items'} for Rs. ${log.each_price || 0}`
		}))
	}

	// Process maintenance logs (snacks_logs)
	const processSnacksMaintenanceLogs = (logs) => {
		if (!logs) return []
		return logs.map(log => ({
			item: log.expand?.snack_id?.name || 'Unknown Item',
			activity: log.status || 'Stock Update',
			quantity: `${log.quantity || 0} pcs`,
			timestamp: log.created,
			user: log.expand?.user?.name || 'User',
			details: log.reason || `${log.status || 'Updated'} ${log.quantity || 0} items`
		}))
	}

	const processSessionLogs = (logs) => {
		if (!logs) return []
		return logs.map(log => ({
			'billed By': log.expand?.billed_by?.name || 'System',
			type: log.type || 'Session',
			amount: log.session_amount || 0,
			timestamp: log.created,
			details: `Session ${log.type || 'updated'} at Amount: Rs. ${log.session_amount || 0}`
		}))
	}

	// Process device logs
	const processDeviceLogs = (logs) => {
		if (!logs) return []
		return logs.map(log => ({
			device: log.expand?.device?.name || 'Unknown Device',
			status: log.status || 'Status Change',
			user: log.expand?.user?.name || 'System',
			details: log.details || `Device status changed to ${log.status}`,
			timestamp: log.created
		}))
	}

	// Generate chart data based on logs
	const generateChartData = useCallback(() => {
		// Skip if data is still loading
		if (loginLogsLoading || snacksLogsLoading || inventoryLogsLoading || sessionLogsLoading || deviceLogsLoading) {
			return [
				{ hour: '00:00', logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0 },
				{ hour: '04:00', logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0 },
				{ hour: '08:00', logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0 },
				{ hour: '12:00', logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0 },
				{ hour: '16:00', logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0 },
				{ hour: '20:00', logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0 },
			]
		}

		// Initialize data structure
		const hourlyData = {
			'00:00': { logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0, devices: 0 },
			'04:00': { logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0, devices: 0 },
			'08:00': { logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0, devices: 0 },
			'12:00': { logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0, devices: 0 },
			'16:00': { logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0, devices: 0 },
			'20:00': { logins: 0, snacksSales: 0, snacksMaintenance: 0, sessions: 0, devices: 0 },
		}

		// Count login logs by hour
		loginLogs?.forEach(log => {
			const date = new Date(log.created)
			const hour = date.getHours()
			let timeSlot = '00:00'

			if (hour >= 4 && hour < 8) timeSlot = '04:00'
			else if (hour >= 8 && hour < 12) timeSlot = '08:00'
			else if (hour >= 12 && hour < 16) timeSlot = '12:00'
			else if (hour >= 16 && hour < 20) timeSlot = '16:00'
			else if (hour >= 20) timeSlot = '20:00'

			hourlyData[timeSlot].logins++
		})

		// Count snacks sales logs by hour (session_snacks_logs)
		sessionSnacksLogs?.forEach(log => {
			const date = new Date(log.created)
			const hour = date.getHours()
			let timeSlot = '00:00'

			if (hour >= 4 && hour < 8) timeSlot = '04:00'
			else if (hour >= 8 && hour < 12) timeSlot = '08:00'
			else if (hour >= 12 && hour < 16) timeSlot = '12:00'
			else if (hour >= 16 && hour < 20) timeSlot = '16:00'
			else if (hour >= 20) timeSlot = '20:00'

			hourlyData[timeSlot].snacksSales++
		})

		// Count snacks maintenance logs by hour (snacks_logs)
		snacksLogs?.forEach(log => {
			const date = new Date(log.created)
			const hour = date.getHours()
			let timeSlot = '00:00'

			if (hour >= 4 && hour < 8) timeSlot = '04:00'
			else if (hour >= 8 && hour < 12) timeSlot = '08:00'
			else if (hour >= 12 && hour < 16) timeSlot = '12:00'
			else if (hour >= 16 && hour < 20) timeSlot = '16:00'
			else if (hour >= 20) timeSlot = '20:00'

			hourlyData[timeSlot].snacksMaintenance++
		})

		// Count session logs by hour
		sessionLogs?.forEach(log => {
			const date = new Date(log.created)
			const hour = date.getHours()
			let timeSlot = '00:00'

			if (hour >= 4 && hour < 8) timeSlot = '04:00'
			else if (hour >= 8 && hour < 12) timeSlot = '08:00'
			else if (hour >= 12 && hour < 16) timeSlot = '12:00'
			else if (hour >= 16 && hour < 20) timeSlot = '16:00'
			else if (hour >= 20) timeSlot = '20:00'

			hourlyData[timeSlot].sessions++
		})

		// Count device logs by hour
		deviceLogs?.forEach(log => {
			const date = new Date(log.created)
			const hour = date.getHours()
			let timeSlot = '00:00'

			if (hour >= 4 && hour < 8) timeSlot = '04:00'
			else if (hour >= 8 && hour < 12) timeSlot = '08:00'
			else if (hour >= 12 && hour < 16) timeSlot = '12:00'
			else if (hour >= 16 && hour < 20) timeSlot = '16:00'
			else if (hour >= 20) timeSlot = '20:00'

			hourlyData[timeSlot].devices++
		})

		// Convert to array format for chart
		return Object.entries(hourlyData).map(([hour, counts]) => ({
			hour,
			logins: counts.logins,
			snacksSales: counts.snacksSales,
			snacksMaintenance: counts.snacksMaintenance,
			sessions: counts.sessions,
			devices: counts.devices
		}))
	}, [loginLogs, sessionSnacksLogs, snacksLogs, sessionLogs, deviceLogs, loginLogsLoading, snacksLogsLoading, inventoryLogsLoading, sessionLogsLoading, deviceLogsLoading])

	// Chart data for log activity
	const logActivityData = generateChartData()

	// Stats data with trends
	const statsData = {
		loginLogs: loginLogs?.length || 0,
		loginLogsTrend: 5,
		snacksSalesLogs: sessionSnacksLogs?.length || 0,
		snacksSalesLogsTrend: 10,
		snacksMaintenanceLogs: snacksLogs?.length || 0,
		snacksMaintenanceLogsTrend: 6,
		sessionLogs: sessionLogs?.length || 0,
		sessionLogsTrend: 12,
		deviceLogs: deviceLogs?.length || 0,
		deviceLogsTrend: 8
	}

	// Handle filter changes
	const handleFilterChange = useCallback((dateRange) => {
		console.log('Date filter changed:', dateRange);
		setFilters(prev => ({
			...prev,
			dateRange: {
				from: dateRange.from,
				to: dateRange.to
			}
		}))
	}, [])

	// Handle refresh
	const handleRefresh = useCallback(() => {
		// Reload the data from PocketBase
		window.location.reload()
		toast.success("Logs refreshed successfully")
	}, [])

	// Process and filter logs based on date range and search
	useEffect(() => {
		// Skip if data is still loading
		if (loginLogsLoading || snacksLogsLoading || inventoryLogsLoading || sessionLogsLoading || deviceLogsLoading) {
			return
		}

		// Process the logs
		const processedLoginLogs = processLoginLogs(loginLogs)
		const processedSnacksSalesLogs = processSnacksSalesLogs(sessionSnacksLogs || [])
		const processedSnacksMaintenanceLogs = processSnacksMaintenanceLogs(snacksLogs || [])
		const processedSessionLogs = processSessionLogs(sessionLogs)
		const processedDeviceLogs = processDeviceLogs(deviceLogs || [])

		// Apply date filtering if needed
		const fromDate = new Date(filters.dateRange.from)
		const toDate = new Date(filters.dateRange.to)

		console.log('Filtering logs with date range:', {
			from: fromDate.toISOString(),
			to: toDate.toISOString()
		})

		// Make sure we have valid dates
		if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
			console.error('Invalid date range for filtering:', filters.dateRange)
			setFilteredLogs({
				loginLogs: processedLoginLogs,
				snacksSalesLogs: processedSnacksSalesLogs,
				snacksMaintenanceLogs: processedSnacksMaintenanceLogs,
				sessionLogs: processedSessionLogs
			})
			return
		}

		const filteredLoginLogs = processedLoginLogs.filter(log => {
			try {
				const logDate = new Date(log.timestamp)
				if (isNaN(logDate.getTime())) return false
				return logDate >= fromDate && logDate <= toDate
			} catch (error) {
				console.error('Error filtering login log:', error)
				return false
			}
		})

		const filteredSnacksSalesLogs = processedSnacksSalesLogs.filter(log => {
			try {
				const logDate = new Date(log.timestamp)
				if (isNaN(logDate.getTime())) return false
				return logDate >= fromDate && logDate <= toDate
			} catch (error) {
				console.error('Error filtering snacks sales log:', error)
				return false
			}
		})

		const filteredSnacksMaintenanceLogs = processedSnacksMaintenanceLogs.filter(log => {
			try {
				const logDate = new Date(log.timestamp)
				if (isNaN(logDate.getTime())) return false
				return logDate >= fromDate && logDate <= toDate
			} catch (error) {
				console.error('Error filtering snacks maintenance log:', error)
				return false
			}
		})

		const filteredSessionLogs = processedSessionLogs.filter(log => {
			try {
				const logDate = new Date(log.timestamp)
				if (isNaN(logDate.getTime())) return false
				return logDate >= fromDate && logDate <= toDate
			} catch (error) {
				console.error('Error filtering session log:', error)
				return false
			}
		})

		const filteredDeviceLogs = processedDeviceLogs.filter(log => {
			try {
				const logDate = new Date(log.timestamp)
				if (isNaN(logDate.getTime())) return false
				return logDate >= fromDate && logDate <= toDate
			} catch (error) {
				console.error('Error filtering device log:', error)
				return false
			}
		})

		console.log('Filtered logs counts:', {
			loginLogs: filteredLoginLogs.length,
			snacksSalesLogs: filteredSnacksSalesLogs.length,
			snacksMaintenanceLogs: filteredSnacksMaintenanceLogs.length,
			sessionLogs: filteredSessionLogs.length,
			deviceLogs: filteredDeviceLogs.length
		})

		// Update the filtered logs state
		setFilteredLogs({
			loginLogs: filteredLoginLogs,
			snacksSalesLogs: filteredSnacksSalesLogs,
			snacksMaintenanceLogs: filteredSnacksMaintenanceLogs,
			sessionLogs: filteredSessionLogs,
			deviceLogs: filteredDeviceLogs
		})
	}, [loginLogs, sessionSnacksLogs, snacksLogs, sessionLogs, deviceLogs, filters.dateRange, loginLogsLoading, snacksLogsLoading, inventoryLogsLoading, sessionLogsLoading, deviceLogsLoading])

	return (
		<div className="p-6 space-y-6 bg-gradient-to-b from-background to-background/80 min-h-screen">
			{/* Header */}
			<LogsHeader onRefresh={handleRefresh} handleDateFilterChange={handleFilterChange} />

			{/* Stats Overview */}
			<LogsStats stats={statsData} />

			{/* Activity Chart */}
			<LogsActivityChart data={logActivityData} />

			{/* Logs Tabs and Tables */}
			<LogsTabsContainer
				loginLogs={filteredLogs.loginLogs}
				snacksSalesLogs={filteredLogs.snacksSalesLogs}
				snacksMaintenanceLogs={filteredLogs.snacksMaintenanceLogs}
				sessionLogs={filteredLogs.sessionLogs}
				deviceLogs={filteredLogs.deviceLogs}
			/>
		</div>
	)
}

