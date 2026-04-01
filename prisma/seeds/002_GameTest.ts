import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de teste de fluxo...");

  // 1. Limpar dados existentes (opcional, mas o --force-reset já faz isso)
  
  // 2. Criar usuários
  const password = await bcrypt.hash("123456", 10);
  
  const hugo = await prisma.user.upsert({
    where: { email: "hugo@temix.io" },
    update: {},
    create: {
      name: "Hugo",
      email: "hugo@temix.io",
      password: password,
      image: "https://ui-avatars.com/api/?name=Hugo&background=7c3aed&color=fff",
    },
  });

  const samela = await prisma.user.upsert({
    where: { email: "samela@temix.io" },
    update: {},
    create: {
      name: "Samela",
      email: "samela@temix.io",
      password: password,
      image: "https://ui-avatars.com/api/?name=Samela&background=db2777&color=fff",
    },
  });

  console.log("✅ Usuários criados: Hugo e Samela");

  // 3. Criar temas do sistema básicos para o jogo funcionar
  const systemThemes = [
    { title: "Qual é o seu prato favorito?", category: "TEXT" },
    { title: "Desenhe um animal engraçado", category: "DRAWING" },
    { title: "Uma imagem que descreve seu humor hoje", category: "IMAGE" },
    { title: "Qual superpoder você queria ter?", category: "TEXT" },
  ];

  for (const theme of systemThemes) {
    await prisma.theme.create({
      data: {
        ...theme,
        isSystem: true,
      } as any,
    });
  }

  console.log(`✅ ${systemThemes.length} temas do sistema criados`);
  console.log("\n🎉 Seed de teste concluído!");
  console.log("\n🔐 Credenciais:");
  console.log("   - Hugo: hugo@temix.io / 123456");
  console.log("   - Samela: samela@temix.io / 123456");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
