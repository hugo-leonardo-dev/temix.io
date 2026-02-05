// components/room/FinalResults.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Home } from "lucide-react";
import Link from "next/link";

export default function FinalResults({ room }: { room: any }) {
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/30 to-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <Trophy className="h-20 w-20 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-5xl font-bold text-zinc-100 mb-2">Game Over!</h1>
          <p className="text-zinc-400 text-lg">{room.name}</p>
        </div>

        <div className="space-y-4 mb-8">
          {sortedPlayers.map((player: any, index: number) => {
            const medals = ["🥇", "🥈", "🥉"];
            const medal = index < 3 ? medals[index] : "🏅";

            return (
              <Card
                key={player.id}
                className={`p-6 ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-900/30 to-zinc-900/50 border-yellow-600/50"
                    : index === 1
                      ? "bg-gradient-to-r from-gray-600/30 to-zinc-900/50 border-gray-500/50"
                      : index === 2
                        ? "bg-gradient-to-r from-orange-900/30 to-zinc-900/50 border-orange-600/50"
                        : "bg-zinc-900/50 border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{medal}</div>
                  <div className="text-2xl font-bold text-zinc-500 w-8">
                    #{index + 1}
                  </div>
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        player.player.image ??
                        `https://ui-avatars.com/api/?name=${player.player.name}`
                      }
                    />
                    <AvatarFallback>{player.player.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-zinc-100">
                      {player.player.name}
                    </h3>
                  </div>
                  <div className="text-4xl font-bold text-zinc-100">
                    {player.score}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center space-y-4">
          <Button size="lg" asChild>
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
