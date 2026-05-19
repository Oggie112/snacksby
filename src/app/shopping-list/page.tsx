'use client'

import { Suspense, useRef, useState } from 'react'

import { useMutation, useQuery } from '@apollo/client/react'

import { useUserAndSession } from '@/components/session-provider'
import {
	GET_MY_HOUSEHOLD,
	type MyHouseholdData,
} from '@/lib/graphql/households'
import { type Ingredient } from '@/lib/graphql/recipes'
import {
	ADD_ITEM,
	CATEGORIES,
	CLEAR_CHECKED,
	GET_SHOPPING_LIST,
	GET_WEEK_INGREDIENTS,
	REMOVE_ITEM,
	TOGGLE_ITEM,
	UPDATE_ITEM_CATEGORY,
	UPDATE_ITEM_QUANTITY,
	guessCategory,
	type AddItemResult,
	type Category,
	type ClearCheckedResult,
	type RemoveItemResult,
	type ShoppingListData,
	type ToggleItemResult,
	type UpdateItemCategoryResult,
	type UpdateItemQuantityResult,
	type WeekIngredientsData,
} from '@/lib/graphql/shopping-list'
import {
	UNITS,
	parseQuantityString,
	sumIngredients,
	type Unit,
} from '@/lib/units'

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
	const [newAmount, setNewAmount] = useState('')
	const [newUnit, setNewUnit] = useState<Unit | null>(null)
	const [newCategory, setNewCategory] = useState<Category>('Misc')
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

	const [updateItemCategory] =
		useMutation<UpdateItemCategoryResult>(UPDATE_ITEM_CATEGORY)

	const [updateItemQuantity] = useMutation<UpdateItemQuantityResult>(
		UPDATE_ITEM_QUANTITY,
		{
			onCompleted: () => void refetch(),
		},
	)

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

		const grouped = new Map<
			string,
			{ name: string; quantities: Array<{ amount: number; unit: Unit | null }> }
		>()

		for (const { node } of edges) {
			const ingredients: Ingredient[] = JSON.parse(node.recipes.ingredients)
			for (const { name, amount, unit } of ingredients) {
				const key = name.toLowerCase()
				const existing = grouped.get(key)
				if (existing) {
					existing.quantities.push({ amount, unit })
				} else {
					grouped.set(key, { name, quantities: [{ amount, unit }] })
				}
			}
		}

		if (grouped.size === 0) {
			setImportMessage('No meals planned for that week.')
			setImporting(false)
			return
		}

		const onListMap = new Map(
			(listData?.shopping_list_itemsCollection?.edges ?? []).map((e) => [
				e.node.name.toLowerCase(),
				e.node,
			]),
		)

		let added = 0
		let updated = 0
		for (const [key, { name, quantities }] of grouped) {
			const existing = onListMap.get(key)
			if (existing) {
				const merged = sumIngredients([
					...parseQuantityString(existing.quantity),
					...quantities,
				])
				await updateItemQuantity({
					variables: { id: existing.id, quantity: merged },
				})
				updated++
			} else {
				await addItem({
					variables: {
						householdId,
						name,
						quantity: sumIngredients(quantities),
						category: guessCategory(name),
					},
				})
				added++
			}
		}

		await refetch()
		const parts: string[] = []
		if (added > 0) parts.push(`Added ${added} item${added === 1 ? '' : 's'}`)
		if (updated > 0)
			parts.push(`updated ${updated} item${updated === 1 ? '' : 's'}`)
		setImportMessage(
			parts.length > 0 ? `${parts.join(', ')}.` : 'Nothing new to add.',
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

	const grouped = CATEGORIES.map((cat) => ({
		category: cat,
		items: items.filter((i) => (i.category ?? 'Misc') === cat),
	})).filter((g) => g.items.length > 0)

	async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const name = newItem.trim()
		if (!name) return

		const existing = items.find(
			(i) => i.name.toLowerCase() === name.toLowerCase(),
		)

		setNewItem('')
		setNewAmount('')
		setNewUnit(null)
		setNewCategory('Misc')

		if (existing && newAmount) {
			const merged = sumIngredients([
				...parseQuantityString(existing.quantity),
				{ amount: parseFloat(newAmount), unit: newUnit },
			])
			await updateItemQuantity({
				variables: { id: existing.id, quantity: merged },
			})
		} else {
			const category =
				newCategory === 'Misc' ? guessCategory(name) : newCategory
			const quantity = newAmount
				? sumIngredients([{ amount: parseFloat(newAmount), unit: newUnit }])
				: null
			await addItem({ variables: { householdId, name, quantity, category } })
		}

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
				<div className="space-y-4">
					{grouped.map(({ category, items: groupItems }) => (
						<div key={category}>
							<p className="text-xs font-semibold uppercase tracking-wide text-base-content/40 mb-1">
								{category}
							</p>
							<ul className="space-y-2">
								{groupItems.map((item) => (
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
										<select
											className="select select-ghost select-xs text-base-content/50"
											value={item.category ?? 'Misc'}
											onChange={(e) =>
												void updateItemCategory({
													variables: { id: item.id, category: e.target.value },
												}).then(() => void refetch())
											}
										>
											{CATEGORIES.map((cat) => (
												<option key={cat} value={cat}>
													{cat}
												</option>
											))}
										</select>
										<button
											className="btn btn-ghost btn-xs text-error"
											aria-label="Remove item"
											onClick={() =>
												void removeItem({ variables: { id: item.id } })
											}
										>
											×
										</button>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}

			{hasChecked && (
				<button
					className="btn btn-sm btn-ghost text-base-content/50"
					onClick={() => void clearChecked({ variables: { householdId } })}
				>
					Clear checked
				</button>
			)}

			<form
				onSubmit={(e) => void handleAdd(e)}
				className="flex gap-2 flex-wrap"
			>
				<input
					type="number"
					min="0"
					step="any"
					placeholder="Qty"
					value={newAmount}
					onChange={(e) => setNewAmount(e.target.value)}
					className="input input-bordered w-20 shrink-0"
				/>
				<select
					value={newUnit ?? ''}
					onChange={(e) => setNewUnit((e.target.value as Unit) || null)}
					className="select select-bordered w-24 shrink-0"
				>
					<option value="">—</option>
					{UNITS.map((u) => (
						<option key={u} value={u}>
							{u}
						</option>
					))}
				</select>
				<input
					ref={inputRef}
					type="text"
					placeholder="Add item..."
					className="input input-bordered flex-1"
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
					onBlur={() => {
						if (newCategory === 'Misc') {
							setNewCategory(guessCategory(newItem.trim()))
						}
					}}
				/>
				<select
					className="select select-bordered w-24 shrink-0"
					value={newCategory}
					onChange={(e) => setNewCategory(e.target.value as Category)}
				>
					{CATEGORIES.map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
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
