"use client";
import { useEffect, useState, useMemo } from "react";
import { 
  Card, CardHeader, CardBody, CardFooter, 
  Chip, Divider, Button, Tab, Tabs, ScrollShadow 
} from "@nextui-org/react";
import io from "socket.io-client";
import axios from "axios";
// Importamos el modal
import ModalCrearOrden from "./modal";
import ModalProcesarOrden from "./modalorden";

export default function OrdersComponent({ user_id, products,url }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("todos");
  
  // --- HELPER: Función para agrupar productos repetidos ---
  const groupItems = (items) => {
    if (!items) return [];
    
    const grouped = {};
    
    items.forEach((item) => {
      // Usamos el nombre como clave para agrupar
      if (grouped[item.name]) {
        grouped[item.name].quantity += 1;
        // Opcional: Sumar precio si quieres mostrar subtotal
        // grouped[item.name].totalPrice += item.price; 
      } else {
        // Inicializamos con cantidad 1
        grouped[item.name] = { ...item, quantity: 1 };
      }
    });

    // Convertimos el objeto de vuelta a un array
    return Object.values(grouped);
  };

  // 1. Cargar Pedidos Iniciales (Historial)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/orders/${user_id}`);
        setOrders(res.data);
      } catch (error) {
        console.error("Error cargando pedidos:", error);
      }
    };
    if (user_id) fetchOrders();
  }, [user_id]);

  // 2. Conexión WebSocket (Tiempo Real)
  useEffect(() => {
    const socket = io('http://localhost:8000', {
       transports: ['websocket'] 
    });

    socket.on('connect', () => {
        console.log("✅ Conectado al WS con ID:", socket.id);
    });

    socket.on('connect_error', (err) => {
        console.log("❌ Error de conexión:", err);
    });

    socket.on('nuevo_pedido', (newOrder) => {
      if (parseInt(newOrder.user_id) === parseInt(user_id)) {
        setOrders((prev) => [newOrder, ...prev]);
      }
    });

    socket.on('actualizar_pedido', (updatedOrder) => {
    if (parseInt(updatedOrder.user_id) === parseInt(user_id)) {
        setOrders((prev) => {
            // Buscamos el pedido viejo y lo reemplazamos por el nuevo
            return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
        });
    }
});

    return () => socket.disconnect();
  }, [user_id]);

  // 3. Filtrado de Pedidos en memoria
  const filteredOrders = useMemo(() => {
    if (filter === "todos") return orders;
    return orders.filter((o) => o.estatus?.toLowerCase() === filter.toLowerCase());
  }, [orders, filter]);

  // Helper para color del estatus
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'nuevo': return "primary"; 
      case 'cocinando': return "warning";
      case 'listo': return "success";
      case 'Entregado': return "primary";
      case 'Cancelado': return "danger";
      default: return "default";
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* --- BARRA SUPERIOR DE ACCIONES --- */}
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-3xl font-bold">Monitor de Cocina 👨‍🍳</h1>
            <p className="text-gray-500">Sistema en tiempo real</p>
         </div>
         
         <ModalCrearOrden products={products} user_id={user_id} />
      </div>

      <Divider className="my-2"/>

      {/* --- FILTROS --- */}
      <div className="flex justify-between items-center">
        <Tabs 
          aria-label="Filtro Estatus" 
          color="primary" 
          variant="solid"
          selectedKey={filter}
          onSelectionChange={setFilter}
        >
          <Tab key="todos" title={`Todos (${orders.length})`} />
          <Tab key="nuevo" title="Nuevos" />
          <Tab key="cocinando" title="En Cocina" />
          <Tab key="listo" title="Listos" />
          <Tab key="Entregado" title="Entregado" />
          <Tab key="Cancelado" title="Cancelado" />
        </Tabs>
      </div>

      {/* --- GRILLA DE PEDIDOS --- */}
      <ScrollShadow className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
          
          {filteredOrders.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center text-gray-400 mt-20">
                <p className="text-xl">No hay pedidos en esta categoría.</p>
             </div>
          )}

          {filteredOrders.map((order) => (
            <Card key={order.id} className="border-2 border-transparent hover:border-blue-500 transition-all shadow-sm">
              <CardHeader className="flex justify-between items-start pb-2">
                <div>
                  <h4 className="font-bold text-lg">Pedido #{order.id}</h4>
                  <p className="text-small text-default-500">{order.phone}</p>
                </div>
                <Chip 
                  color={order.type === 'Local' ? "secondary" : "warning"} 
                  variant="flat" 
                  size="sm"
                >
                  {order.type || "Local"}
                </Chip>
              </CardHeader>
              
              <Divider/>
              
              <CardBody className="py-4">
                
                {/* --- AQUÍ ESTÁ EL CAMBIO CLAVE PARA AGRUPAR --- */}
                <ul className="pl-0 mb-3 space-y-2">
                  {groupItems(order.items).map((item, idx) => (
                    <li key={idx} className="text-sm flex justify-between items-center border-b border-dashed pb-1 last:border-0">
                      
                      {/* Lado izquierdo: Cantidad y Nombre */}
                      <div className="flex items-center gap-2">
                         {/* Badge de cantidad */}
                         <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-xs">
                           {item.quantity}x
                         </span>
                         <span className="font-semibold text-gray-700">{item.name}</span>
                      </div>

                      {/* Lado derecho: Precio Total de esa línea (Unitario * Cantidad) */}
                      <span className="text-gray-400 text-xs font-mono">
                         ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* ----------------------------------------------- */}

                {/* Comentario */}
                {order.comentary && (
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200 mt-2">
                    <p className="text-[10px] font-bold text-yellow-700 uppercase">Nota:</p>
                    <p className="text-sm text-gray-700 italic">"{order.comentary}"</p>
                  </div>
                )}
              </CardBody>

              <Divider/>

              <CardFooter className="flex justify-between items-center bg-gray-50">
                <Chip 
                  color={getStatusColor(order.estatus)} 
                  variant="dot" 
                  className="capitalize font-bold"
                >
                  {order.estatus || "Nuevo"}
                </Chip>
                <ModalProcesarOrden order={order} products={products} url={url} user_id={user_id}/>
                
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}