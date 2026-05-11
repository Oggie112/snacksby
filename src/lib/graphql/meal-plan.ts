import { gql } from '@apollo/client'

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'

export interface MealPlanRecipe {
	id: string
	title: string
}

export interface MealPlanNode {
	id: string
	date: string
	meal_type: MealType
	recipes: MealPlanRecipe
}

export interface WeekPlanData {
	meal_planCollection: {
		edges: Array<{ node: MealPlanNode }>
	}
}

export const GET_WEEK_PLAN = gql`
	query GetWeekPlan($householdId: UUID!, $startDate: Date!, $endDate: Date!) {
		meal_planCollection(
			filter: {
				household_id: { eq: $householdId }
				date: { gte: $startDate, lte: $endDate }
			}
		) {
			edges {
				node {
					id
					date
					meal_type
					recipes {
						id
						title
					}
				}
			}
		}
	}
`

export interface AssignMealResult {
	insertIntomeal_planCollection: {
		records: Array<{ id: string }>
	}
}

export const ASSIGN_MEAL = gql`
	mutation AssignMeal(
		$householdId: UUID!
		$date: Date!
		$mealType: meal_type!
		$recipeId: UUID!
	) {
		insertIntomeal_planCollection(
			objects: [
				{
					household_id: $householdId
					date: $date
					meal_type: $mealType
					recipe_id: $recipeId
				}
			]
		) {
			records {
				id
			}
		}
	}
`

export interface ReassignMealResult {
	updatemeal_planCollection: {
		records: Array<{ id: string }>
	}
}

export const REASSIGN_MEAL = gql`
	mutation ReassignMeal($id: UUID!, $recipeId: UUID!) {
		updatemeal_planCollection(
			filter: { id: { eq: $id } }
			set: { recipe_id: $recipeId }
		) {
			records {
				id
			}
		}
	}
`

export interface RemoveMealResult {
	deleteFrommeal_planCollection: {
		records: Array<{ id: string }>
	}
}

export const REMOVE_MEAL = gql`
	mutation RemoveMeal($id: UUID!) {
		deleteFrommeal_planCollection(filter: { id: { eq: $id } }) {
			records {
				id
			}
		}
	}
`
