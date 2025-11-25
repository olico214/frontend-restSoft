import TableComponent from "./components/tables"
const backendURL = process.env.BACKENDURL || 'http://localhost:8001';
export default async function ProductsPage({ params }) {
    const { id } = await params
    const res = await fetch(`${backendURL}/products/${id}`)
    const data = await res.json()
    return (
        <div className="grid gap-4 p-4">
            <TableComponent user_id={id} data={data} backendURL={backendURL} />
        </div>
    )
}