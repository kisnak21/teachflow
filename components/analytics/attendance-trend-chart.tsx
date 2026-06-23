"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface Props {
  data: { date: string; present: number; absent: number; late: number }[]
}

export function AttendanceTrendChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Attendance Trend (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No attendance data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="present"
                stroke="#16a34a"
                strokeWidth={2}
                name="Present"
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke="#dc2626"
                strokeWidth={2}
                name="Absent"
              />
              <Line
                type="monotone"
                dataKey="late"
                stroke="#ca8a04"
                strokeWidth={2}
                name="Late"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}