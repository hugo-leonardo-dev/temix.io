import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Category } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId, roundId } = await params;
    const body = await request.json();
    const { responses } = body;

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Invalid responses format" },
        { status: 400 },
      );
    }

    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        room: {
          include: {
            players: true,
          },
        },
        responses: true,
      },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (round.status !== "SUBMITTING") {
      return NextResponse.json(
        { error: "Round is not accepting submissions" },
        { status: 400 },
      );
    }

    // Upsert each response in a transaction
    await prisma.$transaction(async (tx) => {
      for (const resData of responses) {
        if (!resData.content && !resData.mediaUrl) continue;

        await tx.response.upsert({
          where: {
            roundId_authorId_category: {
              roundId: round.id,
              authorId: session.user.id,
              category: resData.category as Category,
            },
          },
          update: {
            content: resData.content?.trim() || "",
            mediaUrl: resData.mediaUrl?.trim() || null,
            roomId: roomId, // Garante que o roomId esteja presente
          },
          create: {
            content: resData.content?.trim() || "",
            mediaUrl: resData.mediaUrl?.trim() || null,
            category: resData.category as Category,
            roundId: round.id,
            authorId: session.user.id,
            roomId: roomId, // Relaciona com a sala para o Realtime
          },
        });
      }
    });

    // Re-check submissions to see if everyone is done
    const updatedRound = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        responses: true,
        room: {
          include: {
            players: true,
          },
        },
      },
    });

    const uniquePlayersSubmitted = new Set(updatedRound?.responses.map(r => r.authorId)).size;
    const totalPlayers = updatedRound?.room.players.length || 0;
    const allSubmitted = uniquePlayersSubmitted >= totalPlayers;

    if (allSubmitted) {
      await prisma.round.update({
        where: { id: round.id },
        data: { status: "VOTING" },
      });
    }

    return NextResponse.json({
      success: true,
      allSubmitted,
    });
  } catch (error) {
    console.error("Error submitting response:", error);
    return NextResponse.json(
      { error: "Failed to submit response" },
      { status: 500 },
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
