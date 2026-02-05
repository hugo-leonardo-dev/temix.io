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
    const { content, mediaUrl, category } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
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
        theme: true,
        responses: true,
      },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (round.roomId !== roomId) {
      return NextResponse.json({ error: "Invalid round" }, { status: 400 });
    }

    if (round.status !== "SUBMITTING") {
      return NextResponse.json(
        { error: "Round is not accepting submissions" },
        { status: 400 },
      );
    }

    const isPlayerInRoom = round.room.players.some(
      (p) => p.playerId === session.user.id,
    );

    if (!isPlayerInRoom) {
      return NextResponse.json(
        { error: "You are not in this room" },
        { status: 403 },
      );
    }

    const existingResponse = round.responses.find(
      (r) => r.playerId === session.user.id,
    );

    if (existingResponse) {
      return NextResponse.json(
        { error: "You already submitted a response" },
        { status: 400 },
      );
    }

    const themeCategory = round.theme.category;

    if (themeCategory !== Category.TEXT && mediaUrl) {
      if (!isValidUrl(mediaUrl)) {
        return NextResponse.json(
          { error: "Invalid media URL" },
          { status: 400 },
        );
      }
    }

    const response = await prisma.response.create({
      data: {
        content: content.trim(),
        mediaUrl: mediaUrl?.trim() || null,
        roundId: round.id,
        playerId: session.user.id,
        submittedAt: new Date(),
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const totalPlayers = round.room.players.length;
    const totalResponses = round.responses.length + 1;

    if (totalResponses >= totalPlayers) {
      await prisma.round.update({
        where: { id: round.id },
        data: { status: "VOTING" },
      });
    }

    return NextResponse.json({
      success: true,
      response: {
        id: response.id,
        content: response.content,
        mediaUrl: response.mediaUrl,
      },
      allSubmitted: totalResponses >= totalPlayers,
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
