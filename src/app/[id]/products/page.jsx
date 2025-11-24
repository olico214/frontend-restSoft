import TableComponent from "./components/tables"

export default async function ProductsPage({ params }) {
    const { id } = await params
     const res = await fetch(`http://localhost:8000/products/${id}`)
      const data = await res.json()
    return (
        <div className="grid gap-4 p-4">
            <TableComponent user_id={id} data={data} />
        </div>
    )
}