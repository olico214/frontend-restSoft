"use client";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation"; // Para recargar la página al guardar
import {
  Button, Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";

export default function CrearEditarComponent({ item = null, user_id, backendURL }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  // Estados del formulario
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [estatus, setEstatus] = useState("activo");
  const [loading, setLoading] = useState(false);

  // Determinar si estamos en modo edición
  const isEditing = !!item;

  // Efecto: Cuando se abre el modal o cambia el item, llenar los campos
  useEffect(() => {
    if (isOpen && isEditing) {
      setName(item.name);
      setPrice(item.price);
      setEstatus(item.estatus);
    } else if (isOpen && !isEditing) {
      // Limpiar formulario si es crear nuevo
      setName("");
      setPrice("");
      setEstatus("activo");
    }
  }, [isOpen, isEditing, item]);

  const handleSubmit = async (onClose) => {
    setLoading(true);

    // Preparar el cuerpo de la petición
    const payload = {
      name: name,
      price: parseFloat(price),
      estatus: estatus,
      user: parseInt(user_id), // Enviamos el usuario asociado
    };

    try {
      if (isEditing) {
        const res = await fetch(`${backendURL}/products/${item.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        alert("Producto actualizado correctamente");
      } else {
        // --- CREAR (POST) ---
        const res = await fetch(`${backendURL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
        alert("Producto creado correctamente");
      }

      // Cerrar modal y refrescar datos
      onClose();
      router.refresh(); // Esto recarga los datos de la página actual
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Trigger: Cambia el texto/color dependiendo si es crear o editar */}
      <Button
        onPress={onOpen}
        color={isEditing ? "warning" : "primary"}
        variant={isEditing ? "flat" : "solid"}
      >
        {isEditing ? "Editar" : "Nuevo Producto"}
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? `Editar ${item.name}` : "Crear Nuevo Producto"}
              </ModalHeader>

              <ModalBody>
                {/* Input Nombre */}
                <Input
                  autoFocus
                  label="Nombre del Producto"
                  placeholder="Ej. Hamburguesa Doble"
                  variant="bordered"
                  value={name}
                  onValueChange={setName}
                />

                {/* Input Precio */}
                <Input
                  label="Precio"
                  placeholder="0.00"
                  type="number"
                  variant="bordered"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                  value={price}
                  onValueChange={setPrice}
                />

                {/* Select Estatus */}
                <Select
                  label="Estatus"
                  placeholder="Selecciona un estado"
                  variant="bordered"
                  selectedKeys={[estatus]}
                  onChange={(e) => setEstatus(e.target.value)}
                >
                  <SelectItem key="activo" value="activo">
                    Activo (Disponible)
                  </SelectItem>
                  <SelectItem key="inactivo" value="inactivo">
                    Inactivo (Agotado)
                  </SelectItem>
                </Select>
              </ModalBody>

              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSubmit(onClose)}
                  isLoading={loading}
                >
                  {isEditing ? "Guardar Cambios" : "Crear Producto"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}