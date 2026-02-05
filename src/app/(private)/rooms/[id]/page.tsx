import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WaitingLobby from "@/components/room/WaitingLobby";
import FinalResults from "@/components/room/FinalResults";
import Gameplay from "@/components/room/Gameplay";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      creator: true,
      players: {
        include: {
          player: true,
        },
        orderBy: { score: "desc" },
      },
      rounds: {
        orderBy: { roundNumber: "desc" },
        take: 1,
        include: {
          theme: true,
          responses: {
            include: {
              author: true,
            },
          },
        },
      },
    },
  });

  if (!room) notFound();

  const currentRound = room.rounds[0];

  if (room.status === "WAITING") {
    return <WaitingLobby room={room} />;
  }

  if (room.status === "FINISHED") {
    return <FinalResults room={room} />;
  }

  return <Gameplay room={room} currentRound={currentRound} />;
}
