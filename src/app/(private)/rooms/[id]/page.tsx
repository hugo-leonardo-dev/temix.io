import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WaitingLobby from "@/components/room/WaitingLobby";
import FinalResults from "@/components/room/FinalResults";
import Gameplay from "@/components/room/Gameplay";
import RoomRealtime from "@/components/room/RoomRealtime";

export const dynamic = 'force-dynamic'; // Desativa o cache do Next.js para os dados do Prisma

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

  return (
    <>
      <RoomRealtime roomId={room.id} />
      {room.status === "WAITING" ? (
        <WaitingLobby room={room} />
      ) : room.status === "FINISHED" ? (
        <FinalResults room={room} />
      ) : (
        <Gameplay room={room} currentRound={currentRound} />
      )}
    </>
  );
}
