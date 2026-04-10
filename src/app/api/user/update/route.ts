import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, image } = body;

    if (!name && !image) {
      return NextResponse.json(
        { error: "No data provided" },
        { status: 400 }
      );
    }

    const updateData: { name?: string; image?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true, image: true },
    });

    // Retorna os dados atualizados do usuário
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
