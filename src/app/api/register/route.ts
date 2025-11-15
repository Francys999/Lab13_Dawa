import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    await createUser(name, email, password);

    return NextResponse.json(
      { message: "Usuario registrado correctamente" },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? "Error al registrar" },
      { status: 400 }
    );
  }
}