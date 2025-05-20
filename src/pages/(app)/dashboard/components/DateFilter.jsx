'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'

export default function DateFilter({ onFilterChange }) {
  const [selectedFilter, setSelectedFilter] = useState('today')
  const [customRange, setCustomRange] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  })
  const [isCustom, setIsCustom] = useState(false)

  // Apply the filter when selectedFilter or isCustom changes
  // We're removing onFilterChange from the dependency array to prevent infinite loops
  useEffect(() => {
    try {
      if (!isCustom) {
        const dateRange = getDateRangeFromFilter(selectedFilter)
        console.log('Applying preset filter:', selectedFilter, {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString()
        })

        if (typeof onFilterChange === 'function') {
          onFilterChange(dateRange)
        }
      }
    } catch (error) {
      console.error('Error applying date filter:', error)
    }
  }, [selectedFilter, isCustom]) // Removed onFilterChange and customRange from dependencies

  // Separate effect for custom range changes
  useEffect(() => {
    try {
      if (isCustom) {
        const fromDate = setToStartOfDay(new Date(customRange.from))
        const toDate = setToEndOfDay(new Date(customRange.to))

        // Validate dates
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          console.error('Invalid custom date range:', customRange)
          return
        }

        // Don't automatically apply custom range changes
        // Let the user click the Apply button instead
      }
    } catch (error) {
      console.error('Error processing custom date range:', error)
    }
  }, [customRange, isCustom])

  // Helper function to set time to start of day (00:00:00)
  const setToStartOfDay = (date) => {
    return setMilliseconds(setSeconds(setMinutes(setHours(date, 0), 0), 0), 0)
  }

  // Helper function to set time to end of day (23:59:59)
  const setToEndOfDay = (date) => {
    return setMilliseconds(setSeconds(setMinutes(setHours(date, 23), 59), 59), 999)
  }

  // Get date range based on filter
  const getDateRangeFromFilter = (filter) => {
    const today = new Date()

    switch (filter) {
      case 'today':
        return {
          from: setToStartOfDay(today),
          to: setToEndOfDay(today)
        }
      case 'yesterday':
        const yesterday = subDays(today, 1)
        return {
          from: setToStartOfDay(yesterday),
          to: setToEndOfDay(yesterday)
        }
      case 'thisWeek':
        return {
          from: setToStartOfDay(startOfWeek(today, { weekStartsOn: 1 })),
          to: setToEndOfDay(endOfWeek(today, { weekStartsOn: 1 }))
        }
      case 'thisMonth':
        return {
          from: setToStartOfDay(startOfMonth(today)),
          to: setToEndOfDay(endOfMonth(today))
        }
      case 'thisYear':
        return {
          from: setToStartOfDay(startOfYear(today)),
          to: setToEndOfDay(endOfYear(today))
        }
      default:
        return {
          from: setToStartOfDay(today),
          to: setToEndOfDay(today)
        }
    }
  }

  // Get display text for the current filter
  const getFilterDisplayText = () => {
    if (isCustom) {
      return `${format(new Date(customRange.from), 'MMM dd, yyyy')} - ${format(new Date(customRange.to), 'MMM dd, yyyy')}`
    }

    switch (selectedFilter) {
      case 'today':
        return 'Today'
      case 'yesterday':
        return 'Yesterday'
      case 'thisWeek':
        return 'This Week'
      case 'thisMonth':
        return 'This Month'
      case 'thisYear':
        return 'This Year'
      default:
        return 'Select Date Range'
    }
  }

  // Handle filter selection
  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter)
    setIsCustom(false)

    // Apply the filter immediately
    try {
      const dateRange = getDateRangeFromFilter(filter)
      console.log('Directly applying preset filter:', filter, {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString()
      })

      if (typeof onFilterChange === 'function') {
        onFilterChange(dateRange)
      }
    } catch (error) {
      console.error('Error applying filter directly:', error)
    }
  }

  // Handle custom range selection
  const handleCustomRangeChange = (e) => {
    const { name, value } = e.target

    setCustomRange(prev => ({
      ...prev,
      [name]: value
    }))

    // Don't set isCustom to true here, wait for the Apply button
    // This prevents automatic filtering while the user is still selecting dates
  }

  // Apply custom range
  const applyCustomRange = () => {
    try {
      const fromDate = setToStartOfDay(new Date(customRange.from))
      const toDate = setToEndOfDay(new Date(customRange.to))

      // Validate dates
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        console.error('Invalid custom date range:', customRange)
        return
      }

      // Validate that from date is not after to date
      if (fromDate > toDate) {
        console.error('From date cannot be after to date')
        return
      }

      setIsCustom(true)
      console.log('Manually applying custom date range:', {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      })

      if (typeof onFilterChange === 'function') {
        onFilterChange({
          from: fromDate,
          to: toDate
        })
      }
    } catch (error) {
      console.error('Error applying custom date range:', error)
    }
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{getFilterDisplayText()}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => handleFilterSelect('today')}>
            Today
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleFilterSelect('yesterday')}>
            Yesterday
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleFilterSelect('thisWeek')}>
            This Week
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleFilterSelect('thisMonth')}>
            This Month
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleFilterSelect('thisYear')}>
            This Year
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="p-2">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                name="from"
                type="date"
                value={customRange.from}
                onChange={handleCustomRangeChange}
              />
            </div>
            <div className="mt-2 space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                name="to"
                type="date"
                value={customRange.to}
                onChange={handleCustomRangeChange}
              />
            </div>
            <Button
              className="mt-4 w-full"
              onClick={applyCustomRange}
            >
              Apply Custom Range
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
