import React, { useState, useEffect } from 'react';
import { Database, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isPocketBaseServerRunning } from '@/utils/pocketbase-server';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import pb from '@/lib/pocketbase/pb';

/**
 * Server status indicator component
 * Shows the status of the PocketBase server
 */
export function ServerStatus({ className }) {
  const [status, setStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);

  // Check server status on mount and periodically
  useEffect(() => {
    // Function to check server status
    const checkStatus = async () => {
      try {
        const isRunning = pb.authStore.isValid;
        setStatus(isRunning ? 'online' : 'offline');
        setLastChecked(new Date());
      } catch (error) {
        console.error('Error checking server status:', error);
        setStatus('error');
        setLastChecked(new Date());
      }
    };

    // Check status immediately
    checkStatus();

    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'offline':
        return 'text-red-500';
      case 'error':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get status icon
  const StatusIcon = status === 'error' ? AlertCircle : Database;

  // Format last checked time
  const getLastCheckedText = () => {
    if (!lastChecked) return 'Never checked';

    const now = new Date();
    const diff = now - lastChecked;

    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return lastChecked.toLocaleTimeString();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 p-0', className)}
            onClick={() => {
              // Manually check status when clicked
              setStatus('checking');
              isPocketBaseServerRunning()
                .then(isRunning => {
                  setStatus(isRunning ? 'online' : 'offline');
                  setLastChecked(new Date());
                })
                .catch(error => {
                  console.error('Error checking server status:', error);
                  setStatus('error');
                  setLastChecked(new Date());
                });
            }}
          >
            <StatusIcon className={cn('h-4 w-4', getStatusColor())} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs">
            <div className="font-semibold">Database Server</div>
            <div className="flex items-center gap-1">
              Status:
              <span className={getStatusColor()}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <div className="text-muted-foreground">
              Last checked: {getLastCheckedText()}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
