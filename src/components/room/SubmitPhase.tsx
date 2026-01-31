// components/room/SubmitPhase.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Send, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SubmitPhase({
  room,
  round,
}: {
  room: any;
  round: any;
}) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: POST /api/rooms/[id]/rounds/[roundId]/submit
      console.log("Submitting response:", { content, mediaUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Round {round.roundNumber} of {room.totalRounds}
          </Badge>
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">
            {round.theme.title}
          </h1>
          {round.theme.description && (
            <p className="text-zinc-400">{round.theme.description}</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Time remaining: 2:45</span>
          </div>
        </div>

        {/* Submit Form */}
        <Card className="bg-zinc-900/50 border-zinc-800 p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="content" className="text-lg">
                Your Response
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your creative response here..."
                className="mt-2 min-h-[200px] text-lg"
              />
            </div>

            {round.theme.category !== "TEXT" && (
              <div>
                <Label htmlFor="media">Media URL (optional)</Label>
                <Input
                  id="media"
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-2"
                />
              </div>
            )}

            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Send className="mr-2 h-5 w-5" />
              Submit Response
            </Button>
          </div>
        </Card>

        {/* Waiting Players */}
        <div className="mt-6 text-center text-sm text-zinc-400">
          <p>
            {round.responses?.length || 0}/{room.players.length} players
            submitted
          </p>
        </div>
      </div>
    </div>
  );
}
