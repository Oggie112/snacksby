'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'

const links = [
	{
		href: '/',
		label: 'Home',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="size-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={1.8}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M3 12l2-2m0 0l7-7 7 7m-9 10V10m4 10V10"
				/>
			</svg>
		),
	},
	{
		href: '/recipes',
		label: 'Recipes',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="size-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={1.8}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
				/>
			</svg>
		),
	},
	{
		href: '/plan',
		label: 'Plan',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="size-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={1.8}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
		),
	},
	{
		href: '/shopping-list',
		label: 'Shopping',
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="size-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={1.8}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
		),
	},
]

export function Nav() {
	const pathname = usePathname()
	const { user } = useUserAndSession()

	const initial = user?.email?.[0].toUpperCase() ?? '?'

	const isActive = (href: string) =>
		href === '/' ? pathname === '/' : pathname.startsWith(href)

	return (
		<>
			{/* Desktop: top navbar */}
			<nav className="hidden md:flex navbar bg-base-200 border-b border-base-300 px-4 sticky top-0 z-50">
				<div className="navbar-start">
					<div className="avatar relative w-20 h-20 rounded-full overflow-hidden">
						<Image
							src="/images/snacksby-logo.png"
							alt="Snacksby Logo"
							fill
							unoptimized
							loading="eager"
							className="object-cover object-center scale-[1.12]"
						/>
					</div>
				</div>
				<div className="navbar-center gap-1">
					{links.map(({ href, label }) => (
						<Link
							key={href}
							href={href}
							className={`btn btn-ghost btn-sm ${isActive(href) ? 'text-primary font-semibold' : ''}`}
						>
							{label}
						</Link>
					))}
				</div>
				<div className="navbar-end">
					<Link
						href="/settings"
						aria-label="Settings"
						className={`avatar avatar-placeholder rounded-full ${isActive('/settings') ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-200' : ''}`}
					>
						<div className="bg-secondary text-secondary-content rounded-full size-9 cursor-pointer hover:opacity-80 transition-opacity">
							<span className="text-sm font-semibold">{initial}</span>
						</div>
					</Link>
				</div>
			</nav>

			{/* Mobile: fixed bottom bar */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-200 border-t border-base-300 flex justify-around items-center h-16">
				{links.map(({ href, label, icon }) => (
					<Link
						key={href}
						href={href}
						aria-label={label}
						className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
							isActive(href) ? 'text-primary' : 'text-base-content/50'
						}`}
					>
						<span aria-hidden="true">{icon}</span>
						<span className="text-xs" aria-hidden="true">
							{label}
						</span>
					</Link>
				))}
				<Link
					href="/settings"
					className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
						isActive('/settings') ? 'text-primary' : 'text-base-content/50'
					}`}
				>
					<div className="avatar avatar-placeholder">
						<div className="bg-secondary text-secondary-content rounded-full size-6">
							<span className="text-xs font-semibold">{initial}</span>
						</div>
					</div>
					<span className="text-xs">Profile</span>
				</Link>
			</nav>
		</>
	)
}
