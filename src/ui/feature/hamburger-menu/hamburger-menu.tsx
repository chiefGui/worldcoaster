import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Menu, Settings, HelpCircle, Volume2, Palette, RotateCcw, AlertTriangle, Check } from 'lucide-react'
import * as Ariakit from '@ariakit/react'
import { Drawer } from '@ui/component/drawer'
import { NavigationMenu } from '@ui/component/navigation-menu'
import { Toast } from '@ui/component/toast'
import { Persistence } from '@ecs/persistence/persistence'
import { Game } from '@framework/setup'
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
          <NavigationMenu.Section title="Danger Zone">
            <NavigationMenu.Item
              to="settings/reset"
              icon={<RotateCcw className="size-5" />}
            >
              Reset Progress
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

      {/* Reset Progress Confirmation Panel */}
      <NavigationMenu.Panel id="settings/reset" parent="settings" title="Reset Progress">
        <NavigationMenu.Header />
        <ResetConfirmationContent onClose={onClose} />
      </NavigationMenu.Panel>
    </>
  )
}

function AppearanceSettingsContent() {
  const { theme, setTheme, themes } = useTheme()

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-secondary mb-3">Theme</h3>
        {themes.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-lg',
              'text-left text-sm font-medium transition-colors',
              theme === t.id
                ? 'bg-accent/10 text-accent border border-accent/30'
                : 'bg-bg-tertiary text-text-primary hover:bg-bg-tertiary/80 border border-transparent'
            )}
          >
            {t.name}
            {theme === t.id && <Check className="size-4" />}
          </button>
        ))}
      </div>
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
