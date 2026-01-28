// prisma/seed.ts
import { PrismaClient, Category, VoteType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 1. ✅ Criar usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Hugo Silva",
        email: "hugo@temix.io",
        password: await bcrypt.hash("123456", 10),
        image: "https://i.pravatar.cc/150?img=1",
        points: 0,
      },
    }),
    prisma.user.create({
      data: {
        name: "Maria Santos",
        email: "maria@temix.io",
        password: await bcrypt.hash("123456", 10),
        image: "https://i.pravatar.cc/150?img=2",
        points: 0,
      },
    }),
    prisma.user.create({
      data: {
        name: "João Costa",
        email: "joao@temix.io",
        password: await bcrypt.hash("123456", 10),
        image: "https://i.pravatar.cc/150?img=3",
        points: 0,
      },
    }),
    prisma.user.create({
      data: {
        name: "Ana Lima",
        email: "ana@temix.io",
        password: await bcrypt.hash("123456", 10),
        image: "https://i.pravatar.cc/150?img=4",
        points: 0,
      },
    }),
  ]);

  console.log(`✅ Criados ${users.length} usuários`);

  // 2. ✅ Criar temas do sistema
  const systemThemes = await Promise.all([
    prisma.theme.create({
      data: {
        title: "Algo que te lembre infância",
        category: "IMAGE",
        isSystem: true,
      },
    }),
    prisma.theme.create({
      data: {
        title: "Seu animal favorito",
        category: "IMAGE",
        isSystem: true,
      },
    }),
    prisma.theme.create({
      data: {
        title: "Melhor meme do ano",
        category: "IMAGE",
        isSystem: true,
      },
    }),
    prisma.theme.create({
      data: {
        title: "Descreva seu dia em 3 palavras",
        category: "TEXT",
        isSystem: true,
      },
    }),
    prisma.theme.create({
      data: {
        title: "Desenhe sua comida favorita",
        category: "DRAWING",
        isSystem: true,
      },
    }),
  ]);

  console.log(`✅ Criados ${systemThemes.length} temas do sistema`);

  // 3. ✅ Criar uma sala de exemplo
  const room = await prisma.room.create({
    data: {
      name: "Sala de Teste",
      code: "TEST123",
      maxPlayers: 6,
      upvotesPerPlayer: 3,
      downvotesPerPlayer: 1,
      allowedCategories: ["IMAGE", "TEXT", "DRAWING"],
      totalRounds: 3,
      status: "PLAYING",
      creatorId: users[0].id,

      // Adiciona jogadores
      players: {
        create: users.map((user) => ({
          playerId: user.id,
          score: 0,
        })),
      },

      // Cria temas customizados para esta sala
      themes: {
        create: [
          {
            title: "Foto mais embaraçosa",
            category: "PHOTO",
            isSystem: false,
          },
          {
            title: "Seu lugar favorito",
            category: "IMAGE",
            isSystem: false,
          },
          {
            title: "Conte uma piada",
            category: "TEXT",
            isSystem: false,
          },
        ],
      },
    },
    include: {
      themes: true,
      players: true,
    },
  });

  console.log(`✅ Criada sala: ${room.name} (código: ${room.code})`);

  // 4. ✅ Criar rodadas com respostas e votos
  const round1 = await prisma.round.create({
    data: {
      roundNumber: 1,
      status: "FINISHED",
      startedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
      endedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min atrás
      roomId: room.id,
      themeId: room.themes[0].id,

      responses: {
        create: [
          {
            content: "Minha bike velha de quando era criança",
            mediaUrl:
              "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
            category: "IMAGE",
            authorId: users[0].id,
            upvotes: 5,
            downvotes: 1,
          },
          {
            content: "Foto da escola onde estudei",
            mediaUrl:
              "https://images.unsplash.com/photo-1580582932707-520aed937b7b",
            category: "IMAGE",
            authorId: users[1].id,
            upvotes: 3,
            downvotes: 0,
          },
          {
            content: "Meu cachorro de infância",
            mediaUrl:
              "https://images.unsplash.com/photo-1587300003388-59208cc962cb",
            category: "IMAGE",
            authorId: users[2].id,
            upvotes: 2,
            downvotes: 2,
          },
          {
            content: "Parquinho onde brincava",
            mediaUrl:
              "https://images.unsplash.com/photo-1560969184-10fe8719e047",
            category: "IMAGE",
            authorId: users[3].id,
            upvotes: 1,
            downvotes: 0,
          },
        ],
      },
    },
    include: {
      responses: true,
    },
  });

  // Criar votos (CORRIGIDO)
  const response1 = round1.responses[0]; // Hugo (5 up, 1 down)
  const response2 = round1.responses[1]; // Maria (3 up, 0 down)
  const response3 = round1.responses[2]; // João (2 up, 2 down)
  const response4 = round1.responses[3]; // Ana (1 up, 0 down)

  // ✅ VOTOS CORRIGIDOS - cada usuário vota UMA VEZ por resposta
  await prisma.vote.createMany({
    data: [
      // Votos na resposta 1 (Hugo): 5 ups, 1 down
      { type: "UPVOTE", responseId: response1.id, voterId: users[1].id }, // Maria
      { type: "UPVOTE", responseId: response1.id, voterId: users[2].id }, // João
      { type: "UPVOTE", responseId: response1.id, voterId: users[3].id }, // Ana

      // Votos na resposta 2 (Maria): 3 ups
      { type: "UPVOTE", responseId: response2.id, voterId: users[0].id }, // Hugo
      { type: "UPVOTE", responseId: response2.id, voterId: users[2].id }, // João
      { type: "UPVOTE", responseId: response2.id, voterId: users[3].id }, // Ana

      // Votos na resposta 3 (João): 2 ups, 2 downs
      { type: "UPVOTE", responseId: response3.id, voterId: users[0].id }, // Hugo
      { type: "UPVOTE", responseId: response3.id, voterId: users[1].id }, // Maria
      { type: "DOWNVOTE", responseId: response3.id, voterId: users[3].id }, // Ana

      // Votos na resposta 4 (Ana): 1 up
      { type: "UPVOTE", responseId: response4.id, voterId: users[0].id }, // Hugo
    ],
  });
  console.log(`✅ Criada rodada 1 com ${round1.responses.length} respostas`);

  // 5. ✅ Criar rodada atual (em votação)
  const round2 = await prisma.round.create({
    data: {
      roundNumber: 2,
      status: "VOTING",
      startedAt: new Date(),
      roomId: room.id,
      themeId: room.themes[1].id,

      responses: {
        create: users.map((user, i) => ({
          content: `Resposta ${i + 1} para o tema 2`,
          category: "TEXT",
          authorId: user.id,
          upvotes: 0,
          downvotes: 0,
        })),
      },
    },
  });

  console.log(`✅ Criada rodada 2 (em votação)`);

  // 6. ✅ Atualizar scores dos jogadores
  await prisma.roomPlayer.update({
    where: { id: room.players[0].id },
    data: { score: 4 }, // Hugo (5 up - 1 down)
  });

  await prisma.roomPlayer.update({
    where: { id: room.players[1].id },
    data: { score: 3 }, // Maria (3 up - 0 down)
  });

  await prisma.roomPlayer.update({
    where: { id: room.players[2].id },
    data: { score: 0 }, // João (2 up - 2 down)
  });

  await prisma.roomPlayer.update({
    where: { id: room.players[3].id },
    data: { score: 1 }, // Ana (1 up - 0 down)
  });

  console.log("✅ Scores atualizados");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📊 Dados criados:");
  console.log(`   - ${users.length} usuários`);
  console.log(`   - ${systemThemes.length} temas do sistema`);
  console.log(`   - 1 sala (código: ${room.code})`);
  console.log(`   - 2 rodadas (1 finalizada, 1 em votação)`);
  console.log("\n🔐 Login de teste:");
  console.log("   Email: hugo@temix.io");
  console.log("   Senha: 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
