"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const statusConfig = {
  WAITING: { variant: "secondary" as const, label: "Waiting" },
  PLAYING: { variant: "default" as const, label: "Playing" },
  FINISHED: { variant: "outline" as const, label: "Finished" },
};

export default function RoomCard({ room }: { room: any }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link href={`/rooms/${room.id}`}>
      <Card className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-zinc-100 leading-tight truncate">
              {room.name}
            </h3>

            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-zinc-500 font-mono">{room.code}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-zinc-800"
                onClick={(e) => {
                  e.preventDefault();
                  copyCode();
                }}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>

          <Badge variant={statusConfig[room.status].variant}>
            {statusConfig[room.status].label}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  room.creator.image ??
                  `https://ui-avatars.com/api/?name=${room.creator.name}`
                }
              />
              <AvatarFallback>{room.creator.name?.[0]}</AvatarFallback>
            </Avatar>

            <span className="text-sm text-zinc-400">
              by <strong className="text-zinc-200">{room.creator.name}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>
              {room._count.players}/{room.maxPlayers} players
            </span>
            <span>{room.totalRounds} rounds</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
