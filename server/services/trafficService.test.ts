import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchTrafficData } from "./trafficService";

// Mock execSync
vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

import { execSync } from "child_process";

describe("trafficService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse valid traffic data correctly", async () => {
    const mockResponse = {
      Data: {
        TotalVisits: 1000000,
        MonthlyVisits: [{ Date: "2026-01-01", Visits: 50000 }],
        BounceRate: 0.45,
        PageViews: 2500000,
        TrafficSources: {
          Direct: 300000,
          Search: 500000,
          Social: 150000,
          Referral: 50000,
          Other: 0,
        },
        Competitors: {
          TopCompetitors: [
            { Name: "competitor1.com", Rank: 1, Icon: "icon1" },
            { Name: "competitor2.com", Rank: 2, Icon: "icon2" },
          ],
          TopReferrers: [
            { Name: "referrer1.com", Rank: 1, Icon: "icon1" },
            { Name: "referrer2.com", Rank: 2, Icon: "icon2" },
          ],
        },
      },
      SnapshotDate: "2026-01-01T00:00:00Z",
    };

    (execSync as any).mockReturnValue(JSON.stringify(mockResponse));

    const result = await fetchTrafficData("google.com");

    expect(result.domain).toBe("google.com");
    expect(result.totalVisits).toBe(1000000);
    expect(result.bounceRate).toBe(0.45);
    expect(result.pageViews).toBe(2500000);
    expect(result.competitors.length).toBe(2);
    expect(result.topReferrers.length).toBe(2);
  });

  it("should clean domain input (remove protocol)", async () => {
    const mockResponse = {
      Data: {
        TotalVisits: 0,
        MonthlyVisits: [],
        TrafficSources: {},
        Competitors: {},
      },
      SnapshotDate: "2026-01-01T00:00:00Z",
    };

    (execSync as any).mockReturnValue(JSON.stringify(mockResponse));

    await fetchTrafficData("https://google.com/");

    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining("google.com"),
      expect.any(Object)
    );
  });

  it("should throw error for invalid domain", async () => {
    await expect(fetchTrafficData("")).rejects.toThrow("Geçersiz domain formatı");
  });

  it("should throw error for domain without extension", async () => {
    (execSync as any).mockReturnValue("{}");

    await expect(fetchTrafficData("localhost")).rejects.toThrow(
      "Lütfen geçerli bir domain adı girin"
    );
  });

  it("should calculate traffic source percentages correctly", async () => {
    const mockResponse = {
      Data: {
        TotalVisits: 1000,
        MonthlyVisits: [],
        BounceRate: 0,
        PageViews: 0,
        TrafficSources: {
          Direct: 500,
          Search: 300,
          Social: 150,
          Referral: 50,
          Other: 0,
        },
        Competitors: {
          TopCompetitors: [],
          TopReferrers: [],
        },
      },
      SnapshotDate: "2026-01-01T00:00:00Z",
    };

    (execSync as any).mockReturnValue(JSON.stringify(mockResponse));

    const result = await fetchTrafficData("example.com");

    expect(result.trafficSources.direct).toBeCloseTo(50, 1);
    expect(result.trafficSources.search).toBeCloseTo(30, 1);
    expect(result.trafficSources.social).toBeCloseTo(15, 1);
    expect(result.trafficSources.referral).toBeCloseTo(5, 1);
  });
});
