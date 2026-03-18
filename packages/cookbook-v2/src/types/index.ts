import type { ComponentType } from "react";

export interface Example {
  id: string
  title: string
  description: string
  category: string
  source: string
  component: ComponentType
}

export interface NavigationItem {
  label: string
  href: string
  icon?: ComponentType<{ className?: string }>
}

export interface GLReactContextType {
  version: string
  examples: Example[]
}


