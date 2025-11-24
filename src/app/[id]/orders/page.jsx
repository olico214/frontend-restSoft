
import OrdersComponent from "./components/tables"

export default async function OrdersPage({params}){
 const { id } = await params
     const res = await fetch(`http://localhost:8000/products/${id}`)
      const data = await res.json()
    return(
        <div className="flex flex-col gap-10">
        

         <OrdersComponent user_id={id} products={data}  />
      </div>
    )
}