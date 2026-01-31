"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Send, Clock } from "lucide-react";
import { useState } from "react";

export default function VotingPhase({
  room,
  round,
}: {
  room: any;
  round: any;
}) {
  const [votes, setVotes] = useState<
    Record<string, "UPVOTE" | "DOWNVOTE" | null>
  >({});
  const [upvotesLeft, setUpvotesLeft] = useState(room.upvotesPerPlayer);
  const [downvotesLeft, setDownvotesLeft] = useState(room.downvotesPerPlayer);
  const [loading, setLoading] = useState(false);

  const handleVote = (responseId: string, type: "UPVOTE" | "DOWNVOTE") => {
    const currentVote = votes[responseId];

    if (currentVote === type) {
      setVotes({ ...votes, [responseId]: null });
      if (type === "UPVOTE") setUpvotesLeft(upvotesLeft + 1);
      else setDownvotesLeft(downvotesLeft + 1);
    } else {
      if (type === "UPVOTE" && upvotesLeft > 0) {
        if (currentVote === "DOWNVOTE") setDownvotesLeft(downvotesLeft + 1);
        setVotes({ ...votes, [responseId]: type });
        setUpvotesLeft(upvotesLeft - 1);
      } else if (type === "DOWNVOTE" && downvotesLeft > 0) {
        if (currentVote === "UPVOTE") setUpvotesLeft(upvotesLeft + 1);
        setVotes({ ...votes, [responseId]: type });
        setDownvotesLeft(downvotesLeft - 1);
      }
    }
  };

  const handleSubmitVotes = async () => {
    setLoading(true);
    try {
      const validVotes = Object.entries(votes)
        .filter(([_, voteType]) => voteType !== null)
        .map(([responseId, voteType]) => ({ responseId, voteType }));

      // TODO: POST /api/rooms/[room.id]/rounds/[round.id]/votes
      console.log("Submitting votes:", validVotes);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Votes submitted successfully!");
    } catch (error) {
      console.error("Error submitting votes:", error);
      alert("Failed to submit votes");
    } finally {
      setLoading(false);
    }
  };

  const totalVotesCast = Object.values(votes).filter((v) => v !== null).length;
  const canSubmit = totalVotesCast > 0;

  return (
    <div className="min-h-screen  ">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            Round {round.roundNumber} - Voting Phase
          </Badge>
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">
            Vote on the best responses!
          </h1>
          <div className="flex items-center justify-center gap-6 mb-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <ThumbsUp className="h-4 w-4" /> {upvotesLeft} left
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <ThumbsDown className="h-4 w-4" /> {downvotesLeft} left
            </Badge>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {round.responses?.map((response: any) => (
            <Card
              key={response.id}
              className={`bg-zinc-900/50 border-zinc-800 p-6 hover:bg-zinc-900/70 transition ${
                votes[response.id] === "UPVOTE"
                  ? "ring-2 ring-green-500/50"
                  : votes[response.id] === "DOWNVOTE"
                    ? "ring-2 ring-red-500/50"
                    : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      response.author.image ??
                      `https://ui-avatars.com/api/?name=${response.author.name}`
                    }
                  />
                  <AvatarFallback>{response.author.name?.[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="font-semibold text-zinc-100 mb-1">
                    {response.author.name}
                  </div>
                  <p className="text-zinc-300 mb-3">{response.content}</p>
                  {response.mediaUrl && (
                    <img
                      src={response.mediaUrl}
                      alt="Response media"
                      className="rounded-lg max-h-64 object-cover mb-3"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={
                      votes[response.id] === "UPVOTE" ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => handleVote(response.id, "UPVOTE")}
                    disabled={
                      upvotesLeft === 0 && votes[response.id] !== "UPVOTE"
                    }
                    className={
                      votes[response.id] === "UPVOTE"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      votes[response.id] === "DOWNVOTE"
                        ? "destructive"
                        : "outline"
                    }
                    size="icon"
                    onClick={() => handleVote(response.id, "DOWNVOTE")}
                    disabled={
                      downvotesLeft === 0 && votes[response.id] !== "DOWNVOTE"
                    }
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-zinc-900/80 border-zinc-800 p-6 sticky bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">
              {totalVotesCast >
              room.upvotesPerPlayer + room.downvotesPerPlayer ? (
                <span>
                  ✓ You've cast{" "}
                  <strong className="text-zinc-100">{totalVotesCast}</strong>{" "}
                  vote{totalVotesCast !== 1 ? "s" : ""}
                </span>
              ) : (
                <span>
                  Remaining {room.upvotesPerPlayer + room.downvotesPerPlayer}{" "}
                  votes
                </span>
              )}
            </div>
            <Button
              size="lg"
              onClick={handleSubmitVotes}
              disabled={!canSubmit || loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg w-full sm:w-auto"
            >
              <Send className="mr-2 h-5 w-5" />
              {loading ? "Submitting..." : "Submit Votes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
