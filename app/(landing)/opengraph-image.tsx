import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'TeachFlow — Asisten Administrasi untuk Guru'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const fredoka400 = readFile(
  join(process.cwd(), 'app/(landing)/fonts/fredoka-400.ttf')
)
const fredoka600 = readFile(
  join(process.cwd(), 'app/(landing)/fonts/fredoka-600.ttf')
)
const caveat = readFile(
  join(process.cwd(), 'app/(landing)/fonts/caveat-400.ttf')
)

export default async function OpengraphImage() {
  const [fredoka400Data, fredoka600Data, caveatData] = await Promise.all([
    fredoka400,
    fredoka600,
    caveat,
  ])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '72px 88px',
        backgroundColor: '#f5f4f1',
        color: '#121213',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: '-140px',
          bottom: '-200px',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          backgroundColor: '#dd794314',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '44px',
          right: '40px',
          width: '130px',
          height: '34px',
          borderRadius: '6px',
          backgroundColor: '#fbbf24',
          opacity: 0.85,
          transform: 'rotate(-6deg)',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#dd7943',
            transform: 'rotate(-4deg)',
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#121213"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
            <path d="M22 10v6" />
            <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
          </svg>
        </div>
        <div
          style={{
            fontSize: '40px',
            fontWeight: 600,
            fontFamily: 'Fredoka',
            letterSpacing: '-0.02em',
          }}
        >
          TeachFlow
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '36px',
          maxWidth: '860px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: '86px',
            fontWeight: 600,
            fontFamily: 'Fredoka',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          Asisten Administrasi
          <br />
          untuk Guru Indonesia
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '28px',
          }}
        >
          <svg
            width="56"
            height="20"
            viewBox="0 0 56 20"
            fill="none"
            style={{ transform: 'translateY(2px)' }}
          >
            <path
              d="M3 14 C 18 4, 36 4, 53 14"
              stroke="#dd7943"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M47 8 L 54 14 L 47 19"
              stroke="#dd7943"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span
            style={{
              fontSize: '34px',
              fontFamily: 'Caveat',
              color: '#121213',
              opacity: 0.75,
            }}
          >
            kelas, absensi, nilai — dalam satu tempat
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginTop: 'auto',
          fontSize: '26px',
          fontFamily: 'Fredoka',
          fontWeight: 400,
          color: '#121213',
          opacity: 0.6,
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dd7943"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 3h6v12H9z" />
          <path d="M12 15v6" />
          <path d="M8 21h8" />
          <path d="M5 6h2" />
          <path d="M17 6h2" />
        </svg>
        RPP Generator AI · rekap otomatis · ekspor PDF & Excel
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Fredoka', data: fredoka400Data, weight: 400 },
        { name: 'Fredoka', data: fredoka600Data, weight: 600 },
        { name: 'Caveat', data: caveatData, weight: 400 },
      ],
    }
  )
}
