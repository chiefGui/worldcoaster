export { NavigationMenuRoot, useNavigation } from './context'
export { NavigationMenuPanel } from './panel'
export { NavigationMenuItem } from './item'
export { NavigationMenuHeader } from './header'
export { NavigationMenuSection } from './section'

import { NavigationMenuRoot, useNavigation } from './context'
import { NavigationMenuPanel } from './panel'
import { NavigationMenuItem } from './item'
import { NavigationMenuHeader } from './header'
import { NavigationMenuSection } from './section'

export const NavigationMenu = {
  Root: NavigationMenuRoot,
  Panel: NavigationMenuPanel,
  Item: NavigationMenuItem,
  Header: NavigationMenuHeader,
  Section: NavigationMenuSection,
  useNavigation,
}
