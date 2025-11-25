
import OrdersComponent from "./components/tables"

export default async function OrdersPage({ params }) {
    const { id } = await params
    const res = await fetch(`http://localhost:8001/products/${id}`)
    const data = await res.json()
    let url
    const res1 = await fetch(`http://localhost:8001/instance_user/${id}`, { cache: 'no-store' });
    url = await res1.json();


    return (
        <div className="flex flex-col gap-10">


            <OrdersComponent user_id={id} products={data} url={url[0].url} />
        </div>
    )
}