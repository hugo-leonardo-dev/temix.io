"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Target,
  TrendingUp,
  Medal,
  Calendar,
  Award,
  ArrowRight,
  Settings,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  user: {
    name: string;
    image: string;
    email: string;
    createdAt: string;
  };
  totalRoomsPlayed: number;
  totalMatchesWon: number;
  winRate: string;
  totalScore: number;
  avgScore: number;
  roomsCreated: number;
  recentMatches: Array<{
    id: string;
    roomId: string;
    score: number;
    joinedAt: string;
    position: number;
    totalPlayers: number;
    room: {
      name: string;
      creator: { name: string; image: string | null };
      _count: { players: number };
      status: string;
    };
  }>;
  categoryStats: Record<string, { count: number; avgUpvotes: number }>;
  favoriteCategory: { name: string; count: number };
  recentMedals: Array<{
    id: string;
    type: string;
    createdAt: string;
    room: { name: string };
  }>;
}

interface DashboardClientProps {
  initialData: DashboardData;
}

const categoryLabels: Record<string, string> = {
  TEXT: "Text",
  IMAGE: "Image",
  PHOTO: "Photo",
  VIDEO: "Video",
  AUDIO: "Audio",
  DRAWING: "Drawing",
};

const categoryColors: Record<string, string> = {
  TEXT: "from-blue-500 to-cyan-500",
  IMAGE: "from-purple-500 to-pink-500",
  PHOTO: "from-amber-500 to-orange-500",
  VIDEO: "from-red-500 to-rose-500",
  AUDIO: "from-green-500 to-emerald-500",
  DRAWING: "from-indigo-500 to-violet-500",
};

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { data: session } = useSession();
  const [data] = useState<DashboardData>(initialData);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getMedalIcon = (type: string) => {
    switch (type) {
      case "FIRST_PLACE":
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case "SECOND_PLACE":
        return <Award className="h-5 w-5 text-zinc-300" />;
      case "THIRD_PLACE":
        return <Medal className="h-5 w-5 text-orange-400" />;
      default:
        return <Medal className="h-5 w-5 text-zinc-500" />;
    }
  };

  const getMedalColor = (type: string) => {
    switch (type) {
      case "FIRST_PLACE":
        return "bg-amber-400/20 text-amber-300 border-amber-400/30";
      case "SECOND_PLACE":
        return "bg-zinc-300/20 text-zinc-300 border-zinc-300/30";
      case "THIRD_PLACE":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  const getPositionBadge = (position: number, total: number) => {
    if (position === 1) {
      return (
        <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30">
          🥇 1st
        </Badge>
      );
    } else if (position === 2) {
      return (
        <Badge className="bg-zinc-300/20 text-zinc-300 border-zinc-300/30">
          🥈 2nd
        </Badge>
      );
    } else if (position === 3) {
      return (
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          🥉 3rd
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="text-xs">
          #{position}
        </Badge>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/rooms/create">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Create Room
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        {/* Profile Section */}
        <div className="flex items-center gap-6 pb-8 border-b border-border/40">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
            {data.user.name?.[0] ?? "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-zinc-100">
              {data.user.name}
            </h2>
            <p className="text-zinc-400 mt-1">
              Member since {formatDate(data.user.createdAt)}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary" className="text-sm">
                {data.favoriteCategory.name !== "N/A"
                  ? `Favorite: ${categoryLabels[data.favoriteCategory.name] || data.favoriteCategory.name}`
                  : "No responses yet"}
              </Badge>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/profile/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Matches"
            value={data.totalRoomsPlayed.toString()}
            icon={<Users className="h-5 w-5" />}
            description="Games participated"
          />
          <StatCard
            title="Matches Won"
            value={data.totalMatchesWon.toString()}
            icon={<Trophy className="h-5 w-5" />}
            description="First place finishes"
          />
          <StatCard
            title="Win Rate"
            value={`${data.winRate}%`}
            icon={<Target className="h-5 w-5" />}
            description="Victory percentage"
          />
          <StatCard
            title="Total Score"
            value={data.totalScore.toLocaleString()}
            icon={<TrendingUp className="h-5 w-5" />}
            description="All-time points"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category Performance */}
          <div className="md:col-span-2 bg-zinc-900/40 border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-zinc-100 mb-4">
              Performance by Category
            </h3>
            {Object.keys(data.categoryStats).length === 0 ? (
              <p className="text-zinc-500 text-sm">
                No responses submitted yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(data.categoryStats).map(([category, stats]) => (
                  <div
                    key={category}
                    className={`bg-gradient-to-br ${categoryColors[category] || "from-zinc-500 to-zinc-600"} p-4 rounded-lg`}
                  >
                    <div className="text-sm font-medium text-white/90 mb-1">
                      {categoryLabels[category] || category}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stats.count}
                    </div>
                    <div className="text-xs text-white/70">
                      {stats.avgUpvotes.toFixed(1)} avg upvotes
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medalhas Recentes */}
          <div className="bg-zinc-900/40 border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">Recent Medals</h3>
              <Medal className="h-5 w-5 text-zinc-500" />
            </div>
            {data.recentMedals.length === 0 ? (
              <p className="text-zinc-500 text-sm">No medals earned yet.</p>
            ) : (
              <div className="space-y-3">
                {data.recentMedals.slice(0, 5).map((medal) => (
                  <div
                    key={medal.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getMedalColor(medal.type)}`}
                  >
                    {getMedalIcon(medal.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {medal.room.name}
                      </p>
                      <p className="text-xs opacity-70">
                        {formatDate(medal.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Match History */}
        <div className="bg-zinc-900/40 border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-100">Match History</h3>
            <Calendar className="h-5 w-5 text-zinc-500" />
          </div>
          {data.recentMatches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 mb-4">
                You haven't played any matches yet.
              </p>
              <Button asChild>
                <Link href="/rooms/create">Create Your First Room</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Room
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">
                      Position
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">
                      Score
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-zinc-400">
                      Players
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentMatches.map((match) => (
                    <tr
                      key={match.id}
                      className="border-b border-border/20 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <Link
                          href={`/rooms/${match.roomId}`}
                          className="text-zinc-100 hover:text-violet-400 font-medium flex items-center gap-2 group"
                        >
                          {match.room.name}
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xs text-zinc-500 mt-1">
                          by {match.room.creator.name}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getPositionBadge(match.position, match.totalPlayers)}
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-zinc-300">
                        {match.score}
                      </td>
                      <td className="py-4 px-4 text-center text-zinc-400">
                        {match.totalPlayers}
                      </td>
                      <td className="py-4 px-4 text-zinc-400 text-sm">
                        {formatDate(match.joinedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="bg-zinc-900/40 border border-border rounded-xl p-5 hover:border-violet-500/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-zinc-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-zinc-100 mt-2">{value}</p>
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        </div>
        <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
