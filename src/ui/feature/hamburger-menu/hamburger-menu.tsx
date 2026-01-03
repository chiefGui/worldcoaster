import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { Menu, Settings, HelpCircle, Volume2, Palette, RotateCcw } from 'lucide-react'
import * as Ariakit from '@ariakit/react'
import { Drawer } from '@ui/component/drawer'
import { NavigationMenu } from '@ui/component/navigation-menu'
import { cn } from '@ui/lib/cn'

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
              icon={<RotateCcw className="size-5" />}
              onClick={onClose}
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
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-text-secondary">Appearance settings coming soon...</p>
        </div>
      </NavigationMenu.Panel>
    </>
  )
}

export const HamburgerMenu = {
  Root: HamburgerMenuRoot,
  Trigger: HamburgerMenuTrigger,
  Content: HamburgerMenuContent,
  useMenu: useHamburgerMenu,
}
