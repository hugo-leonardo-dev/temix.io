import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import DashboardClient from "@/components/profile/DashboardClient";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;

  // Buscar dados do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true, email: true, createdAt: true },
  });

  // Se o usuário não for encontrado, retorna null
  if (!user) {
    return null;
  }

  // Busca todas as estatísticas em paralelo
  const [
    totalRoomsPlayed,
    totalMatchesWon,
    totalScore,
    roomsCreated,
    recentMatches,
    categoryStats,
    recentMedals,
  ] = await Promise.all([
    // Número de salas que o usuário participou
    prisma.roomPlayer.count({
      where: { playerId: userId },
    }),

    // Número de vitórias (primeiro lugar)
    prisma.medal.count({
      where: { userId, type: 'FIRST_PLACE' },
    }),

    // Soma total de scores de todas as partidas
    prisma.roomPlayer.aggregate({
      where: { playerId: userId },
      _sum: { score: true },
    }),

    // Número de salas criadas
    prisma.room.count({
      where: { creatorId: userId },
    }),

    // Histórico de partidas recentes (últimas 15)
    prisma.roomPlayer.findMany({
      where: { playerId: userId },
      select: {
        id: true,
        roomId: true,
        score: true,
        joinedAt: true,
        room: {
          select: {
            name: true,
            status: true,
            creator: {
              select: {
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                players: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
      take: 15,
    }),

    // Estatísticas por categoria de conteúdo
    prisma.response.groupBy({
      by: ['category'],
      where: { authorId: userId },
      _count: { category: true },
      _avg: { upvotes: true },
    }),

    // Medalhas recentes
    prisma.medal.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        createdAt: true,
        room: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  // Calcular taxa de vitória
  const winRate =
    totalRoomsPlayed > 0 ? ((totalMatchesWon / totalRoomsPlayed) * 100).toFixed(1) : '0.0';

  // Calcular média de pontos
  const avgScore =
    totalRoomsPlayed > 0 ? Math.round((totalScore._sum.score || 0) / totalRoomsPlayed) : 0;

  // Processar estatísticas por categoria para exibição
  const categoryMap: Record<string, { count: number; avgUpvotes: number }> = {};
  categoryStats.forEach((stat) => {
    categoryMap[stat.category] = {
      count: stat._count.category,
      avgUpvotes: stat._avg.upvotes || 0,
    };
  });

  // Encontrar categoria favorita (mais submissões)
  let favoriteCategory = { name: 'N/A', count: 0 };
  Object.entries(categoryMap).forEach(([category, data]) => {
    if (data.count > favoriteCategory.count) {
      favoriteCategory = { name: category, count: data.count };
    }
  });

  // Determinar posição em cada partida do histórico
  const matchesWithPosition = await Promise.all(
    recentMatches.map(async (match) => {
      const allPlayers = await prisma.roomPlayer.findMany({
        where: { roomId: match.roomId },
        orderBy: { score: 'desc' },
      });
      const position = allPlayers.findIndex((p) => p.playerId === userId) + 1;
      const totalPlayers = allPlayers.length;
      return {
        ...match,
        joinedAt: match.joinedAt.toISOString(),
        position,
        totalPlayers,
      };
    })
  );

  const data = {
    user: {
      name: user.name || "User",
      image: user.image || "",
      email: user.email || "",
      createdAt: user.createdAt.toISOString(),
    },
    totalRoomsPlayed,
    totalMatchesWon,
    winRate,
    totalScore: totalScore._sum.score || 0,
    avgScore,
    roomsCreated,
    recentMatches: matchesWithPosition,
    categoryStats: categoryMap,
    favoriteCategory,
    recentMedals: recentMedals.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  };

  return <DashboardClient initialData={data} />;
}
