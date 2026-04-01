// components/room/RoundResults.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoundResults({
  room,
  round,
  isHost,
}: {
  room: any;
  round: any;
  isHost?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const sortedResponses = [...(round.responses || [])].sort(
    (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
  );

  const handleNextRound = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}/rounds/next`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Falha ao iniciar a próxima rodada.");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao iniciar a próxima rodada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-yellow-950/20 to-zinc-950 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Round {round.roundNumber} Complete!
          </Badge>
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">
            Round Results
          </h1>
          <p className="text-zinc-400">Theme: {round.theme?.title}</p>
        </div>

        <div className="space-y-4 mb-8 flex-1">
          {sortedResponses.slice(0, 3).map((response: any, index: number) => {
            const medals = ["🥇", "🥈", "🥉"];
            const score = response.upvotes - response.downvotes;

            return (
              <Card
                key={response.id}
                className="bg-zinc-900/50 border-zinc-800 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{medals[index]}</div>
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        response.author.image ??
                        `https://ui-avatars.com/api/?name=${response.author.name}`
                      }
                    />
                    <AvatarFallback>{response.author.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-zinc-100">
                      {response.author.name}
                    </h3>
                    <p className="text-zinc-400 line-clamp-2">
                      {response.category === "TEXT" 
                        ? response.content 
                        : "Sent an image/drawing"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-2xl px-4 py-2">
                    {score > 0 ? "+" : ""}
                    {score}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center sticky bottom-4 z-10 transition-all p-4">
          <Button
            size="lg"
            onClick={handleNextRound}
            disabled={!isHost || loading}
            className={`shadow-2xl ${
              isHost 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-6 text-xl" 
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {loading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : null}
            {isHost ? "Next Round" : "Waiting for Host..."} 
            {!loading && isHost && <ArrowRight className="ml-2 h-6 w-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
