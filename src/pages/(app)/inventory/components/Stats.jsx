'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, MonitorSmartphone, Refrigerator, Sigma, TriangleAlert } from "lucide-react";
import React, { useEffect, useState } from 'react'

function StatsCard({ stat, setData, current }) {
  return (
    <Card
      onClick={() => setData(stat.title)}
      className={`cursor-pointer ${stat.title === current && 'border-primary'}`}
    >
      <div className="flex items-center justify-between">
        <CardHeader className={'w-full'}>
          <CardDescription className={'w-full'}>
            <div className="flex justify-between items-center w-full">
              <p>{stat.title}</p>
              <stat.icon size={20} />
            </div>
          </CardDescription>
          <CardTitle>{stat.description}</CardTitle>
        </CardHeader>
      </div>
    </Card>
  );

}

function Stats({ snacks, devices, setData, current }) {
  console.log(snacks)
  const [StatsData, setStatsData] = useState([
    {
      title: 'Total Stock',
      description: 0,
      icon: Sigma,
    },
    {
      title: 'Stocks',
      description: 0,
      icon: Cookie,
    },
    {
      title: 'Fridge',
      description: 0,
      icon: Refrigerator,
    },
    {
      title: 'Low Stock',
      description: 0,
      icon: TriangleAlert,
    },
  ]);

  useEffect(() => {
    const StatsCalc = () => {
      setStatsData((prevStats) =>
        prevStats.map((stat) => {
          if (stat.title === "Total Stock") {
            return {
              ...stat,
              description: snacks?.length
            };
          }
          if (stat.title === "Stocks") {
            return {
              ...stat,
              description: snacks?.filter((snack) => snack?.location === 'Stock')?.length
            };
          }
          if (stat.title === "Fridge") {
            return {
              ...stat,
              description: snacks?.filter((snack) => snack?.location === 'Fridge')?.length
            };
          }
          if (stat.title === "Low Stock") {
            return {
              ...stat,
              description: snacks?.filter((snack) => snack?.status === 'Low Stock')?.length
            };
          }
          return stat;
        })
      );

    }
    StatsCalc();
  }, [snacks, devices]);


  return (
    <div className="grid grid-cols-4 gap-4">
      {
        StatsData.map((stat, index) => (
          <StatsCard key={index} stat={stat} setData={setData} current={current} />
        ))
      }
    </div>
  )
}

export default Stats
