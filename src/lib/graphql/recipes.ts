import { gql, type DocumentNode } from '@apollo/client'

export interface RecipeNode {
	id: string
	title: string
	description: string | null
	servings: number | null
	tags: string[]
}

export interface RecipesCollectionData {
	recipesCollection: {
		edges: Array<{ node: RecipeNode }>
	}
}

export const GET_PUBLIC_RECIPES = gql`
	query GetPublicRecipes {
		recipesCollection(filter: { visibility: { eq: public } }) {
			edges {
				node {
					id
					title
					description
					servings
					tags
				}
			}
		}
	}
`

export interface Ingredient {
	name: string
	quantity: string
}

export interface MethodStep {
	step: number
	instruction: string
}

export interface RecipeDetail {
	id: string
	title: string
	description: string | null
	servings: number | null
	prep_time: number | null
	cook_time: number | null
	ingredients: string
	method: string
	tags: string[]
	created_by: string
	visibility: 'private' | 'public'
}

export interface RecipeDetailData {
	recipesCollection: {
		edges: Array<{ node: RecipeDetail }>
	}
}

export const GET_RECIPE = gql`
	query GetRecipe($id: UUID!) {
		recipesCollection(filter: { id: { eq: $id } }) {
			edges {
				node {
					id
					title
					description
					servings
					prep_time
					cook_time
					ingredients
					method
					tags
					created_by
					visibility
				}
			}
		}
	}
`

export interface CreateRecipeResult {
	insertIntorecipesCollection: {
		records: Array<{ id: string }>
	}
}

export const CREATE_RECIPE = gql`
	mutation CreateRecipe(
		$created_by: UUID!
		$household_id: UUID
		$visibility: visibility_type!
		$title: String!
		$description: String
		$servings: Int
		$prep_time: Int
		$cook_time: Int
		$ingredients: JSON!
		$method: JSON!
		$tags: [String!]!
	) {
		insertIntorecipesCollection(
			objects: [
				{
					created_by: $created_by
					household_id: $household_id
					visibility: $visibility
					title: $title
					description: $description
					servings: $servings
					prep_time: $prep_time
					cook_time: $cook_time
					ingredients: $ingredients
					method: $method
					tags: $tags
				}
			]
		) {
			records {
				id
			}
		}
	}
`

export interface UpdateRecipeResult {
	updaterecipesCollection: {
		records: Array<{ id: string }>
	}
}

export const UPDATE_RECIPE = gql`
	mutation UpdateRecipe(
		$id: UUID!
		$visibility: visibility_type!
		$title: String!
		$description: String
		$servings: Int
		$prep_time: Int
		$cook_time: Int
		$ingredients: JSON!
		$method: JSON!
		$tags: [String!]!
	) {
		updaterecipesCollection(
			filter: { id: { eq: $id } }
			set: {
				visibility: $visibility
				title: $title
				description: $description
				servings: $servings
				prep_time: $prep_time
				cook_time: $cook_time
				ingredients: $ingredients
				method: $method
				tags: $tags
			}
		) {
			records {
				id
			}
		}
	}
`

export interface DeleteRecipeResult {
	deleteFromrecipesCollection: {
		records: Array<{ id: string }>
	}
}

export const DELETE_RECIPE: DocumentNode = gql`
	mutation DeleteRecipe($id: UUID!) {
		deleteFromrecipesCollection(filter: { id: { eq: $id } }) {
			records {
				id
			}
		}
	}
`

export const GET_MY_RECIPES = gql`
	query GetMyRecipes($householdId: UUID, $userId: UUID!) {
		recipesCollection(
			filter: {
				or: [
					{ householdId: { eq: $householdId } }
					{ createdBy: { eq: $userId } }
				]
			}
		) {
			edges {
				node {
					id
					title
					description
					servings
					tags
				}
			}
		}
	}
`
