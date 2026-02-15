import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Users, UserCheck, TrendingUp, MapPin, Moon } from "lucide-react";

interface PageStats {
  totalVisits: number;
  uniqueVisitors: number;
  leadsCount: number;
  conversionRate: number;
  cityCounts: Record<string, number>;
}

export default function Stats() {
  const { data: toulouseStats, isLoading: loadingToulouse } = useQuery<PageStats>({
    queryKey: ["/api/stats/toulouse"],
  });

  const { data: marrakechStats, isLoading: loadingMarrakech } = useQuery<PageStats>({
    queryKey: ["/api/stats/marrakech"],
  });

  const { data: ramadanStats, isLoading: loadingRamadan } = useQuery<PageStats>({
    queryKey: ["/api/stats/ramadan"],
  });

  const sortedCities = (cityCounts: Record<string, number>) => {
    return Object.entries(cityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Statistiques des visiteurs
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6" data-testid="card-toulouse-stats">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2" data-testid="heading-toulouse">
              <MapPin className="w-5 h-5 text-primary" />
              Toulouse
            </h2>
            
            {loadingToulouse ? (
              <div className="animate-pulse space-y-4" data-testid="loading-toulouse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ) : toulouseStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Visites totales</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-toulouse-visits">
                      {toulouseStats.totalVisits}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Leads</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-toulouse-leads">
                      {toulouseStats.leadsCount}
                    </p>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Taux de conversion</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-toulouse-conversion">
                    {toulouseStats.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {toulouseStats.totalVisits - toulouseStats.leadsCount} visiteurs n'ont pas rempli le formulaire
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Villes des visiteurs
                  </h3>
                  {sortedCities(toulouseStats.cityCounts).length > 0 ? (
                    <div className="space-y-2">
                      {sortedCities(toulouseStats.cityCounts).map(([city, count]) => (
                        <div key={city} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{city}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pas encore de données de localisation
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="p-6" data-testid="card-marrakech-stats">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2" data-testid="heading-marrakech">
              <MapPin className="w-5 h-5 text-primary" />
              Marrakech
            </h2>
            
            {loadingMarrakech ? (
              <div className="animate-pulse space-y-4" data-testid="loading-marrakech">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ) : marrakechStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Visites totales</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-marrakech-visits">
                      {marrakechStats.totalVisits}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-sm font-medium">Leads</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-marrakech-leads">
                      {marrakechStats.leadsCount}
                    </p>
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Taux de conversion</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-marrakech-conversion">
                    {marrakechStats.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {marrakechStats.totalVisits - marrakechStats.leadsCount} visiteurs n'ont pas rempli le formulaire
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Villes des visiteurs
                  </h3>
                  {sortedCities(marrakechStats.cityCounts).length > 0 ? (
                    <div className="space-y-2">
                      {sortedCities(marrakechStats.cityCounts).map(([city, count]) => (
                        <div key={city} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{city}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pas encore de données de localisation
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </Card>
        </div>

        <Card className="p-6 mt-6" data-testid="card-ramadan-stats">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2" data-testid="heading-ramadan">
            <Moon className="w-5 h-5 text-emerald-500" />
            Tournoi Ramadan
          </h2>
          
          {loadingRamadan ? (
            <div className="animate-pulse space-y-4" data-testid="loading-ramadan">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ) : ramadanStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Visites totales</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-ramadan-visits">
                    {ramadanStats.totalVisits}
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">Inscriptions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-ramadan-leads">
                    {ramadanStats.leadsCount}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Taux de conversion</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-ramadan-conversion">
                    {ramadanStats.conversionRate}%
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Visiteurs uniques</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-ramadan-unique">
                    {ramadanStats.uniqueVisitors}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Villes des visiteurs
                </h3>
                {sortedCities(ramadanStats.cityCounts).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {sortedCities(ramadanStats.cityCounts).map(([city, count]) => (
                      <div key={city} className="flex justify-between items-center text-sm bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                        <span className="text-gray-600 dark:text-gray-400">{city}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pas encore de données de localisation
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
