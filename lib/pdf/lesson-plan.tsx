import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#222',
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 9, color: '#666' },
  section: { marginTop: 12 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#444',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  item: { fontSize: 9, marginBottom: 2, paddingLeft: 8 },
  footer: {
    marginTop: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  footerText: { fontSize: 8, color: '#888' },
})

export interface LessonPlanPdfData {
  title: string
  subject: string
  grade: string
  duration: string
  objectives: string[]
  activities: string[]
  assessment: string[]
  homework: string[]
  materials: string[]
  methods: string[]
  differentiation: string[]
}

function Section({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      {items.map((it, i) => (
        <Text key={i} style={styles.item}>
          • {it}
        </Text>
      ))}
    </View>
  )
}

export function LessonPlanPDF(data: LessonPlanPdfData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.meta}>
            {data.subject} • {data.grade} • {data.duration}
          </Text>
          <Text style={styles.meta}>
            TeachFlow — {new Date().toLocaleDateString('id-ID')}
          </Text>
        </View>

        <Section label="Tujuan Pembelajaran" items={data.objectives} />
        <Section label="Kegiatan" items={data.activities} />
        <Section label="Asesmen" items={data.assessment} />
        <Section label="Tugas / PR" items={data.homework} />
        <Section label="Materi & Media" items={data.materials} />
        <Section label="Metode" items={data.methods} />
        <Section label="Diferensiasi" items={data.differentiation} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            TeachFlow — Asisten Administrasi untuk Guru
          </Text>
        </View>
      </Page>
    </Document>
  )
}
