import { prisma } from "@/lib/prisma";
import RoomCard from "@/components/RoomCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  const rooms = await prisma.room.findMany({
    where: {
      OR: [
        { creatorId: session!.user!.id },
        { players: { some: { playerId: session!.user!.id } } },
      ],
    },
    include: {
      creator: {
        select: { name: true, image: true },
      },
      _count: {
        select: { players: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Welcome back, {session!.user!.name}! 👋
          </h1>
          <p className="text-zinc-400">Your active rooms and games</p>
        </div>
        <Button
          asChild
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25"
        ></Button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-6">🎮</div>
          <h3 className="text-2xl font-semibold text-zinc-200 mb-3">
            No rooms yet
          </h3>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Create your first room and invite friends to play together!
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25"
          >
            <Link href="/rooms/create">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Room
            </Link>
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
