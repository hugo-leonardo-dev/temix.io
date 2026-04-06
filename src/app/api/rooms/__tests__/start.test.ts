import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockThemeCreate = vi.fn();
const mockTransaction = vi.fn();
const mockRoundCreate = vi.fn();

vi.doMock("@/auth", () => ({ auth: () => mockAuth() }));
vi.doMock("@/lib/prisma", () => ({
  prisma: {
    room: { findUnique: mockFindUnique, update: mockUpdate },
    theme: { create: mockThemeCreate },
    round: { create: mockRoundCreate },
    $transaction: mockTransaction,
  },
}));

const { POST } = await import("@/app/api/rooms/[id]/start/route");

describe("POST /api/rooms/[id]/start", () => {
  const makeRequest = (body: unknown) =>
    ({ json: vi.fn().mockResolvedValue(body) }) as unknown as NextRequest;
  const makeParams = (id: string) => Promise.resolve({ id });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts the game and creates themes + first round", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", creatorId: "creator-1", status: "WAITING",
      players: [{ playerId: "creator-1" }, { playerId: "user-2" }],
      totalRounds: 2, allowedCategories: ["TEXT", "IMAGE"], rounds: [],
    });
    mockThemeCreate.mockResolvedValueOnce({ id: "theme-1", title: "Theme 1" })
      .mockResolvedValueOnce({ id: "theme-2", title: "Theme 2" });
    mockTransaction.mockResolvedValue([
      { id: "room-1", status: "PLAYING" },
      { id: "round-1", roundNumber: 1 },
    ]);

    const res = await POST(
      makeRequest({ customThemes: ["Theme 1", "Theme 2"] }),
      { params: makeParams("room-1") }
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.room.status).toBe("PLAYING");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ customThemes: ["Test"] }),
      { params: makeParams("room-1") }
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-creator tries to start", async () => {
    mockAuth.mockResolvedValue({ user: { id: "not-creator" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", creatorId: "creator-1", status: "WAITING",
      players: [], totalRounds: 2,
    });
    const res = await POST(
      makeRequest({ customThemes: ["Test"] }),
      { params: makeParams("room-1") }
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 when room does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ customThemes: ["Test"] }),
      { params: makeParams("nonexistent") }
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 when game already started", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", creatorId: "creator-1", status: "PLAYING",
      players: [], totalRounds: 2, rounds: [{ id: "r1" }],
    });
    const res = await POST(
      makeRequest({ customThemes: ["Test"] }),
      { params: makeParams("room-1") }
    );
    expect(res.status).toBe(400);
  });
});
