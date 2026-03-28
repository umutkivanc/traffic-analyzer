import https from "https";

export interface TrafficData {
  domain: string;
  totalVisits: number;
  monthlyVisits: number;
  bounceRate: number;
  pageViews: number;
  timeOnSite: number;
  globalRank: number;
  trafficSources: {
    direct: number;
    search: number;
    social: number;
    referral: number;
    paid: number;
    mail: number;
  };
  topCountries: Array<{
    code: string;
    name: string;
    share: number;
  }>;
  monthlyTrend: Array<{
    date: string;
    visits: number;
  }>;
  snapshotDate: string;
  rawResponse?: unknown;
}

/**
 * Fetch traffic data from SimilarWeb API
 */
export async function fetchTrafficData(domain: string): Promise<TrafficData> {
  return new Promise((resolve, reject) => {
    try {
      // Validate domain format
      if (!domain || typeof domain !== "string") {
        throw new Error("Geçersiz domain formatı");
      }

      // Clean domain (remove protocol if present)
      const cleanDomain = domain
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "")
        .toLowerCase();

      if (!cleanDomain.includes(".")) {
        throw new Error("Lütfen geçerli bir domain adı girin (örn: google.com)");
      }

      const payload = JSON.stringify({ q: cleanDomain });

      const options = {
        hostname: "similarweb-real-time-api.p.rapidapi.com",
        port: 443,
        path: "/v1/visitsInfo",
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
          "x-rapidapi-host": process.env.RAPIDAPI_HOST || "",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const apiResponse = JSON.parse(data);
            const trafficData = parseTrafficResponse(apiResponse, cleanDomain);
            resolve(trafficData);
          } catch (error) {
            reject(new Error("API yanıtı işlenemedi"));
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`API çağrısı başarısız: ${error.message}`));
      });

      req.write(payload);
      req.end();
    } catch (error) {
      if (error instanceof Error) {
        reject(new Error(`Trafik verisi alınamadı: ${error.message}`));
      } else {
        reject(new Error("Trafik verisi alınırken bilinmeyen bir hata oluştu"));
      }
    }
  });
}

/**
 * Parse API response and structure it for frontend
 */
function parseTrafficResponse(apiResponse: any, domain: string): TrafficData {
  try {
    // Extract engagement metrics
    const engagements = apiResponse.Engagments || {};
    const monthlyVisits = apiResponse.EstimatedMonthlyVisits || {};
    const globalRank = apiResponse.GlobalRank || {};
    const trafficSources = apiResponse.TrafficSources || {};
    const topCountries = apiResponse.TopCountryShares || [];

    // Get the most recent monthly visit count
    const monthlyVisitEntries = Object.entries(monthlyVisits) as [string, number][];
    const latestMonthlyVisits = monthlyVisitEntries.length > 0 ? monthlyVisitEntries[0][1] : 0;

    // Parse bounce rate (convert from string if needed)
    const bounceRateStr = engagements.BounceRate || "0";
    const bounceRate = typeof bounceRateStr === "string"
      ? parseFloat(bounceRateStr)
      : bounceRateStr;

    // Parse page per visit
    const pagePerVisitStr = engagements.PagePerVisit || "0";
    const pagePerVisit = typeof pagePerVisitStr === "string"
      ? parseFloat(pagePerVisitStr)
      : pagePerVisitStr;

    // Parse time on site (seconds)
    const timeOnSiteStr = engagements.TimeOnSite || "0";
    const timeOnSite = typeof timeOnSiteStr === "string"
      ? parseFloat(timeOnSiteStr)
      : timeOnSiteStr;

    // Parse traffic sources (convert to percentages)
    const trafficSourcesPercentage = {
      direct: Math.round((trafficSources.Direct || 0) * 100),
      search: Math.round((trafficSources.Search || 0) * 100),
      social: Math.round((trafficSources.Social || 0) * 100),
      referral: Math.round((trafficSources.Referrals || 0) * 100),
      paid: Math.round((trafficSources["Paid Referrals"] || 0) * 100),
      mail: Math.round((trafficSources.Mail || 0) * 100),
    };

    // Parse monthly trend
    const monthlyTrend = monthlyVisitEntries.map(([date, visits]) => ({
      date,
      visits: typeof visits === "number" ? visits : 0,
    }));

    // Parse top countries
    const topCountriesList = topCountries.slice(0, 5).map((country: any) => ({
      code: country.CountryCode || "",
      name: country.Country || "",
      share: Math.round((country.Value || 0) * 100),
    }));

    return {
      domain,
      totalVisits: latestMonthlyVisits,
      monthlyVisits: latestMonthlyVisits,
      bounceRate: Math.min(bounceRate, 1), // Normalize to 0-1 range
      pageViews: Math.round(latestMonthlyVisits * pagePerVisit),
      timeOnSite: Math.round(timeOnSite),
      globalRank: globalRank.Rank || 0,
      trafficSources: trafficSourcesPercentage,
      topCountries: topCountriesList,
      monthlyTrend,
      snapshotDate: new Date().toISOString(),
      rawResponse: apiResponse,
    };
  } catch (error) {
    console.error("Error parsing traffic response:", error);
    throw new Error("Trafik verileri işlenirken hata oluştu");
  }
}
