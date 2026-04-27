import { gql } from '@apollo/client'

export interface MyHouseholdNode {
	household_id: string
}

export interface MyHouseholdData {
	household_membersCollection: {
		edges: Array<{ node: MyHouseholdNode }>
	}
}

export const GET_MY_HOUSEHOLD = gql`
	query GetMyHousehold($userId: UUID!) {
		household_membersCollection(filter: { user_id: { eq: $userId } }) {
			edges {
				node {
					household_id
				}
			}
		}
	}
`
