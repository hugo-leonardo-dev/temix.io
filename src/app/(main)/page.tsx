import { prisma } from "@/lib/prisma";
import RoomCard from "@/components/RoomCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const rooms = await prisma.room.findMany({
    include: {
      creator: {
        select: { name: true, image: true },
      },
      _count: {
        select: { players: true },
      },
    },
  });

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">Your Rooms</h1>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-zinc-300 mb-2">
            No rooms yet
          </h3>
          <p className="text-zinc-500 mb-6">
            Create your first room to get started!
          </p>
          <Button asChild>
            <Link href="/rooms/create">Create Room</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
