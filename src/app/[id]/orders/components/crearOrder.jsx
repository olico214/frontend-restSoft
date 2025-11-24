
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Card, CardBody,
    CardFooter,
    Image,
    Button,
    Input,
    Divider,
    ScrollShadow,
    Textarea,
    Select,
    SelectItem
} from "@nextui-org/react";

export default function CreateOrder({ products, user_id }) {
    const router = useRouter();

    // Estado del "Carrito" (Lista de productos seleccionados)
    const [cart, setCart] = useState([]);
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [comentary, setComentary] = useState("")
    const [type, setType] = useState("Local"); // <--- Nuevo Estado
    // --- LÓGICA DEL CARRITO ---

    // Agregar producto al carrito
    const addToCart = (product) => {
        setCart((prev) => [...prev, product]);
    };

    // Quitar producto del carrito (por índice para no borrar duplicados si pidió 2 iguales)
    const removeFromCart = (indexToRemove) => {
        setCart((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    // Calcular Total
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    // --- LÓGICA DE ENVÍO ---

    const handleSubmit = async () => {
        if (cart.length === 0) return alert("Selecciona al menos un producto");
        if (!phone) return alert("Ingresa un número de teléfono");

        setLoading(true);

        try {
            // Preparamos los datos como los espera tu backend Python:
            // { phone: "...", productIds: [1, 5, 1] }
            const payload = {
                phone: phone,
                comentary: comentary,
                type: type, // <--- Enviamos el tipo
                productIds: cart.map((p) => p.id)
            };

            const res = await fetch(`http://localhost:8000/orders/${user_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            alert("¡Pedido enviado a cocina! 👨‍🍳");

            // Limpiamos todo
            setCart([]);
            setPhone("");
            setComentary("")
            setType("Local");
            // Opcional: Redirigir o refrescar
            // router.refresh(); 

        } catch (error) {
            console.error(error);
            alert("Error al enviar el pedido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-100px)] gap-4 p-4">

            {/* --- SECCIÓN IZQUIERDA: MENÚ DE PRODUCTOS --- */}
            <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold mb-4">Menú</h2>

                <ScrollShadow className="h-[600px] w-full">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                isPressable
                                onPress={() => addToCart(product)}
                                className="hover:scale-105 transition-transform"
                            >
                                <CardBody className="p-4 text-center bg-gray-50">
                                    {/* Icono o Imagen placeholder */}
                                    <div className="text-4xl mb-2">🍔</div>
                                    <h3 className="font-bold text-lg">{product.name}</h3>
                                    <p className="text-gray-500">${product.price}</p>

                                    {product.estatus !== 'activo' && (
                                        <span className="text-xs text-red-500 font-bold mt-1">NO DISPONIBLE</span>
                                    )}
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </ScrollShadow>
            </div>

            {/* --- SECCIÓN DERECHA: RESUMEN DEL PEDIDO --- */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-lg border h-fit sticky top-4">
                <h2 className="text-xl font-bold mb-4">Orden Actual</h2>

                {/* Lista de items seleccionados */}
                <ScrollShadow className="h-[300px] mb-4 border rounded p-2 bg-gray-50">
                    {cart.length === 0 ? (
                        <p className="text-gray-400 text-center mt-10">Tu carrito está vacío</p>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="flex justify-between items-center mb-2 border-b pb-1 last:border-0">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-gray-500">${item.price}</p>
                                </div>
                                <Button
                                    isIconOnly
                                    size="sm"
                                    color="danger"
                                    variant="light"
                                    onPress={() => removeFromCart(index)}
                                >
                                    ✕
                                </Button>
                            </div>
                        ))
                    )}
                </ScrollShadow>

                <Divider className="my-4" />

                {/* Total y Formulario */}
                <div className="space-y-4">
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <Select
                        label="Tipo de Pedido"
                        selectedKeys={[type]}
                        onChange={(e) => setType(e.target.value)}
                        variant="bordered"
                    >
                        <SelectItem key="Local" value="Local">Local </SelectItem>
                        <SelectItem key="Whatsapp" value="Whatsapp">Whatsapp</SelectItem>
                    </Select>
                    <Input
                        label="Teléfono del Cliente"
                        value={phone}
                        onValueChange={setPhone}
                        variant="bordered"
                    />
                    <Textarea
                        label="comentario del pedido"
                        value={comentary}
                        onValueChange={setComentary}
                        variant="bordered"
                    />

                    <Button
                        color="success"
                        className="w-full text-white font-bold text-lg shadow-lg"
                        size="lg"
                        onPress={handleSubmit}
                        isLoading={loading}
                        isDisabled={cart.length === 0}
                    >
                        {loading ? "Enviando..." : "Confirmar Pedido"}
                    </Button>
                </div>
            </div>

        </div>
    );
}