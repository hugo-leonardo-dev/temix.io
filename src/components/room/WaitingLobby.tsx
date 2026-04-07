"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Hash,
  Gamepad2,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Copy,
  Check,
  Crown,
} from "lucide-react";

export default function WaitingLobby({ room }: { room: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themes, setThemes] = useState<string[]>(
    Array(room.totalRounds).fill(""),
  );

  const isHost = session?.user?.id === room.creatorId;
  const canStart = room.players.length >= 2;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = async () => {
    if (themes.some((t) => t.trim() === "")) {
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
    <div className="waiting-root">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Room title + code */}
        <div className="waiting-header">
          <div>
            <h1 className="waiting-title">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 gradient-shift">
                {room.name}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Room ready for players
            </p>
          </div>

          <div className="waiting-code-wrapper">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="waiting-code-text">{room.code}</span>
            <button className="waiting-code-copy" onClick={copyCode}>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="waiting-stats">
          <div className="waiting-stat-card">
            <div className="waiting-stat-icon waiting-stat-icon--amber">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {room.players.length}
              <span className="text-zinc-600 text-lg">/{room.maxPlayers}</span>
            </div>
            <div className="waiting-stat-label">Players</div>
          </div>

          <div className="waiting-stat-card">
            <div className="waiting-stat-icon waiting-stat-icon--violet">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {room.totalRounds}
            </div>
            <div className="waiting-stat-label">Rounds</div>
          </div>

          <div className="waiting-stat-card">
            <div className="waiting-stat-icon waiting-stat-icon--green">
              <ThumbsUp className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-zinc-100 waiting-stat-votes">
              +{room.upvotesPerPlayer}
              <span className="text-zinc-600">/</span>
              <span className="text-sm text-red-400">
                {room.downvotesPerPlayer}
              </span>
            </div>
            <div className="waiting-stat-label">
              <span className="text-green-400 text-xs">up</span>
              <span className="text-zinc-600 mx-1">/</span>
              <span className="text-red-400 text-xs">down</span>
            </div>
          </div>
        </div>

        {/* Players list */}
        <div className="waiting-players-card">
          <div className="waiting-players-header">
            <Users className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-100">
              Players in Lobby
            </h2>
            <Badge variant="secondary" className="waiting-players-badge">
              {room.players.length}
            </Badge>
          </div>

          <div className="waiting-players-list">
            {room.players.map((player: any, index: number) => {
              const isHostPlayer = player.playerId === room.creatorId;
              return (
                <div key={player.id} className="waiting-player-item">
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
                  <div>
                    <div className="waiting-player-name">
                      {player.player.name}
                    </div>
                    <div className="waiting-player-meta">
                      {isHostPlayer ? (
                        <>
                          <Crown className="h-3 w-3 text-amber-400" />
                          <span>Host</span>
                        </>
                      ) : (
                        <>
                          <span>Joined #{index + 1}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && !showThemeModal && (
          <div className="error-box">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Start button */}
        <div className="waiting-footer">
          {isHost ? (
            <div>
              <Button
                size="lg"
                onClick={() => setShowThemeModal(true)}
                disabled={!canStart || isStarting}
                className={`btn-primary ${isStarting ? "opacity-70" : ""}`}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Gamepad2 className="mr-2 h-5 w-5" />
                    Configure & Start Game
                  </>
                )}
              </Button>
              {!canStart && (
                <p className="text-sm text-zinc-500 mt-3">
                  Waiting for at least one more player to join
                </p>
              )}
            </div>
          ) : (
            <div className="waiting-waiting-text">
              <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
              <p>Waiting for host to start the game...</p>
            </div>
          )}
        </div>

        {/* Theme modal */}
        {showThemeModal && (
          <div className="waiting-modal-backdrop">
            <div className="waiting-modal">
              <h2 className="text-xl font-bold text-zinc-100 mb-1">
                Set Round Themes
              </h2>
              <p className="text-zinc-500 text-sm mb-6">
                Define the theme for each of the {room.totalRounds} rounds
              </p>

              {error && (
                <div className="error-box mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="waiting-modal-themes">
                {themes.map((theme, index) => (
                  <div key={index}>
                    <label className="theme-label">
                      Round {index + 1} Theme
                    </label>
                    <input
                      type="text"
                      className="theme-input"
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

              <div className="waiting-modal-actions">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowThemeModal(false);
                    setError(null);
                  }}
                  disabled={isStarting}
                  className="wait-modal-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startGame}
                  disabled={isStarting}
                  className="btn-primary flex-1"
                >
                  {isStarting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Start Game
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
