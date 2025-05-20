import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function RecentLogins({ loginLogs }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Logins</CardTitle>
        <CardDescription>
          User login activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loginLogs && loginLogs.length > 0 ? (
          <div className="space-y-4">
            {loginLogs.slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{log.expand?.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-muted-foreground">
                    {log.expand?.user?.role || 'User'}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(log.login).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No recent login activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
