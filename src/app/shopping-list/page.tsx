'use client'

import { Suspense, useRef, useState } from 'react'

import { useMutation, useQuery } from '@apollo/client/react'

import { useUserAndSession } from '@/components/session-provider'
import {
	GET_MY_HOUSEHOLD,
	type MyHouseholdData,
} from '@/lib/graphql/households'
import {
	ADD_ITEM,
	CLEAR_CHECKED,
	GET_SHOPPING_LIST,
	GET_WEEK_INGREDIENTS,
	REMOVE_ITEM,
	TOGGLE_ITEM,
	type AddItemResult,
	type ClearCheckedResult,
	type RemoveItemResult,
	type ShoppingListData,
	type ToggleItemResult,
	type WeekIngredientsData,
} from '@/lib/graphql/shopping-list'

interface Ingredient {
	name: string
	quantity: string
}

function toISO(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0'),
	].join('-')
}

function getMondayOf(input: Date): Date {
	const d = new Date(input)
	const day = d.getDay()
	d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
	d.setHours(0, 0, 0, 0)
	return d
}

function addDays(date: Date, n: number): Date {
	const d = new Date(date)
	d.setDate(d.getDate() + n)
	return d
}

function ShoppingListContent() {
	const { user } = useUserAndSession()
	const [newItem, setNewItem] = useState('')
	const [importMessage, setImportMessage] = useState<string | null>(null)
	const [importing, setImporting] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	const thisWeekStart = getMondayOf(new Date())
	const nextWeekStart = addDays(thisWeekStart, 7)

	const { data: householdData, loading: householdLoading } =
		useQuery<MyHouseholdData>(GET_MY_HOUSEHOLD, {
			variables: { user_id: user?.id },
			skip: !user?.id,
		})

	const householdId =
		householdData?.household_membersCollection?.edges?.[0]?.node
			?.household_id ?? null

	const {
		data: listData,
		loading: listLoading,
		refetch,
	} = useQuery<ShoppingListData>(GET_SHOPPING_LIST, {
		variables: { householdId },
		skip: !householdId,
		fetchPolicy: 'cache-and-network',
	})

	const [addItem, { loading: adding }] = useMutation<AddItemResult>(ADD_ITEM, {
		onCompleted: () => void refetch(),
	})

	const [toggleItem] = useMutation<ToggleItemResult>(TOGGLE_ITEM, {
		onCompleted: () => void refetch(),
	})

	const [removeItem] = useMutation<RemoveItemResult>(REMOVE_ITEM, {
		onCompleted: () => void refetch(),
	})

	const [clearChecked] = useMutation<ClearCheckedResult>(CLEAR_CHECKED, {
		onCompleted: () => void refetch(),
	})

	const { refetch: fetchWeekIngredients } = useQuery<WeekIngredientsData>(
		GET_WEEK_INGREDIENTS,
		{
			skip: true,
		},
	)

	async function handleImport(weekStart: Date) {
		if (!householdId) return
		setImporting(true)
		setImportMessage(null)

		const weekEnd = addDays(weekStart, 6)
		const { data } = await fetchWeekIngredients({
			householdId,
			startDate: toISO(weekStart),
			endDate: toISO(weekEnd),
		})

		const edges = data?.meal_planCollection?.edges ?? []

		const grouped = new Map<string, string[]>()

		for (const { node } of edges) {
			const ingredients: Ingredient[] = JSON.parse(node.recipes.ingredients)
			for (const { name, quantity } of ingredients) {
				const key = name.toLowerCase()
				const existing = grouped.get(key)
				if (existing) {
					existing.push(quantity)
				} else {
					grouped.set(key, [name, quantity])
				}
			}
		}

		if (grouped.size === 0) {
			setImportMessage('No meals planned for that week.')
			setImporting(false)
			return
		}

		// Filter out names already on the list
		const onList = new Set(
			(listData?.shopping_list_itemsCollection?.edges ?? []).map((e) =>
				e.node.name.toLowerCase(),
			),
		)

		let added = 0
		for (const [key, [name, ...quantities]] of grouped) {
			if (onList.has(key)) continue
			await addItem({
				variables: {
					householdId,
					name,
					quantity: quantities.join(' + ') || null,
				},
			})
			added++
		}

		await refetch()
		setImportMessage(
			added > 0
				? `Added ${added} item${added === 1 ? '' : 's'}.`
				: 'Nothing new to add.',
		)
		setImporting(false)
	}

	if (!user || householdLoading) {
		return (
			<div className="p-4">
				<span className="loading loading-spinner loading-md" />
			</div>
		)
	}

	if (!householdId) {
		return (
			<div className="p-4">
				<p className="text-base-content/60">
					Join or create a household to use the shopping list.
				</p>
			</div>
		)
	}

	const items =
		listData?.shopping_list_itemsCollection?.edges?.map((e) => e.node) ?? []
	const hasChecked = items.some((i) => i.checked)

	async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const name = newItem.trim()
		if (!name) return
		setNewItem('')
		await addItem({ variables: { householdId, name } })
		inputRef.current?.focus()
	}

	return (
		<div className="p-4 space-y-4 max-w-2xl mx-auto">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Shopping List</h1>
				{listLoading && <span className="loading loading-spinner loading-sm" />}
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<button
					className="btn btn-sm btn-outline"
					disabled={importing}
					onClick={() => void handleImport(thisWeekStart)}
				>
					{importing ? (
						<span className="loading loading-spinner loading-xs" />
					) : (
						'Import this week'
					)}
				</button>
				<button
					className="btn btn-sm btn-outline"
					disabled={importing}
					onClick={() => void handleImport(nextWeekStart)}
				>
					{importing ? (
						<span className="loading loading-spinner loading-xs" />
					) : (
						'Import next week'
					)}
				</button>
				{importMessage && (
					<span className="text-sm text-base-content/60">{importMessage}</span>
				)}
			</div>

			{items.length === 0 && !listLoading ? (
				<p className="text-base-content/60">Your shopping list is empty.</p>
			) : (
				<ul className="space-y-2">
					{items.map((item) => (
						<li key={item.id} className="flex items-center gap-3">
							<input
								type="checkbox"
								id={item.id}
								checked={item.checked}
								className="checkbox"
								onChange={() =>
									void toggleItem({
										variables: { id: item.id, checked: !item.checked },
									})
								}
							/>
							<label
								htmlFor={item.id}
								className={`flex-1 ${item.checked ? 'line-through text-base-content/40' : ''}`}
							>
								{item.name}
								{item.quantity && (
									<span className="ml-2 text-sm text-base-content/50">
										{item.quantity}
									</span>
								)}
							</label>
							<button
								className="btn btn-ghost btn-xs text-error"
								aria-label="Remove item"
								onClick={() => void removeItem({ variables: { id: item.id } })}
							>
								×
							</button>
						</li>
					))}
				</ul>
			)}

			{hasChecked && (
				<button
					className="btn btn-sm btn-ghost text-base-content/50"
					onClick={() => void clearChecked({ variables: { householdId } })}
				>
					Clear checked
				</button>
			)}

			<form onSubmit={(e) => void handleAdd(e)} className="flex gap-2">
				<input
					ref={inputRef}
					type="text"
					placeholder="Add item..."
					className="input input-bordered flex-1"
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
				/>
				<button type="submit" className="btn btn-primary" disabled={adding}>
					{adding ? (
						<span className="loading loading-spinner loading-xs" />
					) : (
						'Add'
					)}
				</button>
			</form>
		</div>
	)
}

export default function ShoppingListPage() {
	return (
		<Suspense
			fallback={
				<div className="p-4">
					<span className="loading loading-spinner loading-md" />
				</div>
			}
		>
			<ShoppingListContent />
		</Suspense>
	)
}
