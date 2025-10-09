export default function FullRecipe(props) {
    return (
        <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{props.title}</h2>
                <div>
                    <p>{props.description}</p>
                    <h3>Ingredients</h3>
                    <ul>
                        {props.methond.map((ingredient, index) => {
                            return <li key={index}>{index + 1}: {ingredient} </li>
                        })}
                    </ul>
                    <h3>Method</h3>
                    <ul>
                        {props.method.map((step, index) => {
                            return <li key={index}>{index + 1}: {step}</li>
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}