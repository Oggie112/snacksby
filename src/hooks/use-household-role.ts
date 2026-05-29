'use client'

import { useQuery } from '@apollo/client/react'

import { useUserAndSession } from '@/components/session-provider'
import { GET_MY_ROLE, type MyRoleData } from '@/lib/graphql/households'

export type HouseholdRole = 'Leader' | 'Contributor' | 'Member' | null

export function useHouseholdRole(): {
	role: HouseholdRole
	householdId: string | null
	loading: boolean
	canEditRecipes: boolean
} {
	const { user } = useUserAndSession()

	const { data, loading } = useQuery<MyRoleData>(GET_MY_ROLE, {
		variables: { user_id: user?.id },
		skip: !user?.id,
	})

	const node = data?.household_membersCollection?.edges?.[0]?.node
	const role = (node?.role ?? null) as HouseholdRole
	const householdId = node?.household_id ?? null

	return {
		role,
		householdId,
		loading,
		canEditRecipes: role === 'Leader' || role === 'Contributor',
	}
}
