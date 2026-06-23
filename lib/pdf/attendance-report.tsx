import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
  },
  table: {
    marginTop: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    paddingVertical: 8,
    fontWeight: "bold",
  },
  colNumber: { width: "10%" },
  colName: { width: "45%" },
  colStudentNumber: { width: "20%" },
  colStatus: { width: "25%" },
  statusPresent: { color: "#16a34a" },
  statusAbsent: { color: "#dc2626" },
  statusLate: { color: "#ca8a04" },
  summary: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    fontSize: 10,
    color: "#666",
  },
})

interface AttendanceRecord {
  studentName: string
  studentNumber: string
  status: "PRESENT" | "ABSENT" | "LATE"
}

interface Props {
  className: string
  date: string
  records: AttendanceRecord[]
}

export function AttendanceReportPDF({ className, date, records }: Props) {
  const presentCount = records.filter((r) => r.status === "PRESENT").length
  const absentCount = records.filter((r) => r.status === "ABSENT").length
  const lateCount = records.filter((r) => r.status === "LATE").length

  const statusStyle = (status: string) => {
    if (status === "PRESENT") return styles.statusPresent
    if (status === "ABSENT") return styles.statusAbsent
    return styles.statusLate
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Report</Text>
          <Text style={styles.subtitle}>
            {className} — {date}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNumber}>#</Text>
            <Text style={styles.colName}>Name</Text>
            <Text style={styles.colStudentNumber}>Student No.</Text>
            <Text style={styles.colStatus}>Status</Text>
          </View>

          {records.map((record, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colNumber}>{i + 1}</Text>
              <Text style={styles.colName}>{record.studentName}</Text>
              <Text style={styles.colStudentNumber}>
                {record.studentNumber}
              </Text>
              <Text style={[styles.colStatus, statusStyle(record.status)]}>
                {record.status}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryItem}>
            Present: {presentCount}
          </Text>
          <Text style={styles.summaryItem}>
            Absent: {absentCount}
          </Text>
          <Text style={styles.summaryItem}>
            Late: {lateCount}
          </Text>
          <Text style={styles.summaryItem}>
            Total: {records.length}
          </Text>
        </View>
      </Page>
    </Document>
  )
}