import { cn } from '@/lib/utils'

type BrandLogoProps = {
  variant?: 'dark' | 'light'
  showText?: boolean
  className?: string
  markClassName?: string
}

export function BrandLogo({
  variant = 'dark',
  showText = true,
  className,
  markClassName,
}: BrandLogoProps) {
  const isLight = variant === 'light'

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <svg
        viewBox="0 0 64 64"
        className={cn('h-10 w-10 shrink-0', markClassName)}
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill={isLight ? '#F8FAFC' : '#020617'} />
        <path
          d="M16 39V27.8C16 22.4 20.4 18 25.8 18h12.4C43.6 18 48 22.4 48 27.8V39"
          fill="none"
          stroke={isLight ? '#020617' : '#F8FAFC'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M21 39V28.5C21 25.5 23.5 23 26.5 23h11c3 0 5.5 2.5 5.5 5.5V39"
          fill="none"
          stroke={isLight ? '#047857' : '#6EE7B7'}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13 42h38"
          stroke={isLight ? '#020617' : '#F8FAFC'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M20 42l7 10h10l7-10"
          fill="none"
          stroke={isLight ? '#D97706' : '#FDE68A'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 32l4 7 8-14"
          fill="none"
          stroke={isLight ? '#047857' : '#34D399'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="39" y="9" width="12" height="12" rx="3" fill={isLight ? '#047857' : '#10B981'} />
        <path d="M42 13h6M42 16h6" stroke="#F8FAFC" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {showText && (
        <div className="min-w-0">
          <span className={cn('block truncate font-serif text-xl font-black tracking-normal', isLight ? 'text-white' : 'text-slate-950')}>
            Venue Eventos
          </span>
          <span className={cn('hidden text-xs font-medium uppercase tracking-[0.18em] sm:block', isLight ? 'text-emerald-200' : 'text-emerald-700')}>
            Eventos & reservas
          </span>
        </div>
      )}
    </div>
  )
}
