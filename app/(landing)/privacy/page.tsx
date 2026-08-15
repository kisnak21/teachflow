import type { Metadata } from 'next'
import {
  LegalLayout,
  type LegalSection,
} from '@/components/landing/legal-layout'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi — TeachFlow',
  description:
    'Bagaimana TeachFlow mengumpulkan, menggunakan, dan melindungi data Anda sebagai pengguna aplikasi administrasi guru.',
}

const sections: LegalSection[] = [
  {
    title: 'Pendahuluan',
    body: [
      'Kebijakan Privasi ini menjelaskan bagaimana TeachFlow ("kami") mengumpulkan, menggunakan, dan melindungi data Anda ketika menggunakan layanan kami. Kami berkomitmen untuk menjaga privasi dan keamanan data Anda.',
    ],
  },
  {
    title: 'Data yang Kami Kumpulkan',
    body: [
      'Saat Anda membuat akun, kami mengumpulkan nama, alamat email, dan kata sandi (dalam bentuk ter-hash). Saat Anda menggunakan fitur kelas, kami menyimpan data yang Anda masukkan seperti daftar siswa, absensi, dan nilai.',
      'Kami tidak mengumpulkan data sensitif seperti nomor KTP, alamat rumah, atau informasi keuangan. Data yang Anda masukkan ke TeachFlow adalah milik Anda.',
    ],
  },
  {
    title: 'Cara Kami Menggunakan Data',
    body: [
      'Kami menggunakan data Anda untuk: menyediakan dan memelihara layanan, memproses permintaan seperti pembuatan RPP dan rekap nilai, serta meningkatkan kualitas produk dan pengalaman pengguna.',
      'Kami tidak menjual data Anda kepada pihak mana pun.',
    ],
  },
  {
    title: 'Keamanan & Penyimpanan',
    body: [
      'Kata sandi disimpan dalam bentuk hash dan koneksi dienkripsi. Data tersimpan di penyedia layanan yang menerapkan standar keamanan industri (seperti enkripsi saat penyimpanan).',
      'Namun, tidak ada metode transmisi atau penyimpanan data yang sepenuhnya aman. Kami berupaya melindungi data Anda, tetapi tidak dapat menjamin keamanan mutlak.',
    ],
  },
  {
    title: 'Fitur AI',
    body: [
      'Fitur AI seperti RPP Generator memproses data yang Anda kirimkan ke penyedia AI pihak ketiga untuk menghasilkan konten. Data tersebut hanya digunakan untuk memproses permintaan Anda dan tidak digunakan untuk melatih model.',
    ],
  },
  {
    title: 'Cookie & Penyimpanan Lokal',
    body: [
      'Kami menggunakan cookie dan penyimpanan lokal browser untuk menjaga sesi login Anda dan menyimpan preferensi (seperti tema gelap/terang). Anda dapat mengatur ini melalui pengaturan browser.',
    ],
  },
  {
    title: 'Hak Anda',
    body: [
      'Anda berhak mengakses, mengoreksi, atau menghapus data Anda kapan saja. Anda dapat menghapus akun melalui pengaturan akun atau dengan menghubungi kami. Setelah permintaan penghapusan, data Anda akan dihapus dalam jangka waktu yang wajar.',
    ],
  },
  {
    title: 'Kontak & Perubahan',
    body: [
      'Jika Anda memiliki pertanyaan tentang kebijakan ini, hubungi kami melalui email yang tertera di situs TeachFlow.',
      'Kami dapat memperbarui kebijakan ini sewaktu-waktu. Perubahan signifikan akan diinformasikan melalui situs atau email. Penggunaan layanan setelah perubahan berarti Anda menerima kebijakan terbaru.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Kebijakan Privasi"
      subtitle="Privasi"
      sections={sections}
    />
  )
}
