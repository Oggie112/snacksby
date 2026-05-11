'use client'

import { useState, useRef } from 'react'

export default function ShoppingListPage() {
	const [items, setItems] = useState<
		{ id: string; text: string; done: boolean }[]
	>([])
	const [newItem, setNewItem] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)

	const addItem = () => {
		if (!newItem.trim()) return
		setItems([
			...items,
			{ id: crypto.randomUUID(), text: newItem.trim(), done: false },
		])
		setNewItem('')
		inputRef.current?.focus()
	}

	return (
		<div className="p-4 space-y-4 max-w-2xl mx-auto bg-neutral text-neutral-content">
			<h1 className="text-2xl font-bold">Shopping List</h1>

			{items.length === 0 ? (
				<p className="text-info">Your shopping list is empty.</p>
			) : (
				<ul className="list-disc list-inside">
					{items.map((item) => (
						<li key={item.id}>
							<input
								type="checkbox"
								id={item.id}
								checked={item.done}
								onChange={() =>
									setItems(
										items.map((i) =>
											i.id === item.id ? { ...i, done: !i.done } : i,
										),
									)
								}
							/>
							<label
								htmlFor={item.id}
								className={`ml-2 ${item.done ? 'line-through' : ''}`}
							>
								{item.text}
							</label>
						</li>
					))}
				</ul>
			)}

			<form
				onSubmit={(e) => {
					e.preventDefault()
					addItem()
				}}
				className="flex items-center space-x-2"
			>
				<input
					ref={inputRef}
					type="text"
					placeholder="Add item..."
					className="input input-bordered w-full max-w-xs"
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
				/>
				<button type="submit" className="btn btn-primary">
					Add
				</button>
			</form>
		</div>
	)
}
