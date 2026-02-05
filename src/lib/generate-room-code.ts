import { prisma } from "@/lib/prisma";

function generateCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 4; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

export async function generateUniqueRoomCode(): Promise<string> {
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const code = generateCode();

    const existingRoom = await prisma.room.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existingRoom) {
      return code;
    }

    attempts++;
  }

  return generateCode() + Date.now().toString().slice(-2);
}
