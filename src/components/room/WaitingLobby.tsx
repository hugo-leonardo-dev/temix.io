"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Play,
  Users,
  Hash,
  GamepadDirectional,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function WaitingLobby({ room }: { room: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themes, setThemes] = useState<string[]>(Array(room.totalRounds).fill(""));

  const isHost = session?.user?.id === room.creatorId;
  const canStart = room.players.length >= 2;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGameClick = () => {
    setShowThemeModal(true);
  };

  const startGame = async () => {
    // Valida se todos os temas foram preenchidos
    if (themes.some(t => t.trim() === "")) {
      setError("Please fill in all round themes before starting.");
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${room.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customThemes: themes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start game");
      }

      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen">
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
            <GamepadDirectional className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-zinc-100">
              {room.totalRounds}
            </div>
            <div className="text-xs text-zinc-400">Rounds</div>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800 p-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <ThumbsUp className="h-8 w-8 text-green-400" />
              <ThumbsDown className="h-8 w-8 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-zinc-100 flex items-center justify-center gap-1">
              <span className="text-green-400">{room.upvotesPerPlayer}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-red-400">{room.downvotesPerPlayer}</span>
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

        {error && !showThemeModal && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="text-center">
          {isHost ? (
            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleStartGameClick}
                disabled={!canStart || isStarting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 px-8"
              >
                <Play className="mr-2 h-5 w-5" />
                Configure Themes & Start
              </Button>
              {!canStart && (
                <p className="text-sm text-zinc-500">
                  Need at least 3 players to start
                </p>
              )}
            </div>
          ) : (
            <p className="text-zinc-400">
              Waiting for host to start the game...
            </p>
          )}
        </div>

        {/* Modal de Temas Customizados */}
        {showThemeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-2">Set Round Themes</h2>
              <p className="text-zinc-400 mb-6 text-sm">
                As the host, you need to define the theme for each of the {room.totalRounds} rounds before starting.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-8">
                {themes.map((theme, index) => (
                  <div key={index}>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">
                      Round {index + 1} Theme
                    </label>
                    <input
                      type="text"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={`E.g., "Your favorite childhood memory"`}
                      value={theme}
                      onChange={(e) => {
                        const newThemes = [...themes];
                        newThemes[index] = e.target.value;
                        setThemes(newThemes);
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => { setShowThemeModal(false); setError(null); }}
                  disabled={isStarting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={startGame}
                  disabled={isStarting}
                >
                  {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Game"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
