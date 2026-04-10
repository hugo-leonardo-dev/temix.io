"use client";

import SubmitPhase from "./SubmitPhase";
import VotingPhase from "./VotingPhase";
import RoundResults from "./RoundResults";
import { useRoom } from "./RoomContext";
import { Loader2 } from "lucide-react";

export default function GamePlay() {
  const { room, currentRound, currentUserId } = useRoom();

  if (!currentRound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-4">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
        <p className="text-zinc-400 font-medium">Preparing round...</p>
      </div>
    );
  }

  // Se a rodada está em fase de submissão
  if (currentRound.status === "SUBMITTING") {
    return (
      <SubmitPhase
        room={{
          ...room,
          currentUserId: currentUserId,
        }}
        round={currentRound}
      />
    );
  }

  // Se está em fase de votação
  if (currentRound.status === "VOTING") {
    // Nota: O check de 'hasVoted' pode ser feito dentro do VotingPhase 
    // ou mantido simples aqui se já tivermos a info no Round.
    return (
      <VotingPhase 
        room={room} 
        round={currentRound} 
      />
    );
  }

  // Se a rodada acabou (Resultados Parciais)
  if (currentRound.status === "FINISHED") {
    const isHost = currentUserId === room.creatorId;
    return <RoundResults room={room} round={currentRound} isHost={isHost} />;
  }

  return null;
}
