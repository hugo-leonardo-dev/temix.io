import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockAuth = vi.fn();
const mockFindUnique = vi.fn();
const mockRoundUpdate = vi.fn();
const mockTxUpsert = vi.fn();
const mockTxUpdate = vi.fn();

vi.doMock("@/auth", () => ({ auth: () => mockAuth() }));
vi.doMock("@/lib/prisma", () => ({
  prisma: {
    round: { findUnique: mockFindUnique, update: mockRoundUpdate },
    $transaction: vi.fn((fn) => fn({
      response: { upsert: mockTxUpsert, update: mockTxUpdate },
      round: { findUnique: mockFindUnique },
    })),
  },
}));

const { POST } = await import("@/app/api/rooms/[id]/rounds/[roundId]/submit/route");

describe("POST /api/rooms/[id]/rounds/[roundId]/submit", () => {
  const makeRequest = (body: unknown) =>
    ({ json: vi.fn().mockResolvedValue(body) }) as unknown as NextRequest;
  const makeParams = (id: string, roundId: string) =>
    Promise.resolve({ id, roundId });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits responses successfully", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      id: "round-1", status: "SUBMITTING",
      room: { players: [{ playerId: "user-1" }, { playerId: "user-2" }] },
      responses: [],
    });

    const res = await POST(
      makeRequest({
        responses: [
          { category: "TEXT", content: "My text response", mediaUrl: null },
        ],
      }),
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

  it("returns 400 when round is not in SUBMITTING state", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      id: "round-1", status: "VOTING",
      room: { players: [] }, responses: [],
    });
    const res = await POST(
      makeRequest({ responses: [{ category: "TEXT", content: "test" }] }),
      { params: makeParams("room-1", "round-1") }
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when responses array is missing", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({
      id: "round-1", status: "SUBMITTING",
      room: { players: [] }, responses: [],
    });
    const res = await POST(makeRequest({}), { params: makeParams("room-1", "round-1") });
    expect(res.status).toBe(400);
  });

  it("returns 404 when round does not exist", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ responses: [] }),
      { params: makeParams("room-1", "nope") }
    );
    expect(res.status).toBe(404);
  });
});
