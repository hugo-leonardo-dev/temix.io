import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockThemeFindMany = vi.fn();
const mockRoundCreate = vi.fn();

vi.doMock("@/auth", () => ({ auth: () => mockAuth() }));
vi.doMock("@/lib/prisma", () => ({
  prisma: {
    room: { findUnique: mockFindUnique, update: mockUpdate },
    theme: { findMany: mockThemeFindMany },
    round: { create: mockRoundCreate },
  },
}));

const { POST } = await import("@/app/api/rooms/[id]/rounds/next/route");

describe("POST /api/rooms/[id]/rounds/next", () => {
  const makeRequest = (body: unknown) =>
    ({ json: vi.fn().mockResolvedValue(body) }) as unknown as NextRequest;
  const makeParams = (id: string) => Promise.resolve({ id });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates next round when rounds remain", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", creatorId: "creator-1", status: "PLAYING",
      totalRounds: 3, rounds: [{ id: "round-1", roundNumber: 1 }],
    });
    mockThemeFindMany.mockResolvedValue([
      { id: "theme-1" }, { id: "theme-2" }, { id: "theme-3" },
    ]);
    mockRoundCreate.mockResolvedValue({ id: "round-2", roundNumber: 2, status: "SUBMITTING" });

    const res = await POST(makeRequest({}), { params: makeParams("room-1") });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("sets room to FINISHED when all rounds played", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", creatorId: "creator-1", status: "PLAYING",
      totalRounds: 2,
      rounds: [
        { id: "round-1", roundNumber: 1 },
        { id: "round-2", roundNumber: 2 },
      ],
    });
    mockUpdate.mockResolvedValue({ id: "room-1", status: "FINISHED" });

    const res = await POST(makeRequest({}), { params: makeParams("room-1") });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isGameFinished).toBe(true);
  });

  it("returns 403 when non-creator requests next round", async () => {
    mockAuth.mockResolvedValue({ user: { id: "not-creator" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", creatorId: "creator-1", status: "PLAYING",
      totalRounds: 3, rounds: [{ id: "round-1" }],
    });
    const res = await POST(makeRequest({}), { params: makeParams("room-1") });
    expect(res.status).toBe(403);
  });

  it("returns 404 when room does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(makeRequest({}), { params: makeParams("nope") });
    expect(res.status).toBe(404);
  });

  it("returns 400 when no theme configured for next round", async () => {
    mockAuth.mockResolvedValue({ user: { id: "creator-1" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", creatorId: "creator-1", status: "PLAYING",
      totalRounds: 3, rounds: [{ id: "round-1", roundNumber: 1 }],
    });
    mockThemeFindMany.mockResolvedValue([]);
    const res = await POST(makeRequest({}), { params: makeParams("room-1") });
    expect(res.status).toBe(400);
  });
});
