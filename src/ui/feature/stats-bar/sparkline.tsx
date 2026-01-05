import { useMemo } from 'react'
import { cn } from '@ui/lib/cn'

type SparklineProps = {
  data: number[]
  width?: number
  height?: number
  className?: string
  color?: 'default' | 'success' | 'error'
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  className,
  color = 'default',
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return ''

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + chartHeight - ((value - min) / range) * chartHeight
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }, [data, width, height])

  // Determine trend for gradient
  const first = data[0] ?? 0
  const last = data[data.length - 1] ?? 0
  const trend = data.length >= 2 ? last - first : 0

  const strokeColor = useMemo(() => {
    if (color === 'success') return 'stroke-success'
    if (color === 'error') return 'stroke-error'
    if (trend > 0) return 'stroke-success'
    if (trend < 0) return 'stroke-error'
    return 'stroke-text-muted'
  }, [color, trend])

  if (data.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center text-text-muted text-xs', className)}
        style={{ width, height }}
      >
        No data
      </div>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={path}
        fill="none"
        className={cn(strokeColor, 'transition-colors')}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
