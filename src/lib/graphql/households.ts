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
	query GetMyHousehold($user_id: UUID!) {
		household_membersCollection(filter: { user_id: { eq: $user_id } }) {
			edges {
				node {
					household_id
				}
			}
		}
	}
`

export interface MyRoleNode {
	role: string
}

export interface MyRoleData {
	household_membersCollection: {
		edges: Array<{ node: MyRoleNode }>
	}
}

export const GET_MY_ROLE = gql`
	query GetMyRole($user_id: UUID!) {
		household_membersCollection(filter: { user_id: { eq: $user_id } }) {
			edges {
				node {
					role
				}
			}
		}
	}
`

export interface HouseholdNode {
	id: string
	name: string
	invite_code: string
}

export interface HouseholdByCodeData {
	householdsCollection: {
		edges: Array<{ node: HouseholdNode }>
	}
}

export const GET_HOUSEHOLD_BY_CODE = gql`
	query GetHouseholdByCode($invite_code: String!) {
		householdsCollection(filter: { invite_code: { eq: $invite_code } }) {
			edges {
				node {
					id
					name
					invite_code
				}
			}
		}
	}
`

export interface CreateHouseholdResult {
	insertIntohouseholdsCollection: {
		records: Array<{ id: string }>
		affectedCount: number
	}
}

export const CREATE_HOUSEHOLD = gql`
	mutation CreateHousehold($name: String!) {
		insertIntohouseholdsCollection(objects: [{ name: $name }]) {
			records {
				id
			}
			affectedCount
		}
	}
`

export interface AddHouseholdMemberResult {
	insertIntohousehold_membersCollection: {
		records: Array<{ household_id: string }>
	}
}

export const ADD_HOUSEHOLD_MEMBER = gql`
	mutation AddHouseholdMember(
		$household_id: UUID!
		$user_id: UUID!
		$role: role_type!
	) {
		insertIntohousehold_membersCollection(
			objects: [{ household_id: $household_id, user_id: $user_id, role: $role }]
		) {
			records {
				household_id
			}
		}
	}
`

export interface HouseholdMemberNode {
	user_id: string
	role: string
	profiles: { full_name: string } | null
}

export interface HouseholdSettingsNode {
	id: string
	name: string
	invite_code: string
	household_membersCollection: {
		edges: Array<{ node: HouseholdMemberNode }>
	}
}

export interface HouseholdSettingsData {
	household_membersCollection: {
		edges: Array<{
			node: {
				role: string
				households: HouseholdSettingsNode
			}
		}>
	}
}

export interface RemoveHouseholdMemberResult {
	deleteFromhousehold_membersCollection: {
		affectedCount: number
	}
}

export interface UpdateHouseholdMemberRoleResult {
	updatehousehold_membersCollection: {
		records: Array<{ user_id: string; role: string }>
	}
}

export const UPDATE_HOUSEHOLD_MEMBER_ROLE = gql`
	mutation UpdateHouseholdMemberRole(
		$household_id: UUID!
		$user_id: UUID!
		$role: role_type!
	) {
		updatehousehold_membersCollection(
			filter: { household_id: { eq: $household_id }, user_id: { eq: $user_id } }
			set: { role: $role }
		) {
			records {
				user_id
				role
			}
		}
	}
`

export const REMOVE_HOUSEHOLD_MEMBER = gql`
	mutation RemoveHouseholdMember($household_id: UUID!, $user_id: UUID!) {
		deleteFromhousehold_membersCollection(
			filter: { household_id: { eq: $household_id }, user_id: { eq: $user_id } }
		) {
			affectedCount
		}
	}
`

export const GET_HOUSEHOLD_SETTINGS = gql`
	query GetHouseholdSettings($user_id: UUID!) {
		household_membersCollection(filter: { user_id: { eq: $user_id } }) {
			edges {
				node {
					role
					households {
						id
						name
						invite_code
						household_membersCollection {
							edges {
								node {
									user_id
									role
									profiles {
										full_name
									}
								}
							}
						}
					}
				}
			}
		}
	}
`
