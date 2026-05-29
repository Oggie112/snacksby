'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
	onClose: () => void
	labelledBy: string
	children: React.ReactNode
	className?: string
}

export default function Modal({
	onClose,
	labelledBy,
	children,
	className,
}: ModalProps) {
	const ref = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		ref.current?.showModal()
	}, [])

	function handleCancel(e: React.SyntheticEvent<HTMLDialogElement>) {
		// Prevent the browser closing the dialog directly — let React unmount it
		e.preventDefault()
		onClose()
	}

	function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
		if (e.target === e.currentTarget) onClose()
	}

	return (
		/* jsx-a11y doesn't recognise <dialog> as interactive; onClick here detects backdrop clicks
		   via target === currentTarget, which is the standard native dialog pattern */
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
		<dialog
			ref={ref}
			aria-labelledby={labelledBy}
			onCancel={handleCancel}
			onClick={handleBackdropClick}
			className="modal"
		>
			<div className={`modal-box ${className ?? ''}`}>{children}</div>
		</dialog>
	)
}
