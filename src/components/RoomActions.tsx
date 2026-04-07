"use client";

import { useState } from "react";
import { LogIn, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JoinRoomDialog } from "@/components/JoinRoomDialog";

export default function RoomActions() {
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 justify-center">
        <Button asChild className="btn-secondary">
          <Link href="/rooms/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Room
          </Link>
        </Button>

        <Button className="btn-secondary" onClick={() => setIsJoinOpen(true)}>
          <LogIn className="mr-2 h-4 w-4" />
          Join Room
        </Button>
      </div>
      <JoinRoomDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </>
  );
}
