export default function RecipeCard(props) {
    return (
        <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{props.title}</h2>
                <p>{props.description}</p>
                </div>
                <div>
                    <button className="btn btn-primary">View Recipe</button>
                </div>
            </div>
    )
}