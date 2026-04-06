import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.doMock("@/auth", () => ({ auth: () => mockAuth() }));
vi.doMock("@/lib/prisma", () => ({
  prisma: {
    room: { findUnique: mockFindUnique },
    roomPlayer: { create: mockCreate },
  },
}));

const { POST } = await import("@/app/api/rooms/join/route");

describe("POST /api/rooms/join", () => {
  const makeRequest = (body: unknown) =>
    ({ json: vi.fn().mockResolvedValue(body) }) as unknown as NextRequest;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("joins a room successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", code: "ABC1234", name: "Game Room",
      maxPlayers: 6, status: "WAITING",
      players: [{ playerId: "user-1" }],
    });
    mockCreate.mockResolvedValue({ id: "rp-1" });

    const res = await POST(makeRequest({ code: "abc1234" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({ code: "ABC1234" }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when room not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } });
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(makeRequest({ code: "XYZZZZZ" }));
    expect(res.status).toBe(404);
  });

  it("returns 400 when room is full", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", maxPlayers: 2, status: "WAITING",
      players: [{ playerId: "user-1" }, { playerId: "user-3" }],
    });
    const res = await POST(makeRequest({ code: "FULL123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when game already started", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", maxPlayers: 6, status: "PLAYING",
      players: [{ playerId: "user-1" }],
    });
    const res = await POST(makeRequest({ code: "PLAYING12" }));
    expect(res.status).toBe(400);
  });

  it("returns success when already in room without duplicate entry", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } });
    mockFindUnique.mockResolvedValue({
      id: "room-1", code: "ABC1234", name: "Game Room",
      maxPlayers: 6, status: "WAITING",
      players: [{ playerId: "user-2" }],
    });
    const res = await POST(makeRequest({ code: "abc1234" }));
    expect(res.status).toBe(200);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when no code provided", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-2" } });
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});
