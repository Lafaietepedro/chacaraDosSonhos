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
    <div className={cn('va-brand-logo flex min-w-0 items-center gap-3', className)}>
      <span className={cn('va-brand-mark', markClassName)} aria-hidden="true">VA</span>
      {showText && (
        <div className="min-w-0">
          <span className={cn('block truncate', isLight ? 'text-white' : 'text-[#241f19]')}>
            Villa Aurora
          </span>
          <span className={cn('block', isLight ? 'text-[#a99e8e]' : 'text-[#8a7f70]')}>
            espaço de eventos
          </span>
        </div>
      )}
    </div>
  )
}
