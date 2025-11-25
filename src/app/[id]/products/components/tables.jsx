"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react"; // O @heroui/react dependiendo de tu versión
import CrearEditarComponent from "./crearEditar";

export default function TableComponent({ user_id, data, backendURL }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);



  // Cargar datos al montar el componente
  useEffect(() => {
    setLoading(true);
    if (data && data.length > 0) {
      setProducts(data);
    }
    setLoading(false);
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {/* Botón para crear uno nuevo (arriba de la tabla) */}
      <div className="flex justify-end">
        <CrearEditarComponent user_id={user_id} backendURL={backendURL} />
      </div>

      <Table
        aria-label="Tabla de productos"
        emptyContent={loading ? "Cargando..." : "No hay productos registrados."}
      >
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>PRECIO</TableColumn>
          <TableColumn>ESTATUS</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>

        <TableBody
          items={products}
          isLoading={loading}
          loadingContent={<Spinner label="Cargando..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {/* Celda Nombre */}
              <TableCell>{item.name}</TableCell>

              {/* Celda Precio */}
              <TableCell>${item.price.toFixed(2)}</TableCell>

              {/* Celda Estatus - Puedes ponerle colorcitos si quieres */}
              <TableCell>
                <span className={item.estatus === "activo" ? "text-green-600 font-bold" : "text-red-500"}>
                  {item.estatus.toUpperCase()}
                </span>
              </TableCell>

              {/* Celda Acciones (Botón Editar) */}
              <TableCell>
                {/* Al pasarle "item", el componente sabe que es modo EDICIÓN */}
                <CrearEditarComponent user_id={user_id} item={item} backendURL={backendURL} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}