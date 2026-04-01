import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Habilitando Supabase Realtime nas tabelas...");
  
  try {
    // Tentar adicionar as tabelas de forma individual, ignorando se falhar
    const tables = ["rooms", "rounds", "responses", "votes"];
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`alter publication supabase_realtime add table "${table}"`);
        console.log(`Realtime habilitado para tabela: ${table}`);
      } catch (err: any) {
        if (err.message.includes("already in publication") || err.message.includes("duplicate object")) {
           console.log(`Tabela ${table} já está na publication.`);
        } else {
           console.warn(`Aviso na tabela ${table}:`, err.message);
        }
      }
    }
  } catch (error: any) {
    if (error.message.includes("already in publication")) {
      console.log("Tabelas já estavam na publicação do Realtime.");
    } else {
      console.error("Erro ao habilitar realtime:", error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
