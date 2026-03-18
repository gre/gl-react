export interface Example {
  id: string
  title: string
  description: string
  category: string
  source: string
  component: React.ComponentType
}

export interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface GLReactContextType {
  version: string
  examples: Example[]
}


