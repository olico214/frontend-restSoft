import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // 1. Obtener datos del body
    const { url, content, phone } = await req.json();
console.log(url, content, phone)
    // 2. Validaciones básicas
    if (!url || !content || !phone) {
      return NextResponse.json(
        { error: "Faltan datos (url, content o phone)" }, 
        { status: 400 }
      );
    }


    const response = await fetch(`${url}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: `521${phone}`,
        message: content,
      }),
    });

    // 4. Procesar respuesta del servicio externo
    const data = await response.json();

    // 5. Retornar respuesta al frontend (IMPORTANTE: faltaba el return)
    return NextResponse.json({ ok: true, external_data: data }, { status: response.status });

  } catch (error) {
    console.error("Error en proxy de mensajes:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}