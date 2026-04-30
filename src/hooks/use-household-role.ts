'use client'

import { useQuery } from '@apollo/client/react'

import { useUserAndSession } from '@/components/session-provider'
import { GET_MY_ROLE, type MyRoleData } from '@/lib/graphql/households'

export type HouseholdRole = 'Leader' | 'Contributor' | 'Member' | null

export function useHouseholdRole(): {
	role: HouseholdRole
	loading: boolean
	canEditRecipes: boolean
} {
	const { user } = useUserAndSession()

	const { data, loading } = useQuery<MyRoleData>(GET_MY_ROLE, {
		variables: { user_id: user?.id },
		skip: !user?.id,
	})

	const role = (data?.household_membersCollection?.edges?.[0]?.node?.role ??
		null) as HouseholdRole

	return {
		role,
		loading,
		canEditRecipes: role !== 'Member',
	}
}
