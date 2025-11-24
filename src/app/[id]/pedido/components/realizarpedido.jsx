"use client";
import { useEffect, useState } from "react";
import { 
  Card, CardBody, Button, ScrollShadow, 
  Image, Chip, Spinner, Divider, Badge
} from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RealizarPedido({ products, user_id, phoneQuery }) {
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  
  // Estado del Carrito
  const [cart, setCart] = useState([]);
  const [sending, setSending] = useState(false);

  // --- 1. VERIFICAR SI YA EXISTE PEDIDO ---
  useEffect(() => {
    const checkActiveOrder = async () => {
      if (!phoneQuery) {
        setLoading(false);
        return;
      }

      try {
        // Pedimos TODOS los pedidos de este restaurante
        // (Idealmente el backend debería tener un filtro por teléfono, pero filtramos aquí por ahora)
        const res = await axios.get(`http://localhost:8000/orders/${user_id}`);
        const orders = res.data;

        // Buscamos si este teléfono tiene un pedido "vivo"
        const found = orders.find(o => 
          o.phone === phoneQuery && 
          ['nuevo', 'cocinando', 'listo', 'pendiente'].includes(o.estatus?.toLowerCase())
        );

        setActiveOrder(found || null);
      } catch (error) {
        console.error("Error verificando pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    checkActiveOrder();
  }, [user_id, phoneQuery]);


  // --- LÓGICA DEL CARRITO ---
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => prev.map((p) => {
      if (p.id === productId) return { ...p, quantity: Math.max(1, p.quantity + delta) };
      return p;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- ENVIAR PEDIDO ---
  const handlePlaceOrder = async () => {
    if (!phoneQuery) return alert("Error: No se detectó número de teléfono.");
    
    setSending(true);
    try {
      // Convertimos el carrito agrupado a array plano de IDs [1, 1, 2...]
      const productIds = cart.flatMap((item) => Array(item.quantity).fill(item.id));

      const payload = {
        phone: phoneQuery,
        comentary: "", // Puedes agregar un input para esto si quieres
        type: "Local", // O "Llevar", podrías poner un select
        productIds: productIds
      };

      const res = await axios.post(`http://localhost:8000/orders/${user_id}`, payload);
      
      // Actualizamos el estado local para mostrar la pantalla de bloqueo inmediatamente
      setActiveOrder({
          id: res.data.id,
          estatus: "Nuevo",
          items: cart, // Solo para visualización temporal
          phone: phoneQuery
      });
      setCart([]);

    } catch (error) {
      console.error(error);
      alert("No se pudo enviar el pedido.");
    } finally {
      setSending(false);
    }
  };

  // --- RENDERIZADO CONDICIONAL ---

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" label="Verificando..." /></div>;
  }

  // CASO A: TIENE PEDIDO ACTIVO -> MOSTRAR ESTADO (BLOQUEAR MENÚ)
  if (activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <Card className="max-w-md w-full p-6 shadow-xl border-t-4 border-blue-500">
          <div className="text-6xl mb-4">👨‍🍳</div>
          <h2 className="text-2xl font-bold mb-2">¡Pedido en Curso!</h2>
          <p className="text-gray-500 mb-6">
            Hola, detectamos que ya tienes un pedido activo asociado al número <strong>{phoneQuery}</strong>.
          </p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 uppercase font-bold">Estatus Actual</p>
            <Chip 
              color={activeOrder.estatus === 'Listo' ? "success" : "warning"} 
              size="lg" 
              className="mt-2 font-bold uppercase"
            >
              {activeOrder.estatus}
            </Chip>
            <p className="mt-2 text-xs text-gray-400">Orden #{activeOrder.id}</p>
          </div>

          <p className="text-sm text-gray-400">
            No puedes realizar otro pedido hasta que este sea completado o entregado.
          </p>
        </Card>
      </div>
    );
  }

  // CASO B: NO TIENE PEDIDO -> MOSTRAR MENÚ
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold">Menú Digital 🍔</h1>
           <p className="text-gray-500 text-sm">Hola, {phoneQuery}</p>
        </div>
        {/* Carrito Flotante (Icono) */}
        {cart.length > 0 && (
           <Badge content={totalItems} color="danger" shape="circle">
              <Button isIconOnly variant="flat" className="bg-white shadow">🛒</Button>
           </Badge>
        )}
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-24">
        {products.map((product) => (
          <Card key={product.id} className="flex flex-row p-3 items-center shadow-sm hover:shadow-md transition-all">
             <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl mr-4">
                🍔
             </div>
             <div className="flex-grow">
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-green-600 font-bold">${product.price}</p>
                {product.estatus !== 'activo' ? (
                   <span className="text-xs text-red-500 font-bold">Agotado</span>
                ) : (
                   <div className="mt-2">
                      {/* Lógica de botón Agregar o Contador */}
                      {cart.find(c => c.id === product.id) ? (
                         <div className="flex items-center gap-2">
                            <Button size="sm" isIconOnly onPress={() => updateQuantity(product.id, -1)}>-</Button>
                            <span className="font-bold">{cart.find(c => c.id === product.id).quantity}</span>
                            <Button size="sm" isIconOnly onPress={() => updateQuantity(product.id, 1)}>+</Button>
                         </div>
                      ) : (
                         <Button size="sm" color="primary" onPress={() => addToCart(product)}>
                            Agregar
                         </Button>
                      )}
                   </div>
                )}
             </div>
          </Card>
        ))}
      </div>

      {/* BARRA INFERIOR DE PAGO (Sticky Footer) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 shadow-2xl z-50">
           <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div>
                 <p className="text-xs text-gray-500">Total a pagar</p>
                 <p className="text-xl font-bold">${total.toFixed(2)}</p>
              </div>
              <Button 
                color="success" 
                className="text-white font-bold px-8" 
                size="lg"
                isLoading={sending}
                onPress={handlePlaceOrder}
              >
                {sending ? "Enviando..." : `Pedir (${totalItems})`}
              </Button>
           </div>
        </div>
      )}
    </div>
  );
}