import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockFindMany = vi.fn();
const mockRoundUpdate = vi.fn();
const mockRoomUpdate = vi.fn();
const mockTxDeleteMany = vi.fn();
const mockTxCreate = vi.fn();
const mockTxResponseUpdate = vi.fn();

vi.doMock("@/auth", () => ({ auth: () => mockAuth() }));
vi.doMock("@/lib/prisma", () => ({
  prisma: {
    round: { findUnique: mockFindUnique, update: mockRoundUpdate },
    vote: { findMany: mockFindMany },
    room: { update: mockRoomUpdate },
    $transaction: vi.fn((fn) => fn({
      vote: { deleteMany: mockTxDeleteMany, create: mockTxCreate },
      response: { update: mockTxResponseUpdate },
    })),
  },
}));

const { POST } = await import("@/app/api/rooms/[id]/rounds/[roundId]/vote/route");

describe("POST /api/rooms/[id]/rounds/[roundId]/vote", () => {
  const makeRequest = (body: unknown) =>
    ({ json: vi.fn().mockResolvedValue(body) }) as unknown as NextRequest;
  const makeParams = (id: string, roundId: string) =>
    Promise.resolve({ id, roundId });

  const mockRound = {
    id: "round-1",
    status: "VOTING",
    roundNumber: 1,
    room: {
      totalRounds: 3,
      players: [{ playerId: "user-1" }, { playerId: "user-2" }],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTxDeleteMany.mockResolvedValue({ count: 0 });
    mockTxCreate.mockResolvedValue({ id: "vote-1" });
    mockTxResponseUpdate.mockResolvedValue({});
  });

  it("submits votes successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(mockRound);
    mockFindMany.mockResolvedValue([{ voterId: "user-1" }]);

    const res = await POST(
      makeRequest({ votes: [{ responseId: "resp-1", voteType: "UPVOTE" }] }),
      { params: makeParams("room-1", "round-1") }
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({}), { params: makeParams("room-1", "round-1") });
    expect(res.status).toBe(401);
  });

  it("returns 400 when round is not in VOTING state", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ ...mockRound, status: "SUBMITTING" });
    const res = await POST(
      makeRequest({ votes: [] }),
      { params: makeParams("room-1", "round-1") }
    );
    expect(res.status).toBe(400);
  });

  it("returns 403 when voter is not in the room", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      ...mockRound,
      room: { ...mockRound.room, players: [{ playerId: "other-user" }] },
    });
    const res = await POST(
      makeRequest({ votes: [{ responseId: "resp-1", voteType: "UPVOTE" }] }),
      { params: makeParams("room-1", "round-1") }
    );
    expect(res.status).toBe(403);
  });

  it("sets round to FINISHED when all players have voted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(mockRound);
    mockFindMany.mockResolvedValue([
      { voterId: "user-1" },
      { voterId: "user-2" },
    ]);

    const res = await POST(
      makeRequest({ votes: [{ responseId: "resp-1", voteType: "UPVOTE" }] }),
      { params: makeParams("room-1", "round-1") }
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isFinished).toBe(true);
  });
});
