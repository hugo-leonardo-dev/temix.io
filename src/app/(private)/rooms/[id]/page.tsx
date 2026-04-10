import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WaitingLobby from "@/components/room/WaitingLobby";
import FinalResults from "@/components/room/FinalResults";
import Gameplay from "@/components/room/Gameplay";
import { RoomProvider } from "@/components/room/RoomContext";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

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
    <RoomProvider initialData={room} userId={session?.user?.id}>
      {room.status === "WAITING" ? (
        <WaitingLobby room={room} />
      ) : room.status === "FINISHED" ? (
        <FinalResults room={room} />
      ) : (
        <Gameplay room={room} currentRound={currentRound} />
      )}
    </RoomProvider>
  );
}
