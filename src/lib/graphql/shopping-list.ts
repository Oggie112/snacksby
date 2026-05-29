import { gql } from '@apollo/client'

export const CATEGORIES = [
	'Produce',
	'Meat & Fish',
	'Dairy',
	'Bakery',
	'Pantry',
	'Frozen',
	'Drinks',
	'Misc',
] as const

export type Category = (typeof CATEGORIES)[number]

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
	Produce: [
		'onion',
		'garlic',
		'tomato',
		'potato',
		'carrot',
		'lettuce',
		'spinach',
		'pepper',
		'courgette',
		'lemon',
		'lime',
		'apple',
		'banana',
		'mushroom',
		'broccoli',
		'celery',
		'leek',
		'ginger',
		'chilli',
		'coriander',
		'parsley',
		'basil',
		'thyme',
		'rosemary',
		'herb',
		'salad',
		'cucumber',
		'avocado',
	],
	'Meat & Fish': [
		'chicken',
		'beef',
		'mince',
		'pork',
		'lamb',
		'bacon',
		'sausage',
		'turkey',
		'salmon',
		'tuna',
		'fish',
		'prawn',
		'cod',
		'haddock',
		'steak',
		'breast',
		'thigh',
		'fillet',
		'chorizo',
		'ham',
		'meatball',
	],
	Dairy: [
		'milk',
		'cream',
		'cheese',
		'butter',
		'yoghurt',
		'yogurt',
		'egg',
		'eggs',
		'cheddar',
		'mozzarella',
		'parmesan',
		'feta',
		'crème',
		'creme',
		'mascarpone',
	],
	Bakery: [
		'bread',
		'roll',
		'baguette',
		'flour',
		'sourdough',
		'loaf',
		'pitta',
		'tortilla',
		'wrap',
		'croissant',
		'bagel',
	],
	Pantry: [
		'pasta',
		'rice',
		'oil',
		'stock',
		'tin',
		'sauce',
		'vinegar',
		'salt',
		'sugar',
		'honey',
		'soy',
		'purée',
		'puree',
		'canned',
		'beans',
		'lentils',
		'spaghetti',
		'noodles',
		'spice',
		'cumin',
		'paprika',
		'oregano',
		'bay',
		'mustard',
		'ketchup',
		'mayo',
		'mayonnaise',
		'lentil',
		'chickpea',
		'coconut',
		'curry',
		'cornflour',
		'breadcrumb',
		'yeast',
		'baking',
	],
	Frozen: ['frozen', 'ice cream', 'peas'],
	Drinks: [
		'wine',
		'beer',
		'juice',
		'water',
		'coffee',
		'tea',
		'fizzy',
		'squash',
		'smoothie',
		'cider',
		'spirit',
		'vodka',
		'gin',
	],
	Misc: [],
}

export function guessCategory(name: string): Category {
	const lower = name.toLowerCase()
	for (const category of CATEGORIES) {
		if (category === 'Misc') continue
		if (CATEGORY_KEYWORDS[category].some((kw) => lower.includes(kw))) {
			return category
		}
	}
	return 'Misc'
}

export interface ShoppingListItem {
	id: string
	name: string
	category: string | null
	quantity: string | null
	checked: boolean
	created_at: string
}

export interface ShoppingListData {
	shopping_list_itemsCollection: {
		edges: Array<{ node: ShoppingListItem }>
	}
}

export const GET_SHOPPING_LIST = gql`
	query GetShoppingList($householdId: UUID!) {
		shopping_list_itemsCollection(
			filter: { household_id: { eq: $householdId } }
			orderBy: [{ created_at: AscNullsLast }]
		) {
			edges {
				node {
					id
					name
					category
					quantity
					checked
					created_at
				}
			}
		}
	}
`

export interface WeekIngredientRecipe {
	id: string
	ingredients: string
}

export interface WeekIngredientsData {
	meal_planCollection: {
		edges: Array<{
			node: { recipes: WeekIngredientRecipe }
		}>
	}
}

export const GET_WEEK_INGREDIENTS = gql`
	query GetWeekIngredients(
		$householdId: UUID!
		$startDate: Date!
		$endDate: Date!
	) {
		meal_planCollection(
			filter: {
				household_id: { eq: $householdId }
				date: { gte: $startDate, lte: $endDate }
			}
		) {
			edges {
				node {
					recipes {
						id
						ingredients
					}
				}
			}
		}
	}
`

export interface AddItemResult {
	insertIntoshopping_list_itemsCollection: {
		records: Array<{ id: string }>
	}
}

export const ADD_ITEM = gql`
	mutation AddShoppingItem(
		$householdId: UUID!
		$name: String!
		$quantity: String
		$category: String
	) {
		insertIntoshopping_list_itemsCollection(
			objects: [
				{
					household_id: $householdId
					name: $name
					quantity: $quantity
					category: $category
					checked: false
				}
			]
		) {
			records {
				id
			}
		}
	}
`

export interface ToggleItemResult {
	updateshopping_list_itemsCollection: {
		records: Array<{ id: string; checked: boolean }>
	}
}

export const TOGGLE_ITEM = gql`
	mutation ToggleShoppingItem($id: UUID!, $checked: Boolean!) {
		updateshopping_list_itemsCollection(
			filter: { id: { eq: $id } }
			set: { checked: $checked }
		) {
			records {
				id
				checked
			}
		}
	}
`

export interface RemoveItemResult {
	deleteFromshopping_list_itemsCollection: {
		records: Array<{ id: string }>
	}
}

export const REMOVE_ITEM = gql`
	mutation RemoveShoppingItem($id: UUID!) {
		deleteFromshopping_list_itemsCollection(filter: { id: { eq: $id } }) {
			records {
				id
			}
		}
	}
`

export interface ClearCheckedResult {
	deleteFromshopping_list_itemsCollection: {
		records: Array<{ id: string }>
	}
}

export const CLEAR_CHECKED = gql`
	mutation ClearCheckedItems($householdId: UUID!) {
		deleteFromshopping_list_itemsCollection(
			filter: { household_id: { eq: $householdId }, checked: { eq: true } }
			atMost: 1000
		) {
			records {
				id
			}
		}
	}
`

export interface UpdateItemQuantityResult {
	updateshopping_list_itemsCollection: {
		records: Array<{ id: string; quantity: string | null }>
	}
}

export const UPDATE_ITEM_QUANTITY = gql`
	mutation UpdateItemQuantity($id: UUID!, $quantity: String) {
		updateshopping_list_itemsCollection(
			filter: { id: { eq: $id } }
			set: { quantity: $quantity }
		) {
			records {
				id
				quantity
			}
		}
	}
`

export interface UpdateItemCategoryResult {
	updateshopping_list_itemsCollection: {
		records: Array<{ id: string; category: string | null }>
	}
}

export const UPDATE_ITEM_CATEGORY = gql`
	mutation UpdateItemCategory($id: UUID!, $category: String!) {
		updateshopping_list_itemsCollection(
			filter: { id: { eq: $id } }
			set: { category: $category }
		) {
			records {
				id
				category
			}
		}
	}
`
