'use client'

import { useEffect, useRef, useState } from 'react'

import { useOnlineStatus } from '@/hooks/use-online-status'

export function OfflineBanner() {
	const isOnline = useOnlineStatus()
	const [showBackOnline, setShowBackOnline] = useState(false)
	const wasOffline = useRef(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (!isOnline) {
			wasOffline.current = true
			if (timerRef.current) clearTimeout(timerRef.current)
			setShowBackOnline(false)
		} else if (wasOffline.current) {
			setShowBackOnline(true)
			timerRef.current = setTimeout(() => setShowBackOnline(false), 2000)
		}
	}, [isOnline])

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		},
		[],
	)

	if (!isOnline) {
		return (
			<div
				role="alert"
				className="alert alert-warning rounded-none py-2 text-sm justify-center"
			>
				<div className="flex flex-col items-center gap-0.5">
					<span>You&apos;re offline — some features may be unavailable.</span>
					<span className="opacity-75 text-xs">
						Changes made now may not be saved if you close the app before
						reconnecting.
					</span>
				</div>
			</div>
		)
	}

	if (showBackOnline) {
		return (
			<div
				role="alert"
				className="alert alert-success rounded-none py-2 text-sm justify-center"
			>
				<span>Back online</span>
			</div>
		)
	}

	return null
}
