// src/components/Navigation.tsx
import Link from 'next/link'

interface NavItem {
  id: string
  label: string
  description: string
  href: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'E', label: 'E', description: 'Explore - 입문원리', href: '/explore' },
  { id: 'D', label: 'D', description: 'Develop - 실전 구현', href: '/develop' },
  {
    id: 'I',
    label: 'I',
    description: 'Innovate - 새로운방법, 창의적시도',
    href: '/innovate',
  },
  {
    id: 'T',
    label: 'T',
    description: 'Troubleshooting - 문제해결, 디버깅',
    href: '/troubleshooting',
  },
  {
    id: 'H',
    label: 'H',
    description: 'Humanism - 나에 대한 소개',
    href: '/humanism',
  },
]

export default function Navigation() {
  return (
    <nav className='hidden lg:flex space-x-8'>
      {NAV_ITEMS.map(item => {
        const displayName = item.description.split(' - ')[0].toLowerCase()

        return (
          <Link
            key={item.id}
            href={item.href}
            className='group relative px-4 py-2 text-blue-300 hover:text-white transition-all duration-200 font-medium'
          >
            <span className='capitalize'>{displayName}</span>
            <div className='absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-200' />
          </Link>
        )
      })}
    </nav>
  )
}

export { NAV_ITEMS }
export type { NavItem }
