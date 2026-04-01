import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Category, Prisma } from "@prisma/client";
import { generateUniqueRoomCode } from "@/lib/generate-room-code";
import { z } from "zod";

const createRoomSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters"),
  maxPlayers: z.number().min(2).max(20),
  totalRounds: z.number().min(3).max(15),
  upvotesPerPlayer: z.number().min(1).max(10),
  downvotesPerPlayer: z.number().min(0).max(5),
  allowedCategories: z.array(z.nativeEnum(Category)).min(1, "At least one category must be selected"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validação com Zod
    const validation = createRoomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      maxPlayers,
      totalRounds,
      upvotesPerPlayer,
      downvotesPerPlayer,
      allowedCategories,
    } = validation.data;

    const roomCode = await generateUniqueRoomCode();

    // Criar sala e adicionar criador como jogador em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.create({
        data: {
          name: name.trim(),
          code: roomCode,
          maxPlayers,
          totalRounds,
          upvotesPerPlayer,
          downvotesPerPlayer,
          allowedCategories,
          creatorId: session.user.id,
        },
      });

      await tx.roomPlayer.create({
        data: {
          roomId: room.id,
          playerId: session.user.id,
        },
      });

      return room;
    });

    return NextResponse.json(
      {
        success: true,
        room: {
          id: result.id,
          code: result.code,
          name: result.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating room:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "A room with this code already exists. Please try again." },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create room",
        details: process.env.NODE_ENV === "development" ? error : undefined
      },
      { status: 500 },
    );
  }
}
