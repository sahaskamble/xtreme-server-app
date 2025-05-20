import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users } from "lucide-react"

export default function ActiveSessions({ sessions }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Sessions</CardTitle>
        <CardDescription>
          Latest gaming sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions
              .slice(0, 5)
              .map((session, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{session.expand?.device?.name || 'Unknown Device'}</p>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(session.in_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {session.status !== 'Closed' ? 'Occupied' : session.duration}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No active sessions</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
