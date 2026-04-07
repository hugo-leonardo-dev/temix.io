"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Home, Crown, Trophy, Star } from "lucide-react";
import Link from "next/link";

export default function FinalResults({ room }: { room: any }) {
  const sortedPlayers = [...room.players].sort((a: any, b: any) => b.score - a.score);

  const podiumConfig = [
    {
      label: "Winner",
      border: "border-amber-400/40",
      glow: "from-amber-400/15",
      text: "text-amber-300",
      bg: "bg-amber-400/10",
      iconColor: "text-amber-400",
      scoreBg: "bg-amber-400/15",
    },
    {
      label: "2nd Place",
      border: "border-zinc-300/40",
      glow: "from-zinc-300/10",
      text: "text-zinc-300",
      bg: "bg-zinc-300/10",
      iconColor: "text-zinc-300",
      scoreBg: "bg-zinc-300/15",
    },
    {
      label: "3rd Place",
      border: "border-orange-500/30",
      glow: "from-orange-500/10",
      text: "text-orange-300",
      bg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      scoreBg: "bg-orange-500/15",
    },
  ];

  return (
    <div className="final-results-root min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="final-results-header">
          <div className="final-results-header-icon">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <p className="final-results-header-subtitle">Game Complete</p>
            <h1 className="final-results-header-title">Final Results</h1>
          </div>
          <Badge variant="secondary" className="final-results-room-badge">
            {room.name}
          </Badge>
        </div>

        {/* Top 3 Podium */}
        <div className="final-results-podium">
          {sortedPlayers.slice(0, 3).map((player: any, index: number) => {
            const pos = podiumConfig[index];
            const rankLabels = ["1st", "2nd", "3rd"];

            return (
              <div
                key={player.id}
                className={`final-podium-card border ${pos.border} bg-gradient-to-br ${pos.glow} to-transparent`}
              >
                {/* Rank + Score */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Crown className="h-5 w-5 text-amber-400" />}
                    <span className={`final-medal-badge ${pos.bg} ${pos.text}`}>
                      {rankLabels[index]}
                    </span>
                  </div>
                  <div className={`final-podium-score ${pos.text}`}>
                    {player.score}
                    {index === 0 && <Star className="h-4 w-4 inline ml-1" />}
                  </div>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <Avatar className={`h-16 w-16 border-2 ${pos.border}`}>
                    <AvatarImage
                      src={
                        player.player.image ??
                        `https://ui-avatars.com/api/?name=${player.player.name}`
                      }
                    />
                    <AvatarFallback className="bg-primary/15 text-zinc-300 text-lg">
                      {player.player.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="final-player-name">
                      {player.player.name}
                    </p>
                    <p className="final-player-label">{pos.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of leaderboard */}
        {sortedPlayers.length > 3 && (
          <div className="final-results-leaderboard">
            <div className="final-results-leaderboard-header">
              <span>Full Leaderboard</span>
              <span className="text-xs text-zinc-500">{sortedPlayers.length} players</span>
            </div>

            {sortedPlayers.slice(3).map((player: any, index: number) => (
              <div key={player.id} className="final-leaderboard-item">
                <div className="final-leaderboard-rank">
                  #{index + 4}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      player.player.image ??
                      `https://ui-avatars.com/api/?name=${player.player.name}`
                    }
                  />
                  <AvatarFallback className="bg-primary/15 text-zinc-300">
                    {player.player.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="final-leaderboard-name">{player.player.name}</p>
                </div>
                <span className="final-leaderboard-score">
                  {player.score}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="final-results-footer">
          <Button size="lg" asChild className="btn-primary">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
