"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, Trophy, Crown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useRoom } from "./RoomContext";

export default function RoundResults({
  room: initialRoom,
  round: initialRound,
  isHost,
}: {
  room: any;
  round: any;
  isHost?: boolean;
}) {
  const { room, currentRound: round } = useRoom();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sortedResponses = [...(round.responses || [])].sort(
    (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
  );

  const podiumPositions = [
    { medal: "1st", border: "border-amber-400/40", glow: "from-amber-400/10", text: "text-amber-300", bg: "bg-amber-400/10", icon: "text-amber-400" },
    { medal: "2nd", border: "border-zinc-300/40", glow: "from-zinc-300/10", text: "text-zinc-300", bg: "bg-zinc-300/10", icon: "text-zinc-300" },
    { medal: "3rd", border: "border-orange-500/30", glow: "from-orange-500/10", text: "text-orange-300", bg: "bg-orange-500/10", icon: "text-orange-400" },
  ];

  const handleNextRound = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}/rounds/next`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to start next round");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="results-root">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="results-header">
          <div className="results-header-icon">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <p className="results-header-subtitle">Round {round.roundNumber} Complete</p>
            <h1 className="results-header-title">Results</h1>
          </div>
          <Badge variant="secondary" className="results-theme-badge">
            {round.theme?.title}
          </Badge>
        </div>

        {/* Podium */}
        <div className="results-podium">
          {sortedResponses.slice(0, 3).map((response: any, index: number) => {
            const pos = podiumPositions[index];
            const score = response.upvotes - response.downvotes;

            return (
              <div
                key={response.id}
                className={`results-podium-card border ${pos.border} bg-gradient-to-br ${pos.glow} to-transparent`}
              >
                {/* Rank + Avatar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Crown className="h-4 w-4 text-amber-400" />}
                    <span className={`results-medal-badge ${pos.bg} ${pos.text}`}>
                      {pos.medal}
                    </span>
                  </div>
                  <span className={`results-score ${pos.text}`}>
                    {score > 0 ? "+" : ""}{score}
                  </span>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3">
                  <Avatar className={`h-14 w-14 border-2 ${pos.border}`}>
                    <AvatarImage
                      src={
                        response.author.image ??
                        `https://ui-avatars.com/api/?name=${response.author.name}`
                      }
                    />
                    <AvatarFallback className="bg-primary/15 text-zinc-300">
                      {response.author.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="results-player-name">
                      {response.author.name}
                    </p>
                    <p className="text-sm text-zinc-500 line-clamp-2">
                      {response.category === "TEXT"
                        ? response.content
                        : "Sent an image/drawing"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other participants (3rd place onwards) */}
        {sortedResponses.length > 3 && (
          <div className="results-others-card">
            <div className="results-others-header">
              <span>All Participants</span>
              <span className="text-xs text-zinc-500">{sortedResponses.length} responses</span>
            </div>

            {sortedResponses.slice(3).map((response: any) => {
              const score = response.upvotes - response.downvotes;
              return (
                <div key={response.id} className="results-other-item">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        response.author.image ??
                        `https://ui-avatars.com/api/?name=${response.author.name}`
                      }
                    />
                    <AvatarFallback className="bg-primary/15 text-zinc-300">
                      {response.author.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="results-other-name">{response.author.name}</p>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {response.category === "TEXT"
                        ? response.content
                        : "Sent an image/drawing"}
                    </p>
                  </div>
                  <span className="results-other-score">
                    {score > 0 ? "+" : ""}{score}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="results-footer">
          {isHost ? (
            <Button
              size="lg"
              onClick={handleNextRound}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {round.roundNumber >= room.totalRounds ? "Finish Game" : "Next Round"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          ) : (
            <div className="results-waiting-text">
              <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
              <p>Waiting for host to continue...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
