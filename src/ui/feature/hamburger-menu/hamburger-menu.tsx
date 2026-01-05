import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Menu, Settings, HelpCircle, Volume2, Palette, RotateCcw, AlertTriangle, Check, Code, Activity } from 'lucide-react'
import * as Ariakit from '@ariakit/react'
import { Drawer } from '@ui/component/drawer'
import { NavigationMenu } from '@ui/component/navigation-menu'
import { Toast } from '@ui/component/toast'
import { World } from '@ecs/world'
import { useTick } from '@ecs/react/use-world'
import { Persistence } from '@ecs/persistence/persistence'
import { Game } from '@framework/setup'
import { Park, ParkStat } from '@game/park/park.component'
import { GuestComponent } from '@game/guest/guest.component'
import { BuildingComponent } from '@game/building/building.component'
import { Modifier, ModifierComponent } from '@framework/modifier/modifier.component'
import { Stat } from '@framework/stat/stat.component'
import { CONFIG } from '@framework/config'
import { cn } from '@ui/lib/cn'
import { useTheme } from '@ui/provider/theme-provider'

type HamburgerMenuContextValue = {
  open: (panelId?: string) => void
  close: () => void
  isOpen: boolean
}

const HamburgerMenuContext = createContext<HamburgerMenuContextValue | null>(null)

export function useHamburgerMenu() {
  const context = useContext(HamburgerMenuContext)
  if (!context) {
    throw new Error('useHamburgerMenu must be used within HamburgerMenu.Root')
  }
  return context
}

export type HamburgerMenuRootProps = {
  children: ReactNode
}

export function HamburgerMenuRoot({ children }: HamburgerMenuRootProps) {
  const store = Drawer.useStore()
  const isOpen = Ariakit.useStoreState(store, 'open')

  const open = useCallback(
    (_panelId?: string) => {
      // TODO: If _panelId is provided, navigate to that panel after opening
      store.show()
    },
    [store]
  )

  const close = useCallback(() => {
    store.hide()
  }, [store])

  const value = useMemo<HamburgerMenuContextValue>(
    () => ({ open, close, isOpen: isOpen ?? false }),
    [open, close, isOpen]
  )

  return (
    <HamburgerMenuContext.Provider value={value}>
      <Drawer.Root store={store}>{children}</Drawer.Root>
    </HamburgerMenuContext.Provider>
  )
}

export type HamburgerMenuTriggerProps = {
  className?: string
}

export function HamburgerMenuTrigger({ className }: HamburgerMenuTriggerProps) {
  return (
    <Drawer.Trigger
      className={cn(
        'size-10 flex items-center justify-center rounded-lg',
        'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
        'transition-colors',
        className
      )}
      aria-label="Open menu"
    >
      <Menu className="size-5" />
    </Drawer.Trigger>
  )
}

export type HamburgerMenuContentProps = {
  children?: ReactNode
}

export function HamburgerMenuContent({ children }: HamburgerMenuContentProps) {
  const { close } = useHamburgerMenu()

  return (
    <Drawer.Content side="left" className="flex flex-col">
      <NavigationMenu.Root defaultPanel="root" onNavigate={() => {}}>
        {children ?? <DefaultMenuContent onClose={close} />}
      </NavigationMenu.Root>
    </Drawer.Content>
  )
}

type DefaultMenuContentProps = {
  onClose: () => void
}

