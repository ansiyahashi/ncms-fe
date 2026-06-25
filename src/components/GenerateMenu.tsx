// React Imports
import type { ReactNode } from 'react'

// MUI Imports
import Chip from '@mui/material/Chip'
import type { ChipProps } from '@mui/material/Chip'

// Type Imports
import type {
  VerticalMenuDataType,
  VerticalSectionDataType,
  VerticalSubMenuDataType,
  VerticalMenuItemDataType,
  HorizontalMenuDataType,
  HorizontalSubMenuDataType,
  HorizontalMenuItemDataType
} from '@/types/menuTypes'

// Component Imports
import { SubMenu as HorizontalSubMenu, MenuItem as HorizontalMenuItem } from '@menu/horizontal-menu'
import { SubMenu as VerticalSubMenu, MenuItem as VerticalMenuItem, MenuSection } from '@menu/vertical-menu'

import { useCheckUserPermission } from '@/hooks/useCheckUserPermission'

// Generate a menu from the menu data array
export const GenerateVerticalMenu = ({ menuData }: { menuData: VerticalMenuDataType[] }) => {
  const hasPermission = useCheckUserPermission()

  const filterMenuData = (data: VerticalMenuDataType[]): VerticalMenuDataType[] => {
    return data
      .map(item => {
        if ('isSection' in item && item.isSection) {
          const section = item as VerticalSectionDataType
          const filteredChildren = section.children ? filterMenuData(section.children) : []

          if (section.permission && !hasPermission(section.permission)) {
            return null
          }

          if (section.children && filteredChildren.length === 0) {
            return null
          }
          
          return {
            ...section,
            children: filteredChildren
          }
        }

        if ('children' in item && item.children) {
          const subMenu = item as VerticalSubMenuDataType
          const filteredChildren = subMenu.children ? filterMenuData(subMenu.children) : []

          if (subMenu.permission && !hasPermission(subMenu.permission)) {
            return null
          }

          if (subMenu.children && filteredChildren.length === 0) {
            return null
          }
          
          return {
            ...subMenu,
            children: filteredChildren
          }
        }

        const menuItem = item as VerticalMenuItemDataType

        if (menuItem.permission && !hasPermission(menuItem.permission)) {
          return null
        }
        
        return menuItem
      })
      .filter((item): item is VerticalMenuDataType => item !== null)
  }

  const renderMenuItems = (data: VerticalMenuDataType[]) => {
    return data.map((item: VerticalMenuDataType, index) => {
      const menuSectionItem = item as VerticalSectionDataType
      const subMenuItem = item as VerticalSubMenuDataType
      const menuItem = item as VerticalMenuItemDataType

      if (menuSectionItem.isSection) {
        const { children, ...rest } = menuSectionItem

        delete (rest as any).isSection

        return (
          <MenuSection key={index} {...rest}>
            {children && renderMenuItems(children)}
          </MenuSection>
        )
      }

      if (subMenuItem.children) {
        const { children, icon, prefix, suffix, ...rest } = subMenuItem
        const Icon = icon ? <i className={icon} /> : null

        const subMenuPrefix: ReactNode =
          prefix && (prefix as ChipProps).label ? (
            <Chip size='small' {...(prefix as ChipProps)} />
          ) : (
            (prefix as ReactNode)
          )

        const subMenuSuffix: ReactNode =
          suffix && (suffix as ChipProps).label ? (
            <Chip size='small' {...(suffix as ChipProps)} />
          ) : (
            (suffix as ReactNode)
          )

        return (
          <VerticalSubMenu
            key={index}
            prefix={subMenuPrefix}
            suffix={subMenuSuffix}
            {...rest}
            {...(Icon && { icon: Icon })}
          >
            {children && renderMenuItems(children)}
          </VerticalSubMenu>
        )
      }

      const { label, icon, prefix, suffix, ...rest } = menuItem
      const href = rest.href
      const Icon = icon ? <i className={icon} /> : null

      const menuItemPrefix: ReactNode =
        prefix && (prefix as ChipProps).label ? <Chip size='small' {...(prefix as ChipProps)} /> : (prefix as ReactNode)

      const menuItemSuffix: ReactNode =
        suffix && (suffix as ChipProps).label ? <Chip size='small' {...(suffix as ChipProps)} /> : (suffix as ReactNode)

      return (
        <VerticalMenuItem
          key={index}
          prefix={menuItemPrefix}
          suffix={menuItemSuffix}
          {...rest}
          href={href}
          {...(Icon && { icon: Icon })}
        >
          {label}
        </VerticalMenuItem>
      )
    })
  }

  const filteredData = filterMenuData(menuData)

  return <>{renderMenuItems(filteredData)}</>
}

