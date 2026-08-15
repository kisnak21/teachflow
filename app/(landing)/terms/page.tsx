import type { Metadata } from 'next'
import {
  LegalLayout,
  type LegalSection,
} from '@/components/landing/legal-layout'

export const metadata: Metadata = {
  title: 'Ketentuan Layanan — TeachFlow',
  description:
    'Ketentuan penggunaan layanan TeachFlow, aplikasi administrasi untuk guru.',
}

const sections: LegalSection[] = [
  {
    title: 'Penerimaan Ketentuan',
    body: [
      'Dengan mengakses atau menggunakan TeachFlow, Anda menyetujui Ketentuan Layanan ini. Jika Anda tidak setuju, mohon jangan menggunakan layanan kami.',
    ],
  },
  {
    title: 'Layanan',
    body: [
      'TeachFlow menyediakan alat administrasi untuk guru, termasuk manajemen kelas, absensi, nilai, rekap otomatis, ekspor PDF/Excel, dan pembuatan dokumen berbantuan AI (seperti RPP).',
      'Kami dapat mengubah, menambah, atau menghentikan fitur kapan saja dengan pemberitahuan yang wajar.',
    ],
  },
  {
    title: 'Akun & Tanggung Jawab Pengguna',
    body: [
      'Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda dan semua aktivitas yang terjadi di akun Anda. Segera hubungi kami jika terjadi penggunaan tanpa izin.',
      'Anda wajib memastikan data yang Anda masukkan (termasuk data siswa) diperoleh dan digunakan sesuai dengan hukum yang berlaku, termasuk peraturan perlindungan data di Indonesia.',
    ],
  },
  {
    title: 'Konten Pengguna',
    body: [
      'Data yang Anda masukkan ke TeachFlow tetap milik Anda. Anda memberi kami lisensi terbatas untuk menyimpan dan memproses data tersebut demi menyediakan layanan.',
      'Kami tidak mengklaim kepemilikan atas data siswa atau dokumen yang Anda buat.',
    ],
  },
  {
    title: 'Penggunaan AI',
    body: [
      'Konten yang dihasilkan oleh fitur AI bersifat bantuan dan mungkin mengandung kesalahan. Anda bertanggung jawab meninjau dan memverifikasi hasil sebelum digunakan secara resmi.',
    ],
  },
  {
    title: 'Batasan Tanggung Jawab',
    body: [
      'Layanan disediakan "sebagaimana adanya" tanpa jaminan apa pun. Sejauh diizinkan oleh hukum, kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan kami.',
    ],
  },
  {
    title: 'Penghentian',
    body: [
      'Anda dapat menghentikan penggunaan dan menghapus akun kapan saja. Kami dapat menangguhkan atau menghentikan akses Anda jika melanggar ketentuan ini atau untuk melindungi layanan dan pengguna lain.',
    ],
  },
  {
    title: 'Perubahan Ketentuan',
    body: [
      'Kami dapat memperbarui Ketentuan ini sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini. Penggunaan berkelanjutan setelah perubahan berarti Anda menerima ketentuan terbaru.',
    ],
  },
  {
    title: 'Hukum yang Berlaku & Kontak',
    body: [
      'Ketentuan ini diatur oleh hukum Republik Indonesia. Jika Anda memiliki pertanyaan, hubungi kami melalui kontak yang tersedia di situs TeachFlow.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Ketentuan Layanan"
      subtitle="Legal"
      sections={sections}
    />
  )
}
