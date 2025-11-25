import RealizarPedido from "./components/realizarpedido";
const backendURL = process.env.BACKENDURL || 'http://localhost:8001';

export default async function PedidoPage({ params, searchParams }) {
  // 1. Obtenemos el ID del restaurante (user_id) y el teléfono (query string)
  const { id } = await params;
  const { number } = await searchParams; // ?number=332...

  // 2. Traemos los productos del restaurante desde el servidor
  let products = [];
  let url
  try {
    const res = await fetch(`${backendURL}/products/${id}`, { cache: 'no-store' });
    products = await res.json();


    const res1 = await fetch(`${backendURL}/instance_user/${id}`, { cache: 'no-store' });
    url = await res1.json();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }

  // 3. Renderizamos el componente Cliente
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Pasamos los datos iniciales al cliente */}
      <RealizarPedido
        products={products}
        user_id={id}
        phoneQuery={number}
        url={url}
        backendURL={backendURL}
      />
    </div>
  );
}