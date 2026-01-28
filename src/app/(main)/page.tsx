// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  // Buscar dados do seed
  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.room.count(),
    prisma.theme.count(),
    prisma.response.count(),
  ]);

  const [totalUsers, totalRooms, totalThemes, totalResponses] = stats;

  // Buscar dados detalhados
  const users = await prisma.user.findMany({
    take: 4,
    orderBy: { points: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      points: true,
    },
  });

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

  const themes = await prisma.theme.findMany({
    where: { isSystem: true },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
    },
  });

  const recentResponses = await prisma.response.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, image: true },
      },
      round: {
        include: {
          theme: {
            select: { title: true },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
          🎮 Temix.io
        </h1>
      </header>

      {/* Stats Cards */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <StatCard emoji="👥" value={totalUsers} label="Jogadores" />
          <StatCard emoji="🏠" value={totalRooms} label="Salas" />
          <StatCard emoji="🎯" value={totalThemes} label="Temas" />
          <StatCard emoji="💬" value={totalResponses} label="Respostas" />
        </div>
      </section>

      {/* Users Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🏆 Top Jogadores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {users.map((user, index) => (
              <UserCard key={user.id} user={user} rank={index + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🎮 Salas Disponíveis
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            🎯 Temas Populares
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Responses */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            💬 Respostas Recentes
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recentResponses.map((response) => (
              <ResponseCard key={response.id} response={response} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-purple-200">
        <p className="text-lg">
          Feito com 💜 por <strong>Temix Team</strong>
        </p>
        <p className="text-sm mt-2 opacity-75">
          Dados do seed • {new Date().toLocaleDateString("pt-BR")}
        </p>
      </footer>
    </div>
  );
}

// Components
function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center hover:scale-105 transition-transform">
      <div className="text-4xl mb-2">{emoji}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-purple-100 text-sm font-medium">{label}</div>
    </div>
  );
}

function UserCard({ user, rank }: { user: any; rank: number }) {
  const medals = ["🥇", "🥈", "🥉", "🎖️"];
  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 hover:bg-white/30 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{medals[rank - 1]}</span>
        <img
          src={user.image || `https://ui-avatars.com/api/?name=${user.name}`}
          alt={user.name}
          className="w-12 h-12 rounded-full border-2 border-purple-300"
        />
      </div>
      <h3 className="font-bold text-white text-lg">{user.name}</h3>
      <p className="text-purple-200 text-sm truncate">{user.email}</p>
      <div className="mt-2 bg-purple-500/50 rounded-full px-3 py-1 inline-block">
        <span className="text-white font-bold">{user.points} pts</span>
      </div>
    </div>
  );
}

function RoomCard({ room }: { room: any }) {
  const statusColors = {
    WAITING: "bg-yellow-500",
    PLAYING: "bg-green-500",
    FINISHED: "bg-gray-500",
  };

  const statusLabels = {
    WAITING: "⏳ Aguardando",
    PLAYING: "🎮 Jogando",
    FINISHED: "✅ Finalizada",
  };

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 hover:bg-white/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-xl mb-1">{room.name}</h3>
          <p className="text-purple-200 text-sm font-mono">
            Código: {room.code}
          </p>
        </div>
        <span
          className={`${statusColors[room.status]} text-white text-xs px-3 py-1 rounded-full font-bold`}
        >
          {statusLabels[room.status]}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <img
          src={
            room.creator.image ||
            `https://ui-avatars.com/api/?name=${room.creator.name}`
          }
          alt={room.creator.name}
          className="w-8 h-8 rounded-full border-2 border-purple-300"
        />
        <span className="text-purple-100 text-sm">
          por <strong>{room.creator.name}</strong>
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-purple-200">
          👥 {room._count.players}/{room.maxPlayers} jogadores
        </span>
        <span className="text-purple-200">🎯 {room.totalRounds} rodadas</span>
      </div>
    </div>
  );
}

function ThemeCard({ theme }: { theme: any }) {
  const categoryEmojis: Record<string, string> = {
    TEXT: "📝",
    IMAGE: "🖼️",
    PHOTO: "📸",
    VIDEO: "🎥",
    AUDIO: "🎵",
    DRAWING: "🎨",
  };

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 hover:bg-white/30 transition-all">
      <div className="text-3xl mb-2">{categoryEmojis[theme.category]}</div>
      <h4 className="font-bold text-white text-lg mb-1">{theme.title}</h4>
      <span className="text-purple-200 text-xs uppercase font-medium">
        {theme.category}
      </span>
    </div>
  );
}

function ResponseCard({ response }: { response: any }) {
  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 hover:bg-white/30 transition-all">
      {response.mediaUrl && (
        <img
          src={response.mediaUrl}
          alt="Response"
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}
      <div className="flex items-center gap-2 mb-2">
        <img
          src={
            response.author.image ||
            `https://ui-avatars.com/api/?name=${response.author.name}`
          }
          alt={response.author.name}
          className="w-8 h-8 rounded-full border-2 border-purple-300"
        />
        <div>
          <p className="text-white font-bold text-sm">{response.author.name}</p>
          <p className="text-purple-200 text-xs">
            {response.round.theme.title}
          </p>
        </div>
      </div>
      <p className="text-white text-sm line-clamp-2">{response.content}</p>
      <div className="flex gap-3 mt-3 text-xs">
        <span className="text-green-300">👍 {response.upvotes}</span>
        <span className="text-red-300">👎 {response.downvotes}</span>
      </div>
    </div>
  );
}
