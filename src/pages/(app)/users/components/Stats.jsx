import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldUser, UserCog, Users } from "lucide-react";
import React, { useEffect, useState } from 'react'

function StatsCard({ stat, setData }) {
  return (
    <Card onClick={() => setData(stat.title)} className={'cursor-pointer'}>
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

function Stats({ users, setData }) {
  const [StatsData, setStatsData] = useState([
    {
      title: 'Admins',
      description: 0,
      icon: ShieldUser,
    },
    {
      title: 'Staffs',
      description: 0,
      icon: UserCog,
    },
    {
      title: 'Customers',
      description: 0,
      icon: Users,
    },
  ]);

  useEffect(() => {
    const StatsCalc = () => {
      setStatsData((prevStats) =>
        prevStats.map((stat) => {
          if (stat.title === "Admins") {
            return {
              ...stat,
              description: users
                ?.filter((user) => user.role === 'Admin').length || 0
            };
          }
          if (stat.title === "Staffs") {
            return {
              ...stat,
              description: users
                ?.filter((user) => user.role === 'Staff').length || 0
            };
          }
          if (stat.title === "Customers") {
            return {
              ...stat,
              description: users
                ?.filter((user) => user.role === 'User').length || 0
            };
          }
          return stat;
        })
      );

    }
    StatsCalc();
  }, [users]);


  return (
    <div className="grid grid-cols-3 gap-4">
      {
        StatsData.map((stat, index) => (
          <StatsCard key={index} stat={stat} setData={setData} />
        ))
      }
    </div>
  )
}

export default Stats