// Generate a menu from the menu data array
export const GenerateHorizontalMenu = ({ menuData }: { menuData: HorizontalMenuDataType[] }) => {
  const hasPermission = useCheckUserPermission()

  const filterMenuData = (data: HorizontalMenuDataType[]): HorizontalMenuDataType[] => {
    return data
      .map(item => {
        if ('children' in item && item.children) {
          const subMenu = item as HorizontalSubMenuDataType
          const filteredChildren = subMenu.children ? filterMenuData(subMenu.children) : []

          if (subMenu.permission && !hasPermission(subMenu.permission)) {
            return null
          }

          if (subMenu.children && filteredChildren.length === 0) {
            return null
          }
          
          return {
            ...subMenu,
            children: filteredChildren
          }
        }

        const menuItem = item as HorizontalMenuItemDataType

        if (menuItem.permission && !hasPermission(menuItem.permission)) {
          return null
        }
        
        return menuItem
      })
      .filter((item): item is HorizontalMenuDataType => item !== null)
  }

  const renderMenuItems = (data: HorizontalMenuDataType[]) => {
    return data.map((item: HorizontalMenuDataType, index) => {
      const subMenuItem = item as HorizontalSubMenuDataType
      const menuItem = item as HorizontalMenuItemDataType

      if (subMenuItem.children) {
        const { children, icon, prefix, suffix, ...rest } = subMenuItem
        const Icon = icon ? <i className={icon} /> : null

        const subMenuPrefix: ReactNode =
          prefix && (prefix as ChipProps).label ? (
            <Chip size='small' {...(prefix as ChipProps)} />
          ) : (
            (prefix as ReactNode)
          )

        const subMenuSuffix: ReactNode =
          suffix && (suffix as ChipProps).label ? (
            <Chip size='small' {...(suffix as ChipProps)} />
          ) : (
            (suffix as ReactNode)
          )

        return (
          <HorizontalSubMenu
            key={index}
            prefix={subMenuPrefix}
            suffix={subMenuSuffix}
            {...rest}
            {...(Icon && { icon: Icon })}
          >
            {children && renderMenuItems(children)}
          </HorizontalSubMenu>
        )
      }

      const { label, icon, prefix, suffix, ...rest } = menuItem
      const href = rest.href
      const Icon = icon ? <i className={icon} /> : null

      const menuItemPrefix: ReactNode =
        prefix && (prefix as ChipProps).label ? <Chip size='small' {...(prefix as ChipProps)} /> : (prefix as ReactNode)

      const menuItemSuffix: ReactNode =
        suffix && (suffix as ChipProps).label ? <Chip size='small' {...(suffix as ChipProps)} /> : (suffix as ReactNode)

      return (
        <HorizontalMenuItem
          key={index}
          prefix={menuItemPrefix}
          suffix={menuItemSuffix}
          {...rest}
          href={href}
          {...(Icon && { icon: Icon })}
        >
          {label}
        </HorizontalMenuItem>
      )
    })
  }

  const filteredData = filterMenuData(menuData)

  return <>{renderMenuItems(filteredData)}</>
}
