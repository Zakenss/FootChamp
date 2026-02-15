import { LeadForm } from "@/components/LeadForm";
import { 
  Users, 
  CalendarCheck2, 
  ShieldCheck, 
  Trophy, 
  Clock, 
  MapPin,
  Globe,
  Check,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { GameMarrakech, GameToulouse } from "@shared/schema";

type Game = (GameMarrakech | GameToulouse) & { duration?: string };

export default function Home({ city }: { city?: string }) {
  const isMarrakech = city === "Marrakech";
  const isToulouse = city === "Toulouse";
  // Safe hook usage: only call useLanguage when inside Marrakech context
  const languageContext = isMarrakech ? useLanguage() : null;
  const language = languageContext?.language || "fr";
  const setLanguage = languageContext?.setLanguage || (() => {});
  const t = languageContext?.t || ((k: string) => k);
  
  const [showLangModal, setShowLangModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", numberOfPersons: "1" });
  const { toast } = useToast();

  const bookingMutation = useMutation({
    mutationFn: async (data: { gameId: number; venue: string; date: string; time: string; name: string; phone: string; numberOfPersons: number }) => {
      const res = await fetch("/api/joueur-toulouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Booking failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Réservation envoyée!", description: "Nous vous contacterons bientôt." });
      setShowBookingModal(false);
      setBookingForm({ name: "", phone: "", numberOfPersons: "1" });
      setSelectedGame(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Échec de la réservation. Réessayez.", variant: "destructive" });
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;
    bookingMutation.mutate({
      gameId: selectedGame.id,
      venue: selectedGame.venue,
      date: selectedGame.date,
      time: selectedGame.time,
      name: bookingForm.name,
      phone: bookingForm.phone,
      numberOfPersons: parseInt(bookingForm.numberOfPersons) || 1,
    });
  };

  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ["/api/games", city?.toLowerCase()],
    queryFn: async () => {
      const cityParam = city?.toLowerCase() || "marrakech";
      const res = await fetch(`/api/games/${cityParam}`);
      return res.json();
    },
    enabled: isMarrakech || isToulouse,
  });

  const formatGameDate = (dateStr: string) => {
    // Parse MM-DD-YYYY format
    const parts = dateStr.split("-");
    const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  // Countdown timer for Toulouse (23 hours)
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    if (!isToulouse) return;
    
    // Get or set countdown end time in localStorage
    const storageKey = "footchamp_countdown_end";
    let endTime = localStorage.getItem(storageKey);
    
    if (!endTime) {
      // Set countdown to 23 hours from now
      const end = Date.now() + 23 * 60 * 60 * 1000;
      localStorage.setItem(storageKey, end.toString());
      endTime = end.toString();
    }
    
    const updateCountdown = () => {
      const now = Date.now();
      const end = parseInt(endTime!, 10);
      const diff = Math.max(0, end - now);
      
      if (diff === 0) {
        // Reset countdown when it reaches 0
        const newEnd = Date.now() + 23 * 60 * 60 * 1000;
        localStorage.setItem(storageKey, newEnd.toString());
        endTime = newEnd.toString();
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ hours, minutes, seconds });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [isToulouse]);

  useEffect(() => {
    if (isMarrakech) {
      setShowLangModal(true);
    }
  }, [isMarrakech]);

  // Track page visits for analytics
  useEffect(() => {
    if (isToulouse || isMarrakech) {
      const page = isToulouse ? "toulouse" : "marrakech";
      // Generate or retrieve visitor ID from localStorage
      let visitorId = localStorage.getItem("footchamp_visitor_id");
      if (!visitorId) {
        visitorId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("footchamp_visitor_id", visitorId);
      }
      // Track visit (fire and forget, no await needed)
      fetch("/api/analytics/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, visitorId }),
      }).catch(() => {}); // Silently ignore errors
    }
  }, [isToulouse, isMarrakech]);

  const handleLangSelect = (lang: string) => {
    setLanguage(lang as any);
    localStorage.setItem("footchamp_lang_chosen", "true");
    setShowLangModal(false);
  };

  const heroTitle = isMarrakech 
    ? t("form.title") 
    : isToulouse 
      ? "Joue au foot à Toulouse" 
      : (city ? `Organisez vos matchs à ${city} en un clic` : "Organisez vos matchs en un clic");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      
      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLangModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm"
            >
              <Card className="p-8 border-none shadow-2xl bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-display">
                    Choisissez votre langue
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                    Select your preferred language to continue
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {[
                      { code: "fr", name: "Français", native: "Français" },
                      { code: "en", name: "English", native: "English" },
                      { code: "ar", name: "العربية", native: "Arabic" }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangSelect(lang.code)}
                        className="group flex items-center justify-between w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-gray-900 dark:text-white">{lang.native}</span>
                          <span className="text-xs text-gray-400">{lang.name}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                          <Check className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              F
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
              Foot<span className="text-primary">Champ</span> {city && <span className="text-sm font-normal opacity-50 ml-1">| {city}</span>}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {isMarrakech && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                    data-testid="button-language-switcher"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="uppercase font-bold">{language}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
                  <DropdownMenuItem onClick={() => setLanguage("fr")} className="hover:bg-primary/10 transition-colors cursor-pointer">Français</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("en")} className="hover:bg-primary/10 transition-colors cursor-pointer">English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("ar")} className="hover:bg-primary/10 transition-colors cursor-pointer">العربية</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            
            <button 
              onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}
              className="hidden md:block px-5 py-2.5 rounded-xl font-semibold text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-200"
              data-testid="button-scroll-form"
            >
              Rejoindre
            </button>
          </div>
        </div>
      </nav>

      {/* Countdown Banner - Toulouse Only */}
      {isToulouse && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-[80px] left-0 right-0 z-40 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 text-white py-4 shadow-2xl"
          data-testid="countdown-banner"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Clock className="w-6 h-6 md:w-7 md:h-7 animate-bounce" />
                  <div className="absolute inset-0 animate-ping">
                    <Clock className="w-6 h-6 md:w-7 md:h-7 opacity-40" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-black text-sm md:text-lg uppercase tracking-wide drop-shadow-lg">
                    Prochain match dans :
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                <motion.div 
                  className="bg-black/30 backdrop-blur-sm rounded-xl px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center border border-white/20 shadow-lg"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="text-3xl md:text-5xl font-bold tabular-nums drop-shadow-lg tracking-wider" data-testid="countdown-hours">
                    {String(countdown.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs block uppercase tracking-widest text-white/70 font-sans font-medium">heures</span>
                </motion.div>
                
                <span className="text-3xl md:text-5xl font-bold animate-pulse">:</span>
                
                <motion.div 
                  className="bg-black/30 backdrop-blur-sm rounded-xl px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center border border-white/20 shadow-lg"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                >
                  <span className="text-3xl md:text-5xl font-bold tabular-nums drop-shadow-lg tracking-wider" data-testid="countdown-minutes">
                    {String(countdown.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs block uppercase tracking-widest text-white/70 font-sans font-medium">min</span>
                </motion.div>
                
                <span className="text-3xl md:text-5xl font-bold animate-pulse">:</span>
                
                <motion.div 
                  className="bg-black/30 backdrop-blur-sm rounded-xl px-3 md:px-5 py-2 md:py-3 min-w-[60px] md:min-w-[80px] text-center border border-white/20 shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <span className="text-3xl md:text-5xl font-bold tabular-nums drop-shadow-lg tracking-wider" data-testid="countdown-seconds">
                    {String(countdown.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs block uppercase tracking-widest text-white/70 font-sans font-medium">sec</span>
                </motion.div>
              </div>
            </div>
            
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className={`relative pb-12 lg:pb-32 overflow-hidden ${isToulouse ? 'pt-48 lg:pt-72' : 'pt-24 lg:pt-48'}`}>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center gap-8 lg:gap-20"
          >
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs mb-4 md:mb-8">
                {isToulouse ? (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Toulouse</span>
                  </>
                ) : (
                  <>
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Le foot amateur {city ? `à ${city}` : "en France"}</span>
                  </>
                )}
              </div>
              
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-display font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4 md:mb-6">
                {heroTitle}
              </h1>
              
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {isToulouse 
                  ? "inscris toi pour jouer, tu seras recontacté rapidement par notre équipe"
                  : "Rejoignez ou créez des matchs instantanément. Terrain réservé, équipes complètes, jeu lancé."}
              </p>
              
              {!isToulouse && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    <span>Gratuit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    <span>Terrains premium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    <span>Communauté active</span>
                  </div>
                </div>
              )}
              
              {isToulouse && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs font-medium text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    <span>Réponse rapide</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    <span>Terrain de qualité</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4 text-primary" />
                    <span>Tous niveaux</span>
                  </div>
                </div>
              )}
            </div>

            <motion.div 
              id="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="w-full lg:w-auto flex-shrink-0"
            >
              {/* Next Games Cards - Marrakech & Toulouse */}
              {(isMarrakech || isToulouse) && games.length > 0 && (
                <div className="space-y-3 mb-4">
                  {games.map((game) => (
                    <Card key={game.id} className="overflow-hidden border-2 border-primary/20" data-testid={`card-game-${game.id}`}>
                      <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3">
                        <div className="flex items-center gap-2 text-white">
                          <Calendar className="w-5 h-5" />
                          <span className="font-bold text-lg">{formatGameDate(game.date)}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{game.venue}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="w-4 h-4" /> {game.time}
                            </p>
                          </div>
                          <Badge className={`${game.status === "available" ? "bg-green-500" : "bg-red-500"} text-white border-none px-3 py-1`}>
                            {game.status === "available" ? "Disponible" : "Complet"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-lg">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="text-sm font-bold text-primary">{game.matchType.replace("v", " vs ")}</span>
                            </div>
                            {isToulouse && game.duration && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-lg">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold text-blue-600">{game.duration}</span>
                              </div>
                            )}
                            <Badge variant="outline" className="text-xs">#{city?.toLowerCase()}</Badge>
                          </div>
                          <span className="font-bold text-xl text-gray-900 dark:text-white">{game.price} {isToulouse ? "€" : "Dhs"}</span>
                        </div>
                        {game.status === "available" && (
                          isToulouse ? (
                            <Button
                              className="mt-3 w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                              onClick={() => {
                                setSelectedGame(game);
                                setShowBookingModal(true);
                              }}
                              data-testid={`button-book-game-${game.id}`}
                            >
                              Réserver ma place
                            </Button>
                          ) : (
                            <a 
                              href={`https://wa.me/212602424824?text=${encodeURIComponent(`Bonjour, je souhaite réserver une place pour le match du ${formatGameDate(game.date)} à ${game.venue}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                              data-testid={`button-whatsapp-game-${game.id}`}
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                              Réserver via WhatsApp
                            </a>
                          )
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              <LeadForm city={city} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Image Banner */}
      <section className="py-12 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format&fit=crop" 
            alt="Football action" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Jouez plus. Organisez moins.
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Notre plateforme s'occupe de la logistique, des relances et des réservations. 
            Vous n'avez plus qu'à enfiler vos crampons.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Pourquoi choisir FootChamp ?
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Une expérience pensée pour les passionnés de football qui veulent se concentrer sur le jeu, pas sur l'organisation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Communauté Active", text: "Rejoignez des milliers de passionnés." },
              { icon: CalendarCheck2, title: "Demande Instantanée", text: "Réalisez votre demande en quelques secondes." },
              { icon: ShieldCheck, title: "Matchs Garantis", text: "On s'occupe de trouver vos adversaires." },
              { icon: MapPin, title: "Géolocalisation", text: "Trouvez des terrains autour de vous." },
              { icon: Trophy, title: "Niveaux Équilibrés", text: "Jouez avec des adversaires à votre taille." },
              { icon: Clock, title: "Gain de Temps", text: "Créez une partie en 30 secondes." }
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * (i + 1) }}
                className="p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 text-left"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                  F
                </div>
                <span className="font-display font-bold text-xl text-gray-900 dark:text-white">
                  Foot<span className="text-primary">Champ</span>
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                La première plateforme de mise en relation pour les footballeurs amateurs en France.
                Rejoignez le mouvement.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Légal</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">CGU</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li>contact@footchamp.com</li>
                <li>Paris, France</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FootChamp. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              Fait avec <span className="text-red-500">♥</span> par des passionnés de foot
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Réserver ma place</DialogTitle>
          </DialogHeader>
          {selectedGame && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="font-bold text-gray-900 dark:text-white">{selectedGame.venue}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatGameDate(selectedGame.date)} à {selectedGame.time}</p>
              <p className="text-sm font-bold text-primary mt-1">{selectedGame.matchType} - {selectedGame.price} €</p>
            </div>
          )}
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <Label htmlFor="booking-name">Nom complet</Label>
              <Input
                id="booking-name"
                value={bookingForm.name}
                onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                placeholder="Votre nom"
                required
                data-testid="input-booking-name"
              />
            </div>
            <div>
              <Label htmlFor="booking-phone">Téléphone</Label>
              <Input
                id="booking-phone"
                value={bookingForm.phone}
                onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                placeholder="06 XX XX XX XX"
                required
                data-testid="input-booking-phone"
              />
            </div>
            <div>
              <Label htmlFor="booking-persons">Nombre de personnes</Label>
              <Input
                id="booking-persons"
                type="number"
                min="1"
                max="22"
                value={bookingForm.numberOfPersons}
                onChange={(e) => setBookingForm({ ...bookingForm, numberOfPersons: e.target.value })}
                data-testid="input-booking-persons"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={bookingMutation.isPending}
              data-testid="button-submit-booking"
            >
              {bookingMutation.isPending ? "Envoi en cours..." : "Confirmer la réservation"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
