import { gql } from '@apollo/client'

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
