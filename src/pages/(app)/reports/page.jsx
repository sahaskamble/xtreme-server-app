import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'
import DateFilter from "../dashboard/components/DateFilter"
import ActiveUsersCard from "./components/ActiveUsersCard"
import PeakHoursChart from "./components/PeakHoursChart"
import RevenueOverviewChart from "./components/RevenueOverviewChart"
import TodaysSummary from "./components/TodaysSummary"
import TopSpendingUsers from "./components/TopSpendingUsers"
import OfferPerformanceTable from "./components/OfferPerformanceTable"
import { useRealTime } from "@/hooks/useRealTime"

export default function ReportsDashboardPage() {
	// State for date range filter
	const [dateRange, setDateRange] = useState(() => {
		// Initialize with today's date range
		const today = new Date()

		// Use date-fns functions for consistency
		const startOfDay = setMilliseconds(setSeconds(setMinutes(setHours(today, 0), 0), 0), 0)
		const endOfDay = setMilliseconds(setSeconds(setMinutes(setHours(today, 23), 59), 59), 999)

		console.log('Initial date range:', {
			from: startOfDay.toISOString(),
			to: endOfDay.toISOString()
		})

		return {
			from: startOfDay,
			to: endOfDay
		}
	})

	// Fetch data from PocketBase collections
	const { data: sessions, loading: sessionsLoading } = useRealTime('sessions', {
		queryParams: {
			sort: '-created',
			expand: 'device,customer'
		}
	})

	const { data: sessionSnacksLogs, loading: snacksLogsLoading } = useRealTime('session_snacks_logs', {
		queryParams: {
			sort: '-created',
			expand: 'session,snack,session.device'
		}
	})

	const { data: customers, loading: customersLoading } = useRealTime('customers', {
		queryParams: {
			sort: '-created'
		}
	})

	const { data: snacks, loading: snacksLoading } = useRealTime('inventory', {
		queryParams: {
			sort: '-created'
		}
	})

	// Filter data based on date range
	const filteredData = useMemo(() => {
		if (!sessions || !sessionSnacksLogs) return { sessions: [], sessionSnacksLogs: [] }

		const fromDate = dateRange.from.getTime()
		const toDate = dateRange.to.getTime()

		console.log('Filtering data with date range:', {
			from: new Date(fromDate).toISOString(),
			to: new Date(toDate).toISOString()
		})

		const filteredSessions = sessions.filter(session => {
			const sessionDate = new Date(session.created).getTime()
			return sessionDate >= fromDate && sessionDate <= toDate
		})

		const filteredSnacksLogs = sessionSnacksLogs.filter(log => {
			const logDate = new Date(log.created).getTime()
			return logDate >= fromDate && logDate <= toDate
		})

		// Calculate additional filtered data for other components
		const filteredCustomers = customers ? customers.filter(customer => {
			const customerDate = new Date(customer.created).getTime()
			return customerDate >= fromDate && customerDate <= toDate
		}) : []

		const filteredSnacks = snacks ? snacks.filter(snack => {
			const snackDate = new Date(snack.created).getTime()
			return snackDate >= fromDate && snackDate <= toDate
		}) : []

		return {
			sessions: filteredSessions,
			sessionSnacksLogs: filteredSnacksLogs,
			customers: filteredCustomers,
			snacks: filteredSnacks
		}
	}, [sessions, sessionSnacksLogs, customers, snacks, dateRange])

	const [isFiltering, setIsFiltering] = useState(false)

	const handleDateFilterChange = useCallback((newDateRange) => {
		console.log('Date range changed:', newDateRange)

		// Only set filtering state if the date range actually changed
		if (dateRange.from.getTime() !== newDateRange.from.getTime() ||
			dateRange.to.getTime() !== newDateRange.to.getTime()) {

			setIsFiltering(true)

			// Set the new date range
			setDateRange(newDateRange)

			// Reset the filtering indicator after a short delay
			setTimeout(() => {
				setIsFiltering(false)
			}, 500)
		}
	}, [dateRange])

	// Loading state
	const isLoading = sessionsLoading || snacksLogsLoading || customersLoading || snacksLoading || isFiltering

	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<h1 className="text-2xl font-bold">Reports Dashboard</h1>
						{isFiltering && (
							<div className="animate-pulse text-sm text-muted-foreground">
								Filtering data...
							</div>
						)}
					</div>
					<div className="text-sm text-muted-foreground">
						Showing data from {format(dateRange.from, 'MMM dd, yyyy')} to {format(dateRange.to, 'MMM dd, yyyy')}
					</div>
					{!isLoading && (
						<div className="text-xs text-muted-foreground mt-1">
							Found {filteredData.sessions.length} sessions, {filteredData.sessionSnacksLogs.length} snack purchases
						</div>
					)}
				</div>
				<div className="flex gap-2">
					<DateFilter onFilterChange={handleDateFilterChange} />
				</div>
			</div>

			<div className="grid gap-4 grid-cols-12">
				{/* Active Users Card */}
				<div className="col-span-3 flex flex-col gap-4">
					<ActiveUsersCard
						sessions={filteredData.sessions}
						isLoading={isLoading}
					/>
					<TopSpendingUsers
						sessions={filteredData.sessions}
						customers={filteredData.customers}
						isLoading={isLoading}
					/>
				</div>

				{/* Revenue Overview Chart */}
				<div className="col-span-6">
					<RevenueOverviewChart
						sessions={filteredData.sessions}
						sessionSnacksLogs={filteredData.sessionSnacksLogs}
						isLoading={isLoading}
					/>
				</div>

				{/* Today's Summary */}
				<div className="col-span-3">
					<TodaysSummary
						sessions={filteredData.sessions}
						sessionSnacksLogs={filteredData.sessionSnacksLogs}
						isLoading={isLoading}
					/>
				</div>

				{/* Peak Hours Chart */}
				<div className="col-span-12">
					<PeakHoursChart
						sessions={filteredData.sessions}
						isLoading={isLoading}
					/>
				</div>


				{/* Offer Performance Table */}
				<div className="col-span-12">
					<OfferPerformanceTable
						sessions={filteredData.sessions}
						sessionSnacksLogs={filteredData.sessionSnacksLogs}
						snacks={filteredData.snacks}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</div>
	)
}

