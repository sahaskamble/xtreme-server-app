'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function TopSpendingUsers({ sessions, customers, isLoading }) {
  // Calculate top spending users
  const topUsers = useMemo(() => {
    if (!sessions || !customers) {
      return []
    }

    // Group sessions by customer
    const userSpending = {}

    sessions.forEach(session => {
      const customerId = session.customer
      if (!customerId) return

      // Initialize user data if not exists
      if (!userSpending[customerId]) {
        const customer = customers.find(c => c.id === customerId) || {}
        userSpending[customerId] = {
          id: customerId,
          name: customer.name || 'Unknown User',
          email: customer.email || `user-${customerId}@example.com`,
          spent: 0,
          visits: 0,
          status: customer.status || 'active'
        }
      }

      // Add session spending
      userSpending[customerId].spent += (session.total_amount || 0)
      userSpending[customerId].visits += 1
    })

    // Convert to array and sort by amount spent
    return Object.values(userSpending)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5) // Get top 5 users
  }, [sessions, customers])

  if (isLoading) {
    return (
      <Card className="h-full bg-card text-card-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Spending Users</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full bg-card text-card-foreground">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top Spending Users</CardTitle>
      </CardHeader>
      <CardContent>
        {topUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No user spending data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Visits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.visits}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">${user.spent.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
