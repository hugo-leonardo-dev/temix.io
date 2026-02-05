import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 },
      );
    }

    // Buscar a sala pelo código
    const room = await prisma.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Verificar se a sala não está cheia
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json({ error: "Room is full" }, { status: 400 });
    }

    // Verificar se o jogo já começou
    if (room.status !== "WAITING") {
      return NextResponse.json(
        { error: "Game already started" },
        { status: 400 },
      );
    }

    // Verificar se o jogador já está na sala
    const isAlreadyInRoom = room.players.some(
      (p) => p.playerId === session.user.id,
    );

    if (isAlreadyInRoom) {
      // Se já está na sala, apenas redireciona
      return NextResponse.json({
        success: true,
        room: { id: room.id, code: room.code },
      });
    }

    // Adicionar o jogador à sala
    await prisma.roomPlayer.create({
      data: {
        roomId: room.id,
        playerId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        code: room.code,
        name: room.name,
      },
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
