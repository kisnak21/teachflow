import {
  getAttendanceTrend,
  getStudentsPerClass,
  getOverallAttendanceRate,
} from "@/lib/actions/analytics.actions"
import { AttendanceTrendChart } from "@/components/analytics/attendance-trend-chart"
import { StudentsPerClassChart } from "@/components/analytics/students-per-class-chart"
import { AttendanceBreakdownChart } from "@/components/analytics/attendance-breakdown-chart"

export default async function AnalyticsPage() {
  const [trend, studentsPerClass, breakdown] = await Promise.all([
    getAttendanceTrend(),
    getStudentsPerClass(),
    getOverallAttendanceRate(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Trends and statistics across your classes
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AttendanceTrendChart data={trend} />
        <AttendanceBreakdownChart data={breakdown} />
      </div>

      <StudentsPerClassChart data={studentsPerClass} />
    </div>
  )
}