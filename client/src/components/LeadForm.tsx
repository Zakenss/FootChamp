import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadToulouseSchema, insertLeadMarrakechSchema } from "@shared/schema";
import { useCreateLead } from "@/hooks/use-leads";
import { Loader2, CheckCircle2, ArrowRight, Users, Trophy, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";

const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
];

const MATCH_TYPES = ["5 vs 5", "7 vs 7", "11 vs 11"];

export function LeadForm({ city }: { city?: string }) {
  const isMarrakech = city === "Marrakech";
  const isToulouse = city?.toLowerCase() === "toulouse";
  
  // Safe hook usage: only call useLanguage when inside Marrakech context
  const languageContext = isMarrakech ? useLanguage() : null;
  const t = languageContext?.t || ((k: string) => k);
  const language = languageContext?.language || "fr";

  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate, isPending, error } = useCreateLead(city || "Marrakech");
  
  const LEVELS = isMarrakech 
    ? [t("levels.beginner"), t("levels.medium"), t("levels.expert")]
    : ["Débutant", "Moyen", "Expert"];
  
  const DURATIONS = isToulouse ? ["1h", "1.5h"] : ["1h", "2h"];
  
  const baseSchema = isToulouse ? insertLeadToulouseSchema : insertLeadMarrakechSchema;
  const validationSchema = baseSchema.extend({
    name: z.string().min(2, isMarrakech ? t("form.error.name") : "Le nom est obligatoire"),
    phone: z.string().min(8, isMarrakech ? t("form.error.phone") : "Le numéro de téléphone est obligatoire"),
    email: z.string().email().optional().or(z.literal("")),
  });

  const form = useForm<any>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredDate: [],
      preferredTimeSlot: [],
      matchType: [],
      duration: [],
      additionalPlayers: isMarrakech ? t("friends.solo") : "Seul",
      level: LEVELS[1],
    },
  });

  const selectedDates = form.watch("preferredDate") || [];
  const selectedSlots = form.watch("preferredTimeSlot") || [];
  const selectedMatchTypes = form.watch("matchType") || [];
  const selectedDurations = form.watch("duration") || [];

  const toggleSelection = (field: string, value: string, max?: number) => {
    const current = form.getValues(field) || [];
    if (current.includes(value)) {
      form.setValue(field, current.filter((v: string) => v !== value));
    } else {
      if (!max || current.length < max) {
        form.setValue(field, [...current, value]);
      }
    }
  };

  const formRef = useRef<HTMLDivElement>(null);

  const onSubmit = (data: any) => {
    if (selectedDates.length === 0 || selectedSlots.length === 0 || selectedMatchTypes.length === 0) {
      return;
    }
    
    mutate(data, {
      onSuccess: () => {
        setIsSuccess(true);
        form.reset();
        if (window.innerWidth < 768) {
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    });
  };

  if (isSuccess) {
    return (
      <motion.div 
        ref={formRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-primary/20 text-center"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-display">
          {isMarrakech ? t("form.success.title") : "Demande envoyée !"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {isMarrakech ? t("form.success.msg") : "Votre demande de match a bien été transmise. Notre équipe vous contactera sous peu pour finaliser l'organisation."}
        </p>
        <Button 
          variant="ghost"
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {isMarrakech ? t("form.success.another") : "Réaliser une autre demande"}
        </Button>
      </motion.div>
    );
  }

  return (
    <div ref={formRef} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-black/5 p-6 md:p-8 border border-gray-100 dark:border-gray-700" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="mb-6">
        <h3 className={cn("text-xl md:text-2xl font-bold text-gray-900 dark:text-white font-display mb-2", isMarrakech ? "text-start" : "")}>
          {isMarrakech ? t("form.title") : "Réaliser une demande de match"}
        </h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
            <span>{isMarrakech ? t("form.dates") : "Date souhaitée (max 4)"}</span>
            <span className="text-xs font-normal text-gray-500">{selectedDates.length}/4</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((date: string) => (
              <Badge key={date} variant="secondary" className="px-3 py-1 gap-1 bg-primary/10 text-primary border-none">
                {format(new Date(date), "dd MMM", { locale: (isMarrakech && language === "ar") ? undefined : fr })}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSelection("preferredDate", date)} />
              </Badge>
            ))}
            {selectedDates.length < 4 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full border-dashed h-8 px-3">
                    <Plus className="w-4 h-4 mr-1" /> {isMarrakech ? t("form.add") : "Ajouter"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    onSelect={(date) => {
                      if (date) toggleSelection("preferredDate", format(date, "yyyy-MM-dd"), 4);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) || date > addMonths(new Date(), 2)
                    }
                    initialFocus
                    locale={(isMarrakech && language === "ar") ? undefined : fr}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-between">
            <span>{isMarrakech ? t("form.slots") : "Créneaux horaires"}</span>
            <span className="text-xs font-normal text-gray-500">{selectedSlots.length} {isMarrakech ? (language === "en" ? "selected" : (language === "ar" ? "مختار" : "sélectionné(s)")) : "sélectionné(s)"}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSelection("preferredTimeSlot", slot)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selectedSlots.includes(slot)
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-primary/50"
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className={cn("text-sm font-bold text-gray-900 dark:text-white block", isMarrakech ? "text-start" : "")}>{isMarrakech ? t("form.matchTypes") : "Types de match"}</label>
            <div className="flex flex-col gap-2">
              {MATCH_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleSelection("matchType", type)}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between",
                    isMarrakech ? (language === "ar" ? "text-right" : "text-left") : "text-left",
                    selectedMatchTypes.includes(type)
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-transparent border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary/30"
                  )}
                >
                  {type}
                  {selectedMatchTypes.includes(type) && <CheckCircle2 className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className={cn("text-sm font-bold text-gray-900 dark:text-white block", isMarrakech ? "text-start" : "")}>{isMarrakech ? t("form.duration") : "Durée"}</label>
            <div className="flex flex-col gap-2">
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => toggleSelection("duration", dur)}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center justify-between",
                    isMarrakech ? (language === "ar" ? "text-right" : "text-left") : "text-left",
                    selectedDurations.includes(dur)
                      ? "bg-primary/5 border-primary text-primary"
                      : "bg-transparent border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary/30"
                  )}
                >
                  {dur}
                  {selectedDurations.includes(dur) && <CheckCircle2 className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={cn("space-y-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800", isMarrakech ? "text-start" : "")}>
          <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {isMarrakech ? t("form.friends") : "Voulez-vous amener des amis ?"}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(isMarrakech ? [t("friends.solo"), "+1", "+2", "+3", "+4", "+5", "+6"] : ["Seul", "+1", "+2", "+3", "+4", "+5", "+6"]).map((option, idx) => (
              <button
                key={option}
                type="button"
                onClick={() => form.setValue("additionalPlayers", option)}
                className={cn(
                  "py-2 rounded-xl text-xs font-bold transition-all border",
                  form.watch("additionalPlayers") === option || (!form.watch("additionalPlayers") && option === (isMarrakech ? t("friends.solo") : "Seul"))
                    ? "bg-primary border-primary text-white shadow-sm"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/30"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="relative">
            <Trophy className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none", (isMarrakech && language === "ar") ? "right-4" : "left-4")} />
            <select
              {...form.register("level")}
              className={cn(
                "w-full pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm",
                (isMarrakech && language === "ar") ? "pl-4 pr-11" : "pl-11 pr-4"
              )}
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {isMarrakech && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 dark:text-white text-start block">{t("form.pitch")}</label>
            <input
              placeholder={t("pitch.placeholder")}
              {...form.register("preferredPitch")}
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm",
                language === "ar" ? "text-right" : "text-left"
              )}
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1">
            <input
              placeholder={isMarrakech ? t("form.name") : "Nom complet *"}
              {...form.register("name")}
              className={cn(
                "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm",
                form.formState.errors.name ? "border-red-500" : "border-gray-200 dark:border-gray-800"
              )}
            />
            {form.formState.errors.name && (
              <p className="text-[10px] text-red-500 font-medium px-1">{form.formState.errors.name.message as string}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              placeholder={isMarrakech ? t("form.email") : "Email"}
              {...form.register("email")}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
            <div className="space-y-1">
              <input
                type="tel"
                placeholder={isMarrakech ? t("form.phone") : "Téléphone *"}
                {...form.register("phone")}
                className={cn(
                  "w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm",
                  form.formState.errors.phone ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                )}
              />
              {form.formState.errors.phone && (
                <p className="text-[10px] text-red-500 font-medium px-1">{form.formState.errors.phone.message as string}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || selectedDates.length === 0 || selectedSlots.length === 0 || selectedMatchTypes.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 mt-4"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isMarrakech ? t("form.sending") : "Transmission..."}</span>
            </>
          ) : (
            <>
              <span>{isMarrakech ? t("form.submit") : "Envoyer ma demande"}</span>
              <ArrowRight className={cn("w-5 h-5", (isMarrakech && language === "ar") ? "rotate-180" : "")} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
