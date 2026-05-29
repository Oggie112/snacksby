import Link from 'next/link'

interface RecipeCardProps {
	id: string
	title: string
	description?: string | null
	tags?: string[]
}

export default function RecipeCard({
	id,
	title,
	description,
	tags,
}: RecipeCardProps) {
	return (
		<Link
			href={`/recipes/${id}`}
			className="block bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg p-2 transition-colors group text-center"
		>
			<p className="text-sm font-semibold text-primary leading-tight group-hover:underline">
				{title}
			</p>
			{description && (
				<p className="text-xs text-base-content/60 mt-1 line-clamp-2">
					{description}
				</p>
			)}
			{tags && tags.length > 0 && (
				<div className="flex flex-wrap gap-1 mt-1.5">
					{tags.map((tag) => (
						<span
							key={tag}
							className="badge badge-xs badge-primary badge-outline"
						>
							{tag}
						</span>
					))}
				</div>
			)}
		</Link>
	)
}
