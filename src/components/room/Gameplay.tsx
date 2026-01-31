"use client";

import SubmitPhase from "./SubmitPhase";
import VotingPhase from "./VotingPhase";
import RoundResults from "./RoundResults";

export default function GamePlay({
  room,
  currentRound,
}: {
  room: any;
  currentRound: any;
}) {
  if (!currentRound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-400">Loading round...</p>
      </div>
    );
  }

  if (currentRound.status === "SUBMITTING") {
    return <SubmitPhase room={room} round={currentRound} />;
  }

  if (currentRound.status === "VOTING") {
    return <VotingPhase room={room} round={currentRound} />;
  }

  if (currentRound.status === "FINISHED") {
    return <RoundResults room={room} round={currentRound} />;
  }

  return null;
}
