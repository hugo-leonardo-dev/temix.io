import SubmitPhase from "./SubmitPhase";
import VotingPhase from "./VotingPhase";
import RoundResults from "./RoundResults";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function GamePlay({
  room,
  currentRound,
}: {
  room: any;
  currentRound: any;
}) {
  const session = await auth();

  if (!currentRound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400">Loading round...</p>
      </div>
    );
  }

  if (currentRound.status === "SUBMITTING") {
    return (
      <SubmitPhase
        room={{
          ...room,
          currentUserId: session?.user?.id,
        }}
        round={currentRound}
      />
    );
  }

  if (currentRound.status === "VOTING") {
    let hasVoted = false;
    if (session?.user?.id) {
      const existingVote = await prisma.vote.findFirst({
        where: {
          voterId: session.user.id,
          response: { roundId: currentRound.id }
        }
      });
      hasVoted = !!existingVote;
    }

    return <VotingPhase room={room} round={currentRound} initialHasVoted={hasVoted} />;
  }

  if (currentRound.status === "FINISHED") {
    const isHost = session?.user?.id === room.creatorId;
    return <RoundResults room={room} round={currentRound} isHost={isHost} />;
  }

  return null;
}
