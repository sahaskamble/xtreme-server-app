import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProfitProgressBar({ 
  currentProfit, 
  targetProfit, 
  title = "Monthly Profit Target", 
  description = "Track your monthly profit goals" 
}) {
  // Calculate percentage
  const percentage = Math.min(Math.round((currentProfit / targetProfit) * 100), 100);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {formatCurrency(currentProfit)} of {formatCurrency(targetProfit)}
          </span>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Current</p>
            <p className="font-medium">{formatCurrency(currentProfit)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Target</p>
            <p className="font-medium">{formatCurrency(targetProfit)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="font-medium">{formatCurrency(Math.max(targetProfit - currentProfit, 0))}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