function DefaultMenuContent({ onClose }: DefaultMenuContentProps) {
  return (
    <>
      {/* Root Panel */}
      <NavigationMenu.Panel id="root" title="Menu">
        <NavigationMenu.Header>
          <Drawer.Close aria-label="Close menu">
            <span className="sr-only">Close</span>
            ✕
          </Drawer.Close>
        </NavigationMenu.Header>
        <div className="flex-1 overflow-y-auto">
          <NavigationMenu.Section>
            <NavigationMenu.Item to="settings" icon={<Settings className="size-5" />}>
              Settings
            </NavigationMenu.Item>
            <NavigationMenu.Item icon={<HelpCircle className="size-5" />} onClick={onClose}>
              Help
            </NavigationMenu.Item>
          </NavigationMenu.Section>
          <NavigationMenu.Section>
            <NavigationMenu.Item to="dev" icon={<Code className="size-5" />}>
              Dev
            </NavigationMenu.Item>
          </NavigationMenu.Section>
        </div>
      </NavigationMenu.Panel>

      {/* Settings Panel */}
      <NavigationMenu.Panel id="settings" parent="root" title="Settings">
        <NavigationMenu.Header />
        <div className="flex-1 overflow-y-auto">
          <NavigationMenu.Section>
            <NavigationMenu.Item
              to="settings/audio"
              icon={<Volume2 className="size-5" />}
              description="Volume, music, sound effects"
            >
              Audio
            </NavigationMenu.Item>
            <NavigationMenu.Item
              to="settings/appearance"
              icon={<Palette className="size-5" />}
              description="Theme, colors, display"
            >
              Appearance
            </NavigationMenu.Item>
          </NavigationMenu.Section>
        </div>
      </NavigationMenu.Panel>

      {/* Audio Settings Panel */}
      <NavigationMenu.Panel id="settings/audio" parent="settings" title="Audio">
        <NavigationMenu.Header />
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-text-secondary">Audio settings coming soon...</p>
        </div>
      </NavigationMenu.Panel>

      {/* Appearance Settings Panel */}
      <NavigationMenu.Panel id="settings/appearance" parent="settings" title="Appearance">
        <NavigationMenu.Header />
        <AppearanceSettingsContent />
      </NavigationMenu.Panel>

      {/* Dev Panel */}
      <NavigationMenu.Panel id="dev" parent="root" title="Dev">
        <NavigationMenu.Header />
        <div className="flex-1 overflow-y-auto">
          <NavigationMenu.Section>
            <NavigationMenu.Item
              to="dev/stats"
              icon={<Activity className="size-5" />}
              description="View all game variables"
            >
              Debug Stats
            </NavigationMenu.Item>
          </NavigationMenu.Section>
          <NavigationMenu.Section title="Danger Zone">
            <NavigationMenu.Item
              to="dev/reset"
              icon={<RotateCcw className="size-5" />}
            >
              Reset Progress
            </NavigationMenu.Item>
          </NavigationMenu.Section>
        </div>
      </NavigationMenu.Panel>

      {/* Debug Stats Panel */}
      <NavigationMenu.Panel id="dev/stats" parent="dev" title="Debug Stats">
        <NavigationMenu.Header />
        <DebugStatsContent />
      </NavigationMenu.Panel>

      {/* Reset Progress Confirmation Panel */}
      <NavigationMenu.Panel id="dev/reset" parent="dev" title="Reset Progress">
        <NavigationMenu.Header />
        <ResetConfirmationContent onClose={onClose} />
      </NavigationMenu.Panel>
    </>
  )
}

function ThemeSwatch({ colors }: { colors: { bg: string; accent: string; text: string } }) {
  return (
    <div
      className="size-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10"
      style={{ backgroundColor: colors.bg }}
    >
      <div className="h-full flex flex-col justify-end p-1.5 gap-0.5">
        <div
          className="h-1 w-full rounded-full"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="h-0.5 w-3/4 rounded-full opacity-60"
          style={{ backgroundColor: colors.text }}
        />
      </div>
    </div>
  )
}

