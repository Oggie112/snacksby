-- household_ai_keys: stores AES-256-GCM encrypted Anthropic API keys per household.
-- The ciphertext is useless without AI_KEY_ENCRYPTION_SECRET (server-only env var).
-- Server reads via service-role client after verifying membership; RLS is defence-in-depth.

create table household_ai_keys (
	household_id  uuid        primary key references households(id) on delete cascade,
	ciphertext    text        not null,
	iv            text        not null,
	auth_tag      text        not null,
	key_last4     text        not null,
	created_by    uuid        not null references auth.users(id),
	updated_at    timestamptz not null default now()
);

alter table household_ai_keys enable row level security;

create policy "Leaders can manage their household AI key"
	on household_ai_keys
	for all
	using (
		exists (
			select 1 from household_members
			where household_members.household_id = household_ai_keys.household_id
			  and household_members.user_id      = auth.uid()
			  and household_members.role         = 'Leader'
		)
	)
	with check (
		exists (
			select 1 from household_members
			where household_members.household_id = household_ai_keys.household_id
			  and household_members.user_id      = auth.uid()
			  and household_members.role         = 'Leader'
		)
	);
