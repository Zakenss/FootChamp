import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { MapPin, ArrowRight, Moon, X, Calendar, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Landing() {
  const [showMarrakechOptions, setShowMarrakechOptions] = useState(false);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [, navigate] = useLocation();

  const handleTournamentClick = () => {
    setShowMarrakechOptions(false);
    setShowLanguageSelection(true);
  };

  const selectLanguage = (lang: "fr" | "ar") => {
    setShowLanguageSelection(false);
    navigate(`/tournoi-ramadan?lang=${lang}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <AnimatePresence>
        {showLanguageSelection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLanguageSelection(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm"
            >
              <Card className="p-6 border-none shadow-2xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
                <button 
                  onClick={() => setShowLanguageSelection(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  data-testid="button-close-lang-modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Globe className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                    Tournoi Ramadan
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Choisissez votre langue / اختر لغتك
                  </p>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => selectLanguage("fr")}
                    className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left"
                    data-testid="button-lang-french"
                  >
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      <span>FR</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 dark:text-white block">Français</span>
                      <span className="text-xs text-gray-500">Continuer en français</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                  
                  <button 
                    onClick={() => selectLanguage("ar")}
                    className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left"
                    data-testid="button-lang-arabic"
                  >
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      <span>ع</span>
                    </div>
                    <div className="flex-1 text-right">
                      <span className="font-bold text-gray-900 dark:text-white block">العربية</span>
                      <span className="text-xs text-gray-500">متابعة بالعربية</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {showMarrakechOptions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMarrakechOptions(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card className="p-6 border-none shadow-2xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
                <button 
                  onClick={() => setShowMarrakechOptions(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  data-testid="button-close-modal"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                    Marrakech
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Choisissez votre activité
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link href="/marrakech" data-testid="link-marrakech-booking">
                    <button 
                      className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-left"
                      onClick={() => setShowMarrakechOptions(false)}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-900 dark:text-white block">Réserver un match</span>
                        <span className="text-xs text-gray-500">Demande de terrain classique</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  </Link>
                  
                  <button 
                    onClick={handleTournamentClick}
                    className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-200 text-left"
                    data-testid="button-tournoi-ramadan"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-emerald-500/20">
                      <Moon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 dark:text-white block">Tournoi Ramadan</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">8 équipes - 2 groupes - 5v5</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl w-full"
      >
        <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-6 font-display tracking-tight">
          Foot<span className="text-primary">Champ</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Réaliser une demande de match en un clic. Choisissez votre ville pour commencer.
        </p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <button 
            onClick={() => setShowMarrakechOptions(true)} 
            className="group text-left"
            data-testid="button-marrakech"
          >
            <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Marrakech</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Réservez les meilleurs terrains de la ville ocre.</p>
              <div className="flex items-center text-primary font-bold">
                Explorer <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>

          <Link href="/toulouse" className="group" data-testid="link-toulouse">
            <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Toulouse</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Trouvez votre prochain match dans la ville rose.</p>
              <div className="flex items-center text-primary font-bold">
                Explorer <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>

        <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-900 text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} FootChamp. Tous droits réservés.
        </footer>
      </motion.div>
    </div>
  );
}
