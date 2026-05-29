// Flat config for Next.js + TypeScript + React + Prettier
import js from '@eslint/js'
import tseslint from 'typescript-eslint' // aggregator (parser + plugin + presets)
import next from '@next/eslint-plugin-next'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier'

export default tseslint.config(
	// Base JS
	js.configs.recommended,

	// TS rules (untyped + typed)
	tseslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,

	// Ensure Next’s plugin is present so Next stops warning
	{
		name: 'next-plugin-registration',
		plugins: { '@next/next': next },
	},

	// Your project rules (scoped to src)
	{
		name: 'project-rules',
		files: ['src/**/*.{ts,tsx,js,jsx}'],

		// All plugins you reference in rules must be available in this block
		plugins: {
			'@next/next': next,
			'@typescript-eslint': tseslint.plugin,
			react,
			'react-hooks': reactHooks,
			import: importPlugin,
			'jsx-a11y': jsxA11y,
			prettier,
		},

		// Typed linting using the new Project Service (no extra tsconfig needed)
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname, // Node 20.11+; see note below if you’re on older Node
				sourceType: 'module',
			},
		},

		// Silence “React version not specified” warning
		settings: {
			react: { version: 'detect' },
		},

		// Rules
		rules: {
			// Next.js rules (recommended + Core Web Vitals)
			...next.configs.recommended.rules,
			...next.configs['core-web-vitals'].rules,

			// React baseline
			...react.configs.flat.recommended.rules,

			// Hooks
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'react/react-in-jsx-scope': 'off',

			// TS strictness
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_' },
			],

			// Disabled: fire on JSON.parse and Apollo return types which are
			// inherently any — tsc catches real type errors, these add no value here
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',

			// Imports
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal'],
					pathGroups: [
						{ pattern: 'react', group: 'external', position: 'before' },
					],
					pathGroupsExcludedImportTypes: ['react'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],

			// Accessibility
			...jsxA11y.configs.recommended.rules,

			// Prettier as an ESLint rule
			'prettier/prettier': 'error',
		},
	},
)