function AppearanceSettingsContent() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="rounded-xl overflow-hidden border border-border-subtle">
        {themes.map((t, index) => {
          const isSelected = theme === t.id
          const isFirst = index === 0
          const isLast = index === themes.length - 1

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3',
                'text-left transition-colors',
                'focus:outline-none focus-visible:bg-bg-tertiary',
                !isFirst && 'border-t border-border-subtle',
                isSelected ? 'bg-accent/5' : 'hover:bg-bg-tertiary/50',
                isFirst && 'rounded-t-xl',
                isLast && 'rounded-b-xl'
              )}
            >
              <ThemeSwatch colors={t.colors} />
              <span
                className={cn(
                  'flex-1 text-sm font-medium',
                  isSelected ? 'text-accent' : 'text-text-primary'
                )}
              >
                {t.name}
              </span>
              <div
                className={cn(
                  'size-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSelected
                    ? 'border-accent bg-accent'
                    : 'border-border'
                )}
              >
                {isSelected && <Check className="size-3 text-white" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DebugStatsContent() {
  const guestQuery = World.createQuery([GuestComponent])
  const buildingQuery = World.createQuery([BuildingComponent])

  const stats = useTick(useCallback(() => {
    const parkEntity = Park.entity()
    const guestCount = World.query(guestQuery).size
    const buildingCount = World.query(buildingQuery).size
    const modifiers = Modifier.getForStat(parkEntity, ParkStat.attractiveness)
      .map(e => World.get(e, ModifierComponent))
      .filter((m): m is NonNullable<typeof m> => m !== undefined)

    return {
      money: Park.money(),
      attractivenessBase: Stat.get(parkEntity, ParkStat.attractiveness),
      attractivenessFinal: Park.attractivenessFinal(),
      novelty: Park.novelty(),
      entryFee: Park.entryFee(),
      guestCount,
      buildingCount,
      modifiers,
    }
  }, []))

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Park Stats */}
      <section>
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          Park
        </h3>
        <div className="rounded-lg bg-bg-secondary p-3 font-mono text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-text-secondary">money</span>
            <span className="text-text-primary">${stats.money.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">attractiveness (base)</span>
            <span className="text-text-primary">{stats.attractivenessBase}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">attractiveness (final)</span>
            <span className="text-text-primary">{stats.attractivenessFinal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">novelty</span>
            <span className="text-text-primary">{stats.novelty.toFixed(1)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">entryFee</span>
            <span className="text-text-primary">${stats.entryFee}</span>
          </div>
        </div>
      </section>

      {/* Spawn Rate */}
      <section>
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          Spawn Rate
        </h3>
        <div className="rounded-lg bg-bg-secondary p-3 font-mono text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-text-secondary">guests/sec</span>
            <span className="text-text-primary">
              {((stats.attractivenessFinal + stats.novelty) * CONFIG.spawn.factor).toFixed(2)}
            </span>
          </div>
          <div className="border-t border-border-secondary pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-text-secondary">
              <span>attractiveness</span>
              <span>{stats.attractivenessFinal}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>+ novelty</span>
              <span>{stats.novelty.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>= total</span>
              <span>{(stats.attractivenessFinal + stats.novelty).toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>× factor</span>
              <span>{CONFIG.spawn.factor}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Entity Counts */}
      <section>
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          Entities
        </h3>
        <div className="rounded-lg bg-bg-secondary p-3 font-mono text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-text-secondary">guests</span>
            <span className="text-text-primary">{stats.guestCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">buildings</span>
            <span className="text-text-primary">{stats.buildingCount}</span>
          </div>
        </div>
      </section>

      {/* Attractiveness Modifiers */}
      <section>
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
          Attractiveness Modifiers
        </h3>
        <div className="rounded-lg bg-bg-secondary p-3 font-mono text-xs space-y-1">
          {stats.modifiers.length === 0 ? (
            <p className="text-text-tertiary">No modifiers</p>
          ) : (
            stats.modifiers.map((mod, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="text-text-secondary truncate">{mod.source}</span>
                <span className="text-text-primary shrink-0">+{mod.value}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

type ResetConfirmationContentProps = {
  onClose: () => void
}

function ResetConfirmationContent({ onClose }: ResetConfirmationContentProps) {
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = useCallback(async () => {
    setIsResetting(true)
    try {
      Persistence.stopAutoSave()
      await Persistence.delete()
      Game.reset()
      onClose()
      Toast.success('Progress reset successfully')
      // Give toast time to show, then reload for fresh state
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Failed to reset progress:', error)
      Toast.error('Failed to reset progress')
      setIsResetting(false)
    }
  }, [onClose])

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-error/10 border border-error/20">
        <AlertTriangle className="size-5 text-error shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-text-primary">
            This action cannot be undone
          </p>
          <p className="text-sm text-text-secondary">
            All your buildings, money, and progress will be permanently deleted.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleReset}
        disabled={isResetting}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-medium text-sm',
          'bg-error text-white',
          'hover:bg-error/90 active:bg-error/80',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
      >
        {isResetting ? 'Resetting...' : 'Reset Everything'}
      </button>
    </div>
  )
}

export const HamburgerMenu = {
  Root: HamburgerMenuRoot,
  Trigger: HamburgerMenuTrigger,
  Content: HamburgerMenuContent,
  useMenu: useHamburgerMenu,
}
