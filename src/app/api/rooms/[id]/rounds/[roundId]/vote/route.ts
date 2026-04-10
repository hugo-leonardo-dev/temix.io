import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
    const { votes } = await request.json();

    if (!votes || !Array.isArray(votes)) {
      return NextResponse.json({ error: "Invalid votes format" }, { status: 400 });
    }

    const round = await prisma.round.findUnique({
      where: { id: roundId },
      include: {
        room: { include: { players: true } },
      },
    });

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (round.status !== "VOTING") {
      return NextResponse.json({ error: "Round is not accepting votes" }, { status: 400 });
    }

    const isPlayerInRoom = round.room.players.some((p) => p.playerId === session.user.id);
    if (!isPlayerInRoom) {
      return NextResponse.json({ error: "You are not in this room" }, { status: 403 });
    }

    // Usando transação para garantir que os votos são processados de forma atômica
    await prisma.$transaction(async (tx) => {
      // Limpa os votos antigos desse jogador nessa rodada (para suportar re-submissões)
      await tx.vote.deleteMany({
        where: {
          voterId: session.user.id,
          response: { roundId: round.id }
        }
      });

      // Insere os novos votos
      for (const v of votes) {
        if (!v.responseId || !v.voteType) continue;

        await tx.vote.create({
          data: {
            type: v.voteType,
            voterId: session.user.id,
            responseId: v.responseId,
            roomId: roomId, // Relaciona com a sala para o Realtime
          }
        });
        
        // Atualiza a contagem dos votos na response (denormalization)
        // Isso é opcional dependendo do quão complexa é a query de leitura, 
        // mas vamos atualizar para garantir agilidade no dashboard
        if (v.voteType === "UPVOTE") {
          await tx.response.update({
            where: { id: v.responseId },
            data: { upvotes: { increment: 1 } }
          });
        } else if (v.voteType === "DOWNVOTE") {
          await tx.response.update({
            where: { id: v.responseId },
            data: { downvotes: { increment: 1 } }
          });
        }
      }
    });

    // Verificar se todos votaram
    const allVotes = await prisma.vote.findMany({
      where: { response: { roundId: round.id } },
      select: { voterId: true },
    });
    
    const uniqueVoters = new Set(allVotes.map(v => v.voterId)).size;
    const totalPlayers = round.room.players.length;
    
    let isFinished = false;
    if (uniqueVoters >= totalPlayers) {
      isFinished = true;
      
      // Update round status to FINISHED
      await prisma.round.update({
        where: { id: round.id },
        data: { status: "FINISHED", endedAt: new Date() }
      });

      // Se for a última rodada do jogo, finalizar a sala - simplificado por enquanto
      if (round.roundNumber >= round.room.totalRounds) {
        await prisma.room.update({
          where: { id: roomId },
          data: { status: "FINISHED" }
        });
      }
    }

    return NextResponse.json({ success: true, isFinished });

  } catch (error) {
    console.error("Error submitting votes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
