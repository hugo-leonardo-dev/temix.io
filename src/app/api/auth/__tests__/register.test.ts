import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mockFindUnique = vi.fn();
const mockCreate = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$hash$result$123"),
  },
}));

describe("POST /api/auth/register", () => {
  const makeRequest = (body: unknown) => {
    const req = {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
    return req;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user and returns 201 with valid data", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      id: "abc123",
      name: "Test User",
      email: "test@test.com",
      image: null,
    });

    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(
      makeRequest({ name: "Test User", email: "test@test.com", password: "pass123" })
    );

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user).toHaveProperty("id", "abc123");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: "test@test.com" }) })
    );
  });

  it("returns 400 when email already exists", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing" });

    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(
      makeRequest({ name: "Test", email: "exists@test.com", password: "pass123" })
    );

    expect(res.status).toBe(400);
  });

  it("returns 500 when name is empty", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(
      makeRequest({ name: "", email: "test@test.com", password: "pass123" })
    );

    expect(res.status).toBe(500);
  });

  it("returns 500 when email is invalid", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(
      makeRequest({ name: "Test", email: "not-an-email", password: "pass123" })
    );

    expect(res.status).toBe(500);
  });

  it("returns 500 when password is shorter than 6 characters", async () => {
    const { POST } = await import("@/app/api/auth/register/route");
    const res = await POST(
      makeRequest({ name: "Test", email: "test@test.com", password: "abc" })
    );

    expect(res.status).toBe(500);
  });
});
