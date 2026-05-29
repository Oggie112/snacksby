export const UNITS = [
	'g',
	'kg',
	'ml',
	'L',
	'tsp',
	'tbsp',
	'cup',
	'piece',
	'clove',
	'slice',
	'sprig',
	'bunch',
	'pinch',
	'bottle',
] as const

export type Unit = (typeof UNITS)[number]

// Units that convert to a base unit for summing
const TO_BASE = new Map<Unit, { unit: Unit; factor: number }>([
	['kg', { unit: 'g', factor: 1000 }],
	['L', { unit: 'ml', factor: 1000 }],
])

// Base units that can be promoted back to a larger unit for display
const PROMOTE = new Map<Unit, { unit: Unit; factor: number }>([
	['g', { unit: 'kg', factor: 1000 }],
	['ml', { unit: 'L', factor: 1000 }],
])

function normalise(
	amount: number,
	unit: Unit | null,
): { amount: number; unit: Unit | null } {
	const conversion = unit ? TO_BASE.get(unit) : undefined
	if (conversion)
		return { amount: amount * conversion.factor, unit: conversion.unit }
	return { amount, unit }
}

function format(amount: number, unit: Unit | null): string {
	const promotion = unit ? PROMOTE.get(unit) : undefined
	if (promotion && amount >= promotion.factor) {
		const value = Math.round((amount / promotion.factor) * 100) / 100
		return `${value} ${promotion.unit}`
	}
	const rounded = Math.round(amount * 100) / 100
	return unit ? `${rounded} ${unit}` : String(rounded)
}

export function parseQuantityString(
	str: string | null | undefined,
): Array<{ amount: number; unit: Unit | null }> {
	if (!str?.trim()) return []
	return str.split(' + ').flatMap((part) => {
		const match = part.trim().match(/^([\d.]+)\s*([a-zA-Z]*)$/)
		if (!match) return []
		const amount = parseFloat(match[1])
		if (isNaN(amount)) return []
		const unitStr = match[2].trim()
		const unit = UNITS.includes(unitStr as Unit) ? (unitStr as Unit) : null
		return [{ amount, unit }]
	})
}

export function sumIngredients(
	quantities: Array<{ amount: number; unit: Unit | null }>,
): string {
	const totals = new Map<string, number>()

	for (const q of quantities) {
		const { amount, unit } = normalise(q.amount, q.unit)
		const key = unit ?? ''
		totals.set(key, (totals.get(key) ?? 0) + amount)
	}

	return Array.from(totals.entries())
		.map(([key, total]) => format(total, (key || null) as Unit | null))
		.join(' + ')
}
