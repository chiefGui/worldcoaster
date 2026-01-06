import type { ReactNode } from 'react'
import { Hammer, Users, Sparkles } from 'lucide-react'
import { Drawer } from '@ui/component/drawer'
import { BuildingPlacement } from '@ui/feature/building-placement/building-placement'
import { PerkPanel } from '@ui/feature/perk-panel/perk-panel'
import { cn } from '@ui/lib/cn'

type FooterButtonProps = {
  icon: ReactNode
  label: string
  onClick?: () => void
}

function FooterButton({ icon, label, onClick }: FooterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 flex-1 py-2',
        'text-text-secondary hover:text-text-primary',
        'transition-colors'
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

export function Footer() {
  const { openPicker } = BuildingPlacement.usePlacement()
  const { openPanel: openPerks } = PerkPanel.usePerkPanel()
  const staffDrawerStore = Drawer.useStore()

  return (
    <>
      <footer
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40',
          'bg-bg-secondary border-t border-border',
          'flex items-center justify-around',
          'px-4 pb-safe'
        )}
      >
        <FooterButton
          icon={<Hammer className="size-6" />}
          label="Build"
          onClick={openPicker}
        />
        <FooterButton
          icon={<Users className="size-6" />}
          label="Staff"
          onClick={() => staffDrawerStore.show()}
        />
        <FooterButton
          icon={<Sparkles className="size-6" />}
          label="Perks"
          onClick={openPerks}
        />
      </footer>

      <Drawer.Root store={staffDrawerStore}>
        <Drawer.Content side="right" className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Drawer.Heading>Staff</Drawer.Heading>
            <Drawer.Close>&times;</Drawer.Close>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            <p className="text-text-muted text-center">
              Staff management coming soon
            </p>
          </div>
        </Drawer.Content>
      </Drawer.Root>
    </>
  )
}
