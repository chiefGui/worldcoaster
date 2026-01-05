import { useCallback } from 'react'
import { Calendar } from 'lucide-react'
import { Drawer } from '@ui/component/drawer'
import { useTick } from '@ecs/react/use-world'
import { GameTime, SEASON_NAMES, DAYS_PER_SEASON, type SeasonId } from '@framework/time'
import { cn } from '@ui/lib/cn'

const SEASON_ICONS: Record<SeasonId, string> = {
  spring: '🌸',
  summer: '☀️',
  fall: '🍂',
  winter: '❄️',
}

function DateTrigger() {
  const formattedDate = useTick(useCallback(() => GameTime.getFormattedDate(), []))

  return (
    <Drawer.Trigger
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg',
        'text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
        'transition-colors'
      )}
      aria-label="View date details"
    >
      <Calendar className="size-4" />
      <span>{formattedDate}</span>
    </Drawer.Trigger>
  )
}

function DateDrawerContent() {
  const date = useTick(useCallback(() => GameTime.getDate(), []))
  const seasonProgress = ((date.day - 1) / DAYS_PER_SEASON) * 100

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Drawer.Heading>Date & Season</Drawer.Heading>
        <Drawer.Close>&times;</Drawer.Close>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Current Date */}
        <section className="text-center">
          <div className="text-4xl mb-2">{SEASON_ICONS[date.season]}</div>
          <div className="text-2xl font-semibold text-text-primary">
            {SEASON_NAMES[date.season]} {date.day}
          </div>
          <div className="text-text-secondary">Year {date.year}</div>
        </section>

        {/* Season Progress */}
        <section>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Season Progress
          </h3>
          <div className="rounded-lg bg-bg-tertiary p-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Day {date.day} of {DAYS_PER_SEASON}</span>
              <span className="text-text-primary">{Math.round(seasonProgress)}%</span>
            </div>
            <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${seasonProgress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Season Info */}
        <section>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Seasons
          </h3>
          <div className="rounded-lg border border-border-subtle overflow-hidden">
            {(['spring', 'summer', 'fall', 'winter'] as const).map((season, index) => (
              <div
                key={season}
                className={cn(
                  'flex items-center gap-3 px-3 py-2',
                  index > 0 && 'border-t border-border-subtle',
                  date.season === season && 'bg-accent/10'
                )}
              >
                <span className="text-xl">{SEASON_ICONS[season]}</span>
                <span className={cn(
                  'flex-1 text-sm',
                  date.season === season ? 'text-accent font-medium' : 'text-text-secondary'
                )}>
                  {SEASON_NAMES[season]}
                </span>
                {date.season === season && (
                  <span className="text-xs text-accent">Current</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Statistics
          </h3>
          <div className="rounded-lg bg-bg-tertiary p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Total Days Played</span>
              <span className="text-text-primary">{date.totalDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Years Passed</span>
              <span className="text-text-primary">{date.year - 2026}</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export function DateDisplay() {
  const store = Drawer.useStore()

  return (
    <Drawer.Root store={store}>
      <DateTrigger />
      <Drawer.Content side="right" className="flex flex-col">
        <DateDrawerContent />
      </Drawer.Content>
    </Drawer.Root>
  )
}
