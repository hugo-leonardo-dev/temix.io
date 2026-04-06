import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    room: {
      findUnique: mockFindUnique,
    },
  },
}));

const { generateUniqueRoomCode } = await import("@/lib/generate-room-code");

describe("generateUniqueRoomCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a code with 3 uppercase letters + 4 digits when no collision", async () => {
    mockFindUnique.mockResolvedValue(null);

    const code = await generateUniqueRoomCode();

    expect(code).toMatch(/^[A-Z]{3}[0-9]{4}$/);
    expect(code.length).toBe(7);
    expect(mockFindUnique).toHaveBeenCalled();
  });

  it("retries when a code collision is found and returns unique code on second attempt", async () => {
    mockFindUnique
      .mockResolvedValueOnce({ id: "collision" })
      .mockResolvedValue(null);

    const code = await generateUniqueRoomCode();

    expect(code).toBeDefined();
    expect(mockFindUnique).toHaveBeenCalledTimes(2);
  });

  it("stops after maxAttempts (10) and returns a fallback code", async () => {
    mockFindUnique.mockResolvedValue({ id: "always-exists" });

    const code = await generateUniqueRoomCode();

    expect(mockFindUnique).toHaveBeenCalledTimes(10);
    expect(code.length).toBeGreaterThan(7);
  });
});
