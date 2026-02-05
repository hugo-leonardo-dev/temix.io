import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Category } from "@prisma/client";
import { generateUniqueRoomCode } from "@/lib/generate-room-code";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      maxPlayers,
      totalRounds,
      upvotesPerPlayer,
      downvotesPerPlayer,
      allowedCategories,
    } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Room name must be at least 3 characters" },
        { status: 400 },
      );
    }

    if (maxPlayers < 2 || maxPlayers > 20) {
      return NextResponse.json(
        { error: "Max players must be between 2 and 20" },
        { status: 400 },
      );
    }

    if (totalRounds < 3 || totalRounds > 15) {
      return NextResponse.json(
        { error: "Total rounds must be between 3 and 15" },
        { status: 400 },
      );
    }

    if (!allowedCategories || allowedCategories.length === 0) {
      return NextResponse.json(
        { error: "At least one category must be selected" },
        { status: 400 },
      );
    }

    const roomCode = await generateUniqueRoomCode();

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        code: roomCode,
        maxPlayers,
        totalRounds,
        upvotesPerPlayer,
        downvotesPerPlayer,
        allowedCategories: allowedCategories as Category[],
        creatorId: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    await prisma.roomPlayer.create({
      data: {
        roomId: room.id,
        playerId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        room: {
          id: room.id,
          code: room.code,
          name: room.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}
