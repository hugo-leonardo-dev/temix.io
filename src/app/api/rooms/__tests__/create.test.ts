import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockTransaction = vi.fn();

vi.doMock("@/auth", () => ({ auth: () => mockAuth() }));
vi.doMock("@/lib/prisma", () => ({
  prisma: { $transaction: mockTransaction },
}));
vi.doMock("@/lib/generate-room-code", () => ({
  generateUniqueRoomCode: vi.fn().mockResolvedValue("ABC1234"),
}));

// Import the mocked module once so the mocks are applied
const { POST } = await import("@/app/api/rooms/create/route");

describe("POST /api/rooms/create", () => {
  const makeRequest = (body: unknown) =>
    ({ json: vi.fn().mockResolvedValue(body) }) as unknown as NextRequest;

  const mockRoom = {
    id: "room-1",
    name: "Test Room",
    code: "ABC1234",
    maxPlayers: 6,
    totalRounds: 5,
    upvotesPerPlayer: 3,
    downvotesPerPlayer: 1,
    allowedCategories: ["TEXT", "IMAGE"],
    creatorId: "user-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a room and returns 201", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", name: "Test User", email: "test@test.com" } });
    mockTransaction.mockResolvedValue(mockRoom);

    const res = await POST(
      makeRequest({
        name: "Test Room",
        maxPlayers: 6,
        totalRounds: 5,
        upvotesPerPlayer: 3,
        downvotesPerPlayer: 1,
        allowedCategories: ["TEXT", "IMAGE"],
      })
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.room.code).toBe("ABC1234");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST(makeRequest({ name: "Test Room" }));

    expect(res.status).toBe(401);
  });

  it("returns 400 when room name is too short", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockTransaction.mockResolvedValue(mockRoom);

    const res = await POST(
      makeRequest({
        name: "AB",
        maxPlayers: 6,
        totalRounds: 5,
        upvotesPerPlayer: 3,
        downvotesPerPlayer: 1,
        allowedCategories: ["TEXT"],
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when no categories selected", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockTransaction.mockResolvedValue(mockRoom);

    const res = await POST(
      makeRequest({
        name: "Test Room",
        maxPlayers: 6,
        totalRounds: 5,
        upvotesPerPlayer: 3,
        downvotesPerPlayer: 1,
        allowedCategories: [],
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when maxPlayers is out of range", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockTransaction.mockResolvedValue(mockRoom);

    const res = await POST(
      makeRequest({
        name: "Test Room",
        maxPlayers: 1,
        totalRounds: 5,
        upvotesPerPlayer: 3,
        downvotesPerPlayer: 1,
        allowedCategories: ["TEXT"],
      })
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when totalRounds is below minimum", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockTransaction.mockResolvedValue(mockRoom);

    const res = await POST(
      makeRequest({
        name: "Test Room",
        maxPlayers: 6,
        totalRounds: 2,
        upvotesPerPlayer: 3,
        downvotesPerPlayer: 1,
        allowedCategories: ["TEXT"],
      })
    );

    expect(res.status).toBe(400);
  });
});
