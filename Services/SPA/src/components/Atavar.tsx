// src/components/Avatar.tsx
import { useMemo, useState } from 'react'

function initialsFrom(name?: string) {
  if (!name) return 'CV'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || 'CV'
}

function hueFrom(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h % 360
}

export default function Avatar({
  src,
  name,
  size = 96,
  className = '',
  rounded = 'xl', // 'xl' o 'full'
}: {
  src?: string
  name?: string
  size?: number
  className?: string
  rounded?: 'xl' | 'full'
}) {
  const [broken, setBroken] = useState(false)
  const initials = useMemo(() => initialsFrom(name), [name])
  const hue = useMemo(() => hueFrom(name ?? initials), [name, initials])
  const bg = `hsl(${hue} 60% 40%)`
  const radius = rounded === 'full' ? '9999px' : '0.75rem'

  return (
    <div
      className={`overflow-hidden shadow ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background: bg }}
      aria-label={name || 'Avatar'}
      title={name}
    >
      {!broken && src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setBroken(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white"
          style={{ fontWeight: 600, fontSize: Math.max(14, Math.floor(size * 0.35)) }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}
