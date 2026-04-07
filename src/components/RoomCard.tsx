"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users, Hash, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const statusConfig: Record<string, {
  variant: "secondary" | "default" | "outline";
  label: string;
  border: string;
  bg: string;
  color: string;
}> = {
  WAITING: {
    variant: "secondary",
    label: "Waiting",
    border: "oklch(0.7 0.14 85 / 20%)",
    bg: "oklch(0.7 0.14 85 / 10%)",
    color: "oklch(0.75 0.14 85)",
  },
  PLAYING: {
    variant: "default",
    label: "In Game",
    border: "oklch(0.55 0.15 160 / 25%)",
    bg: "oklch(0.55 0.15 160 / 12%)",
    color: "oklch(0.72 0.15 160)",
  },
  FINISHED: {
    variant: "outline",
    label: "Done",
    border: "oklch(0.4 / 15%)",
    bg: "oklch(0.35 / 6%)",
    color: "oklch(0.55)",
  },
};

export default function RoomCard({ room }: { room: any }) {
  const [copied, setCopied] = useState(false);

  const copyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const config = statusConfig[room.status] || statusConfig.WAITING;
  const playerCount = room._count?.players || room.players?.length || 0;

  return (
    <Link href={`/rooms/${room.id}`}>
      <article className="room-card room-card--${room.status}">
        {/* Top color bar */}
        <div className={`room-card-bar room-card-bar--${room.status}`} />

        <div className="room-card-body">
          {/* Top row: name + status */}
          <div className="room-card-top">
            <div className="room-card-name">
              <div className="truncate">
                <h3 className="room-card-title">{room.name}</h3>
                <div className="room-card-code">
                  <Hash className="h-2.5 w-2.5 text-zinc-600 flex-shrink-0" />
                  <span className="font-mono tracking-widest text-[0.65rem] text-zinc-500">
                    {room.code}
                  </span>
                  <button
                    className="room-card-copy"
                    onClick={copyCode}
                  >
                    {copied ? (
                      <Check className="h-2.5 w-2.5 text-green-400" />
                    ) : (
                      <Copy className="h-2.5 w-2.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="room-card-status">
              <Badge
                variant={config.variant}
                className="room-badge"
                style={{
                  border: `1px solid ${config.border}`,
                  background: config.bg,
                  color: config.color,
                }}
              >
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Bottom row */}
          <div className="room-card-bottom">
            <div className="room-card-author">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={
                    room.creator.image ??
                    `https://ui-avatars.com/api/?name=${room.creator.name}`
                  }
                />
                <AvatarFallback className="text-[0.6rem] bg-primary/15 text-zinc-300">
                  {room.creator.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="room-card-author-text">
                by <span>{room.creator.name}</span>
              </span>
            </div>

            <div className="room-card-meta">
              <span className="room-card-players">
                <Users className="h-3 w-3 text-zinc-600" />
                {playerCount}/{room.maxPlayers}
              </span>
              <span className="room-card-arrow">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
