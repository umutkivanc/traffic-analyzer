import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, AlertCircle, TrendingUp, Globe, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeTraffic = trpc.traffic.analyze.useMutation();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      setError("Lütfen bir domain adı girin");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrafficData(null);

    try {
      const result = await analyzeTraffic.mutateAsync({ domain: domain.trim() });
      setTrafficData(result);
      toast.success("Trafik verileri başarıyla yüklendi!");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Bilinmeyen hata oluştu";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Trafik Analiz Aracı</h1>
          </div>
          <p className="text-lg text-slate-600">Web sitesinin ziyaretçi istatistiklerini analiz edin</p>
        </div>

        {/* Search Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Domain Analizi</CardTitle>
            <CardDescription>Analiz etmek istediğiniz web sitesinin domain adını girin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="örn: google.com, github.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analiz Et
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Hata</p>
                <p className="text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {trafficData && (
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">Toplam Ziyaretçi</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatNumber(trafficData.totalVisits)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">Aylık Ziyaretçi</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatNumber(trafficData.monthlyVisits)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">Hemen Çıkma Oranı</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {(trafficData.bounceRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">Global Sıralama</p>
                    <p className="text-3xl font-bold text-purple-600">
                      #{trafficData.globalRank || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Trafik Kaynakları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(trafficData.trafficSources).map(([source, percentage]: [string, any]) => {
                    const sourceNames: Record<string, string> = {
                      direct: "Doğrudan",
                      search: "Arama Motoru",
                      social: "Sosyal Medya",
                      referral: "Referral",
                      paid: "Ücretli Trafik",
                      mail: "E-posta"
                    };
                    
                    if (percentage === 0) return null;
                    
                    return (
                      <div key={source}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">
                            {sourceNames[source] || source}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Countries */}
            {trafficData.topCountries && trafficData.topCountries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    En Çok Ziyaretçi Gelen Ülkeler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trafficData.topCountries.slice(0, 5).map((country: any, idx: number) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-slate-700">
                            {country.code} - {country.name}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">{country.share}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${country.share}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Sayfa Görüntüleme</p>
                      <p className="text-2xl font-bold text-slate-900">{formatNumber(trafficData.pageViews)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Sitede Geçirilen Zaman</p>
                      <p className="text-2xl font-bold text-slate-900">{(trafficData.timeOnSite / 60).toFixed(1)}m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Sayfa Başına Görüntüleme</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {(trafficData.pageViews / trafficData.monthlyVisits || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            {trafficData.monthlyTrend && trafficData.monthlyTrend.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Aylık Trafik Trendi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trafficData.monthlyTrend.slice(0, 6).map((month: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">{new Date(month.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })}</span>
                        <span className="text-sm font-semibold text-slate-900">{formatNumber(month.visits)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Snapshot Info */}
            <div className="text-center text-sm text-slate-500">
              <p>Veri tarihi: {new Date(trafficData.snapshotDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!trafficData && !error && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4 text-lg font-medium">Analiz etmek istediğiniz bir domain girin ve başlayın</p>
              <p className="text-sm text-slate-500">Örneğin: google.com, github.com, wikipedia.org, youtube.com</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
