"use client"
import {
  Modal, ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import CreateOrder from "./crearOrder";

export default function ModalCrearOrden({ products, user_id, backendURL }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen}>Open Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Nuevo Pedido</ModalHeader>
              <ModalBody>
                <CreateOrder products={products} user_id={user_id} backendURL={backendURL} />
              </ModalBody>

            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
