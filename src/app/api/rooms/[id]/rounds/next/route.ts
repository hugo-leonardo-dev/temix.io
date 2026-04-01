import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = await params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        rounds: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can start the next round" },
        { status: 403 }
      );
    }

    if (room.status === "FINISHED") {
      return NextResponse.json({ error: "Game already finished" }, { status: 400 });
    }

    const currentRoundNumber = room.rounds.length;

    // Se já jogamos todas as rodadas, finalizar o jogo de verdade
    if (currentRoundNumber >= room.totalRounds) {
      await prisma.room.update({
        where: { id: roomId },
        data: { status: "FINISHED" },
      });
      return NextResponse.json({ success: true, isGameFinished: true });
    }

    // Pegar os temas criados pelo host para esta sala
    const roomThemes = await prisma.theme.findMany({
      where: { roomId: room.id, isSystem: false },
      orderBy: { createdAt: 'asc' }, // Assegura a extração na mesma ordem criada
    });

    const nextTheme = roomThemes[currentRoundNumber];

    if (!nextTheme) {
      return NextResponse.json({ error: "No theme configured for this round." }, { status: 400 });
    }

    // Criar a próxima rodada
    const newRound = await prisma.round.create({
      data: {
        roundNumber: currentRoundNumber + 1,
        status: "SUBMITTING",
        roomId: room.id,
        themeId: nextTheme.id,
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, round: newRound });
  } catch (error) {
    console.error("Error starting next round:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
