import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Gamepad2, Clock, Trophy, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import RoomCard from "@/components/RoomCard";

const statusGroups = {
  WAITING: { label: "Waiting Room", icon: Clock, accent: "amber" },
  PLAYING: { label: "In Progress", icon: Gamepad2, accent: "emerald" },
  FINISHED: { label: "Completed", icon: Trophy, accent: "zinc" },
} as const;

const sectionConfig: Record<string, { border: string; glow: string }> = {
  PLAYING: {
    border: "border-emerald-500/20",
    glow: "from-emerald-500/5 via-transparent to-transparent",
  },
  WAITING: {
    border: "border-yellow-500/20",
    glow: "from-yellow-500/5 via-transparent to-transparent",
  },
  FINISHED: {
    border: "border-zinc-500/20",
    glow: "from-zinc-500/5 via-transparent to-transparent",
  },
};

export default async function Home() {
  const session = await auth();
  const userId = session!.user!.id;

  const rooms = await prisma.room.findMany({
    where: {
      OR: [{ creatorId: userId }, { players: { some: { playerId: userId } } }],
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

  const grouped = {
    WAITING: rooms.filter((r) => r.status === "WAITING"),
    PLAYING: rooms.filter((r) => r.status === "PLAYING"),
    FINISHED: rooms.filter((r) => r.status === "FINISHED"),
  };

  const hasRooms = rooms.length > 0;

  return (
    <div className="min-h-full">
      {/* Animated blobs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          className="blob blob-1"
          style={{
            width: 350,
            height: 350,
            top: "-5%",
            left: "-5%",
            opacity: 0.08,
          }}
        />
        <div
          className="blob blob-2"
          style={{
            width: 300,
            height: 300,
            bottom: "5%",
            right: "-5%",
            opacity: 0.08,
          }}
        />
        <div
          className="blob blob-3"
          style={{
            width: 200,
            height: 200,
            top: "40%",
            left: "40%",
            opacity: 0.06,
          }}
        />
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-3xl font-black text-zinc-100">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-pink-400 gradient-shift">
                {session!.user!.name}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild className="btn-join-confirm hover:!scale-[1.02]">
              <Link href="/rooms/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Room
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {(["PLAYING", "WAITING", "FINISHED"] as const).map((status) => {
            const config = statusGroups[status];
            const Icon = config.icon;
            const count = grouped[status].length;

            return (
              <div
                key={status}
                className={`home-stat-card ${sectionConfig[status].border}`}
              >
                <Icon className="home-stat-icon" />
                <div>
                  <div className="text-xl font-bold text-zinc-100">
                    {count}
                  </div>
                  <div className="text-[0.688rem] text-zinc-500 font-medium uppercase tracking-wide">
                    {config.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasRooms ? (
        <div className="space-y-10">
          {/* Active / In Progress */}
          {grouped.PLAYING.length > 0 && (
            <div>
              <SectionHeader
                icon={<Gamepad2 className="h-5 w-5 text-emerald-400" />}
                title="In Progress"
                badge={`${grouped.PLAYING.length} game${grouped.PLAYING.length > 1 ? "s" : ""} ongoing`}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.PLAYING.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>
          )}

          {/* Waiting */}
          {grouped.WAITING.length > 0 && (
            <div>
              <SectionHeader
                icon={<Clock className="h-5 w-5 text-yellow-400" />}
                title="Waiting Room"
                badge={`${grouped.WAITING.length} room${grouped.WAITING.length > 1 ? "s" : ""} ready`}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.WAITING.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>
          )}

          {/* Finished */}
          {grouped.FINISHED.length > 0 && (
            <div>
              <SectionHeader
                icon={<Trophy className="h-5 w-5 text-zinc-400" />}
                title="Completed"
                badge={`${grouped.FINISHED.length} game${grouped.FINISHED.length > 1 ? "s" : ""} finished`}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grouped.FINISHED.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="home-empty-state">
          <div className="home-empty-icon">
            <Sparkles className="h-12 w-12 text-violet-400" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-200 mb-3">
            No rooms yet
          </h3>
          <p className="text-zinc-400 mb-8 max-w-md">
            Create your first room or join someone else's game
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Button asChild className="btn-primary" size="lg">
              <Link href="/rooms/create">
                <Plus className="mr-2 h-5 w-5" />
                Create Room
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
      <span className="text-xs text-zinc-500 font-medium px-2.5 py-0.5 rounded-full bg-zinc-800/60">
        {badge}
      </span>
    </div>
  );
}
