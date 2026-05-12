import { gql } from '@apollo/client'

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
		) {
			records {
				id
			}
		}
	}
`
