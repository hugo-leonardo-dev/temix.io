"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Play, Users, Hash } from "lucide-react";
import { useState } from "react";

export default function WaitingLobby({ room }: { room: any }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = async () => {
    // TODO: POST /api/rooms/[id]/start
    console.log("Starting game...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950/20 to-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">{room.name}</h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="text-base px-4 py-1.5">
              <Hash className="h-4 w-4 mr-1" />
              {room.code}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyCode}
              className="hover:bg-zinc-800"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold text-zinc-100">
              {room.players.length}/{room.maxPlayers}
            </div>
            <div className="text-xs text-zinc-400">Players</div>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-zinc-100">
              {room.totalRounds}
            </div>
            <div className="text-xs text-zinc-400">Rounds</div>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800 p-6 text-center">
            <div className="text-4xl mb-2">👍</div>
            <div className="text-2xl font-bold text-zinc-100">
              {room.upvotesPerPlayer}/{room.downvotesPerPlayer}
            </div>
            <div className="text-xs text-zinc-400">Votes</div>
          </Card>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800 p-6 mb-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Players in Lobby
          </h2>
          <div className="space-y-3">
            {room.players.map((player: any, index: number) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition"
              >
                <div className="text-zinc-500 font-mono text-sm w-6">
                  #{index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      player.player.image ??
                      `https://ui-avatars.com/api/?name=${player.player.name}`
                    }
                  />
                  <AvatarFallback>{player.player.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-zinc-100">
                    {player.player.name}
                  </div>
                  {player.playerId === room.creatorId && (
                    <Badge variant="outline" className="text-xs">
                      Host
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center">
          {room.creatorId === "current-user-id" ? ( // TODO: pegar user session
            <Button
              size="lg"
              onClick={startGame}
              disabled={room.players.length < 2}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 px-8"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Game
            </Button>
          ) : (
            <p className="text-zinc-400">
              Waiting for host to start the game...
            </p>
          )}
          {room.players.length < 2 && (
            <p className="text-sm text-zinc-500 mt-2">
              Need at least 2 players to start
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
