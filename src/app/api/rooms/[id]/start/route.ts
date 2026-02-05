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
        players: true,
        rounds: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the host can start the game" },
        { status: 403 },
      );
    }

    if (room.status !== "WAITING") {
      return NextResponse.json(
        { error: "Game already started" },
        { status: 400 },
      );
    }

    if (room.players.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 players to start" },
        { status: 400 },
      );
    }

    const theme = await prisma.theme.create({
      data: {
        title: "First Round Theme",
        description: "Submit your best content!",
        category: room.allowedCategories[0],
        isSystem: false,
        roomId: room.id,
      },
    });

    const [updatedRoom] = await prisma.$transaction([
      prisma.room.update({
        where: { id: roomId },
        data: { status: "PLAYING" },
      }),
      prisma.round.create({
        data: {
          roomId: room.id,
          roundNumber: 1,
          themeId: theme.id,
          status: "SUBMITTING",
          startedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      room: {
        id: updatedRoom.id,
        status: updatedRoom.status,
      },
    });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 },
    );
  }
}
