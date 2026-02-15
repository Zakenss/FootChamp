import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, LogOut, Edit2, Save, X, ChevronUp, ChevronDown } from "lucide-react";
import type { GameMarrakech, GameToulouse } from "@shared/schema";

type Game = (GameMarrakech | GameToulouse) & { duration?: string };

export default function Admin() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Game>>({});
  const [selectedCity, setSelectedCity] = useState<"marrakech" | "toulouse">("marrakech");

  const [newGame, setNewGame] = useState({
    venue: "",
    date: "",
    time: "",
    matchType: "7v7",
    price: 40,
    duration: "1h",
    status: "available"
  });

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games", selectedCity],
    queryFn: async () => {
      const res = await fetch(`/api/games/${selectedCity}`);
      return res.json();
    },
    enabled: isLoggedIn,
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/login", { username, password });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("admin-token", data.token);
        setIsLoggedIn(true);
        toast({ title: "Connexion réussie" });
      }
    },
    onError: () => {
      toast({ title: "Identifiants incorrects", variant: "destructive" });
    }
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("admin-token");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const createGameMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("admin-token");
      const gameData = selectedCity === "toulouse" 
        ? newGame 
        : { venue: newGame.venue, date: newGame.date, time: newGame.time, matchType: newGame.matchType, price: newGame.price, status: newGame.status };
      const res = await fetch(`/api/games/${selectedCity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(gameData)
      });
      if (!res.ok) throw new Error("Failed to create game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", selectedCity] });
      setNewGame({ venue: "", date: "", time: "", matchType: "7v7", price: 40, duration: "1h", status: "available" });
      toast({ title: "Match ajouté" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'ajout", variant: "destructive" });
    }
  });

  const updateGameMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Game> }) => {
      const token = localStorage.getItem("admin-token");
      const res = await fetch(`/api/games/${selectedCity}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", selectedCity] });
      setEditingId(null);
      setEditForm({});
      toast({ title: "Match modifié" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    }
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("admin-token");
      const res = await fetch(`/api/games/${selectedCity}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", selectedCity] });
      toast({ title: "Match supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    setIsLoggedIn(false);
  };

  const startEdit = (game: Game) => {
    setEditingId(game.id);
    setEditForm({
      venue: game.venue,
      date: game.date,
      time: game.time,
      matchType: game.matchType,
      price: game.price,
      status: game.status
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId) {
      updateGameMutation.mutate({ id: editingId, data: editForm });
    }
  };

  const moveGame = async (gameId: number, direction: "up" | "down") => {
    const currentIndex = games.findIndex(g => g.id === gameId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= games.length) return;
    
    const token = localStorage.getItem("admin-token");
    const currentGame = games[currentIndex];
    const swapGame = games[newIndex];
    
    try {
      await Promise.all([
        fetch(`/api/games/${selectedCity}/${currentGame.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ displayOrder: newIndex })
        }),
        fetch(`/api/games/${selectedCity}/${swapGame.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ displayOrder: currentIndex })
        })
      ]);
      queryClient.invalidateQueries({ queryKey: ["/api/games", selectedCity] });
    } catch {
      toast({ title: "Erreur lors du déplacement", variant: "destructive" });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-emerald-200 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-t-lg">
            <CardTitle className="text-center text-2xl text-white">Admin FootChamp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-admin-username"
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-admin-password"
              />
              <Button
                className="w-full"
                onClick={() => loginMutation.mutate()}
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? "Connexion..." : "Se connecter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-emerald-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-emerald-500 to-cyan-500 p-4 rounded-xl shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Matchs</h1>
          <Button variant="secondary" className="bg-white/90 hover:bg-white text-emerald-700 font-semibold" onClick={handleLogout} data-testid="button-admin-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            className={selectedCity === "marrakech" ? "bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md" : "bg-white border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold"}
            onClick={() => setSelectedCity("marrakech")}
            data-testid="button-city-marrakech"
          >
            Marrakech
          </Button>
          <Button
            className={selectedCity === "toulouse" ? "bg-pink-500 hover:bg-pink-600 text-white font-bold shadow-md" : "bg-white border-2 border-pink-300 text-pink-600 hover:bg-pink-50 font-semibold"}
            onClick={() => setSelectedCity("toulouse")}
            data-testid="button-city-toulouse"
          >
            Toulouse
          </Button>
        </div>

        <Card className="mb-8 border-2 border-emerald-200 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-emerald-100 to-cyan-100 border-b border-emerald-200">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Plus className="w-5 h-5" />
              Ajouter un match - {selectedCity === "marrakech" ? "Marrakech" : "Toulouse"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="Lieu (ex: Kick off Marrakech)"
                value={newGame.venue}
                onChange={(e) => setNewGame({ ...newGame, venue: e.target.value })}
                data-testid="input-new-venue"
              />
              <Input
                placeholder="Date (ex: 2026-02-09)"
                value={newGame.date}
                onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                data-testid="input-new-date"
              />
              <Input
                placeholder="Heure (ex: 21:30)"
                value={newGame.time}
                onChange={(e) => setNewGame({ ...newGame, time: e.target.value })}
                data-testid="input-new-time"
              />
              <Select
                value={newGame.matchType}
                onValueChange={(value) => setNewGame({ ...newGame, matchType: value })}
              >
                <SelectTrigger data-testid="select-new-matchtype">
                  <SelectValue placeholder="Type de match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5v5">5v5</SelectItem>
                  <SelectItem value="7v7">7v7</SelectItem>
                  <SelectItem value="11v11">11v11</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={selectedCity === "toulouse" ? "Prix (€)" : "Prix (Dhs)"}
                value={newGame.price}
                onChange={(e) => setNewGame({ ...newGame, price: parseInt(e.target.value) || 0 })}
                data-testid="input-new-price"
              />
              {selectedCity === "toulouse" && (
                <Select
                  value={newGame.duration}
                  onValueChange={(value) => setNewGame({ ...newGame, duration: value })}
                >
                  <SelectTrigger data-testid="select-new-duration">
                    <SelectValue placeholder="Durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1h</SelectItem>
                    <SelectItem value="1h30">1h30</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select
                value={newGame.status}
                onValueChange={(value) => setNewGame({ ...newGame, status: value })}
              >
                <SelectTrigger data-testid="select-new-status">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="full">Complet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="mt-4 w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md"
              onClick={() => createGameMutation.mutate()}
              disabled={createGameMutation.isPending || !newGame.venue || !newGame.date || !newGame.time}
              data-testid="button-add-game"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createGameMutation.isPending ? "Ajout..." : "Ajouter le match"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-cyan-200 shadow-lg bg-white">
          <CardHeader className="bg-gradient-to-r from-cyan-100 to-emerald-100 border-b border-cyan-200">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-cyan-800">Matchs programmés ({games.length})</CardTitle>
              <span className="text-sm text-cyan-600 font-medium">Utilisez les flèches pour réordonner</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <p className="text-emerald-600 font-medium">Chargement...</p>
            ) : games.length === 0 ? (
              <p className="text-gray-500 font-medium">Aucun match programmé</p>
            ) : (
              <div className="space-y-4">
                {games.map((game, index) => (
                  <div
                    key={game.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-lg gap-4 shadow-sm"
                    data-testid={`game-card-${game.id}`}
                  >
                    {editingId === game.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-2">
                        <Input
                          value={editForm.venue || ""}
                          onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                          placeholder="Lieu"
                          data-testid="input-edit-venue"
                        />
                        <Input
                          value={editForm.date || ""}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          placeholder="Date"
                          data-testid="input-edit-date"
                        />
                        <Input
                          value={editForm.time || ""}
                          onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                          placeholder="Heure"
                          data-testid="input-edit-time"
                        />
                        <Select
                          value={editForm.matchType || "7v7"}
                          onValueChange={(value) => setEditForm({ ...editForm, matchType: value })}
                        >
                          <SelectTrigger data-testid="select-edit-matchtype">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5v5">5v5</SelectItem>
                            <SelectItem value="7v7">7v7</SelectItem>
                            <SelectItem value="11v11">11v11</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={editForm.price || 0}
                          onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                          placeholder="Prix"
                          data-testid="input-edit-price"
                        />
                        {selectedCity === "toulouse" && (
                          <Select
                            value={editForm.duration || "1h"}
                            onValueChange={(value) => setEditForm({ ...editForm, duration: value })}
                          >
                            <SelectTrigger data-testid="select-edit-duration">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1h">1h</SelectItem>
                              <SelectItem value="1h30">1h30</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <Select
                          value={editForm.status || "available"}
                          onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                        >
                          <SelectTrigger data-testid="select-edit-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="full">Complet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-bold text-gray-800">{game.venue}</span>
                          <span className="text-gray-600 font-medium">{game.date}</span>
                          <span className="text-gray-600 font-medium">{game.time}</span>
                          <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-sm font-bold shadow-sm">{game.matchType}</span>
                          <span className="font-bold text-orange-600">{game.price} {selectedCity === "toulouse" ? "€" : "Dhs"}</span>
                          {selectedCity === "toulouse" && game.duration && (
                            <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-sm font-bold shadow-sm">{game.duration}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-sm font-bold shadow-sm ${game.status === "available" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            {game.status === "available" ? "Disponible" : "Complet"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {editingId === game.id ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                            onClick={saveEdit}
                            disabled={updateGameMutation.isPending}
                            data-testid="button-save-edit"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold" onClick={cancelEdit} data-testid="button-cancel-edit">
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700"
                            onClick={() => moveGame(game.id, "up")}
                            disabled={index === 0}
                            data-testid={`button-move-up-${game.id}`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            className="bg-cyan-100 hover:bg-cyan-200 text-cyan-700"
                            onClick={() => moveGame(game.id, "down")}
                            disabled={index === games.length - 1}
                            data-testid={`button-move-down-${game.id}`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white font-bold" onClick={() => startEdit(game)} data-testid={`button-edit-${game.id}`}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white font-bold"
                            onClick={() => deleteGameMutation.mutate(game.id)}
                            disabled={deleteGameMutation.isPending}
                            data-testid={`button-delete-${game.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
