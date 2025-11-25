"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Chip,
  Textarea,
  Divider,
  ScrollShadow,
  Card,
  CardBody,
  ButtonGroup
} from "@nextui-org/react";
import axios from "axios";

// Recibimos 'products' para poder agregar cosas nuevas
export default function ModalProcesarOrden({ order, products, url, user_id, backendURL }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [comentary, setComentary] = useState(order.comentary || "");
  const [cart, setCart] = useState([]);

  // --- 1. Inicializar el carrito con los productos de la orden ---
  useEffect(() => {
    if (isOpen && order.items) {
      // Convertimos la lista plana del backend en lista agrupada con 'quantity'
      const grouped = {};
      order.items.forEach((item) => {
        // Nota: Asumimos que el backend nos manda 'name' y 'price'. 
        // Para editar bien, necesitamos el ID del producto.
        // Si tu backend en GET /orders devuelve items sin ID, necesitamos corregir el GET.
        // Por ahora intentaremos mapear por nombre buscando en la lista completa de productos.

        // Buscamos el producto real en la lista 'products' para obtener su ID
        const realProduct = products.find(p => p.name === item.name);
        const prodId = realProduct ? realProduct.id : Math.random(); // Fallback por si acaso

        if (grouped[item.name]) {
          grouped[item.name].quantity += 1;
        } else {
          grouped[item.name] = {
            id: prodId,
            name: item.name,
            price: item.price,
            quantity: 1
          };
        }
      });
      setCart(Object.values(grouped));
      setComentary(order.comentary || "");
    }
  }, [isOpen, order, products]);


  // --- LÓGICA DEL CARRITO (Igual que en crear) ---
  const addToCart = (product) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);


  // --- GUARDAR CAMBIOS ---
  const handleUpdate = async (newStatus, onClose) => {
    setLoading(true);
    try {
      // Convertimos el carrito agrupado a lista de IDs [1, 1, 2]
      const productIds = cart.flatMap((item) =>
        Array(item.quantity).fill(item.id)
      );

      const payload = {
        estatus: newStatus, // El estatus que presionó el usuario
        comentary: comentary,
        productIds: productIds // Enviamos la nueva lista de productos
      };

      await axios.put(`${backendURL}/orders/${order.id}`, payload);

      const mensajeFinal = `*Actualización de Pedido* 🔔\n\n` +
        `Estimado cliente, le informamos sobre su orden *#${order.id}*.\n` +
        `------------------------------\n` +
        `Nuevo Estatus: *${newStatus.toUpperCase()}*\n` +
        `------------------------------\n\n` +
        `¡Gracias por su preferencia!`;

      await fetch(`/api/webhook/${user_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          phone: order.phone,
          content: mensajeFinal // <--- Aquí enviamos el texto formateado
        })
      });

      onClose();
    } catch (error) {
      console.error("Error actualizando:", error);
      alert("Error al actualizar la orden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onPress={onOpen} size="sm" variant="flat" color="primary">
        Editar / Procesar
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 bg-gray-50 border-b">
                <div className="flex justify-between items-center mr-6">
                  <span>Pedido #{order.id}</span>
                  <Chip color="primary" variant="dot">{order.type}</Chip>
                </div>
                <span className="text-small text-gray-500 font-normal">Cliente: {order.phone}</span>
              </ModalHeader>

              <ModalBody className="py-4">
                <div className="flex flex-col md:flex-row gap-4 h-[500px]">

                  {/* IZQUIERDA: MENÚ PARA AGREGAR PRODUCTOS */}
                  <div className="w-full md:w-1/2 bg-gray-50 p-2 rounded">
                    <h4 className="font-bold mb-2 text-sm text-gray-600">Agregar Productos</h4>
                    <ScrollShadow className="h-full pb-10">
                      <div className="grid grid-cols-2 gap-2">
                        {products.map((product) => (
                          <Card
                            key={product.id}
                            isPressable
                            onPress={() => addToCart(product)}
                            className="hover:scale-95 transition-transform shadow-sm"
                          >
                            <CardBody className="p-2 text-center">
                              <p className="font-bold text-xs">{product.name}</p>
                              <p className="text-xs text-gray-500">${product.price}</p>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    </ScrollShadow>
                  </div>

                  {/* DERECHA: EDICIÓN DE ORDEN Y ESTATUS */}
                  <div className="w-full md:w-1/2 flex flex-col gap-3">
                    {/* Lista Editable */}
                    <div className="flex-grow border rounded p-2 overflow-hidden flex flex-col">
                      <h4 className="font-bold mb-2 text-sm text-gray-600">Contenido del Pedido</h4>
                      <ScrollShadow className="flex-grow bg-white rounded border p-2 mb-2">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center border-b border-dashed py-2 last:border-0">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{item.name}</span>
                              <span className="text-xs text-gray-400">${item.price * item.quantity}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <ButtonGroup size="sm" variant="flat">
                                <Button isIconOnly onPress={() => updateQuantity(item.id, -1)}>-</Button>
                                <Button disabled className="w-6 font-bold">{item.quantity}</Button>
                                <Button isIconOnly onPress={() => updateQuantity(item.id, 1)}>+</Button>
                              </ButtonGroup>
                              <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => removeFromCart(item.id)}>x</Button>
                            </div>
                          </div>
                        ))}
                      </ScrollShadow>
                      <div className="flex justify-end font-bold text-lg">
                        Total: ${total.toFixed(2)}
                      </div>
                    </div>

                    {/* Comentarios */}
                    <Textarea
                      label="Comentarios"
                      value={comentary}
                      onValueChange={setComentary}
                      minRows={1}
                      size="sm"
                      variant="bordered"
                    />

                    {/* Botones de Acción (Guardar con nuevo estatus) */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        color="primary"
                        variant="ghost"
                        onPress={() => handleUpdate(order.estatus, onClose)} // Guarda cambios sin cambiar estatus
                        isLoading={loading}
                      >
                        💾 Solo Guardar Cambios
                      </Button>

                      <Button
                        color="warning"
                        variant={order.estatus === 'Cocinando' ? "solid" : "flat"}
                        onPress={() => handleUpdate('Cocinando', onClose)}
                        isLoading={loading}
                      >
                        🔥 Cocinar
                      </Button>

                      <Button
                        color="success"
                        className="text-white col-span-2"
                        onPress={() => handleUpdate('Listo', onClose)}
                        isLoading={loading}
                      >
                        ✅ Pedido Listo
                      </Button>

                      <Button
                        color="default"
                        variant="light"
                        className="col-span-2"
                        onPress={() => handleUpdate('Entregado', onClose)}
                      >
                        🚀 Finalizar / Entregado
                      </Button>

                      <Button
                        color="danger"
                        className="col-span-2"
                        onPress={() => handleUpdate('Cancelado', onClose)}
                      >
                        ❌ Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}