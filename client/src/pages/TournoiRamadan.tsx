import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Users, CheckCircle2, Loader2, Moon, MapPin, Trophy, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";

const translations = {
  fr: {
    title: "Tournoi Ramadan",
    subtitle: "Marrakech 2026",
    headline: "Tournoi Ramadan",
    description: "8 équipes s'affrontent dans 2 groupes. Matchs 7 contre 7, ambiance unique du Ramadan. 1400 Dhs par équipe.",
    teams: "8 Équipes",
    groups: "2 Groupes",
    format: "7 vs 7",
    registerTitle: "Inscrivez votre équipe",
    registerSubtitle: "Places limitées - 1400 Dhs par équipe",
    name: "Nom de l'équipe ou du responsable",
    phone: "Numéro de téléphone",
    teamSize: "Combien de joueurs dans l'équipe ?",
    teamSizeOptions: ["7", "8", "9", "10"],
    submit: "Je veux participer",
    sending: "Envoi en cours...",
    successTitle: "Inscription reçue !",
    successMsg: "Nous vous contacterons très bientôt avec tous les détails du tournoi.",
    anotherReg: "Inscrire une autre équipe",
    features: [
      "Matchs en soirée après l'Iftar"
    ],
    switchLang: "العربية",
    requiredField: "Ce champ est requis",
    selectTeamSize: "Sélectionnez une option",
    countdown: "Début du tournoi dans",
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
    tournamentStructure: "Structure du tournoi",
    groupA: "Groupe A",
    groupB: "Groupe B",
    groupC: "Groupe C",
    team: "Équipe",
    points: "Pts",
    tbd: "À déterminer"
  },
  ar: {
    title: "دوري رمضان",
    subtitle: "مراكش 2026",
    headline: "دوري رمضان",
    description: "8 فرق تتنافس في مجموعتين. مباريات 7 ضد 7، أجواء رمضانية فريدة. 1400 درهم للفريق.",
    teams: "8 فرق",
    groups: "مجموعتان",
    format: "7 ضد 7",
    registerTitle: "سجل فريقك",
    registerSubtitle: "الأماكن محدودة - 1400 درهم للفريق",
    name: "اسم الفريق أو المسؤول",
    phone: "رقم الهاتف",
    teamSize: "كم عدد اللاعبين في الفريق؟",
    teamSizeOptions: ["7", "8", "9", "10"],
    submit: "أريد المشاركة",
    sending: "جاري الإرسال...",
    successTitle: "تم استلام التسجيل!",
    successMsg: "سنتصل بك قريباً جداً مع كل تفاصيل الدوري.",
    anotherReg: "تسجيل فريق آخر",
    features: [
      "مباريات مسائية بعد الإفطار"
    ],
    switchLang: "Français",
    requiredField: "هذا الحقل مطلوب",
    selectTeamSize: "اختر خياراً",
    countdown: "بداية الدوري في",
    days: "أيام",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثواني",
    tournamentStructure: "هيكل الدوري",
    groupA: "المجموعة أ",
    groupB: "المجموعة ب",
    groupC: "المجموعة ج",
    team: "الفريق",
    points: "نقاط",
    tbd: "لم يتحدد بعد"
  }
};

type Language = "fr" | "ar";

const createFormSchema = (t: typeof translations.fr) => z.object({
  name: z.string().min(1, t.requiredField),
  phone: z.string().min(1, t.requiredField),
  teamSize: z.string().min(1, t.requiredField),
});

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

function useCountdown(days: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(23, 59, 59, 999);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [days]);

  return timeLeft;
}

export default function TournoiRamadan() {
  const [, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang") as Language | null;
  const [language, setLanguage] = useState<Language>(langParam === "ar" ? "ar" : "fr");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const t = translations[language];
  const isRTL = language === "ar";
  const countdown = useCountdown(21);
  
  const formSchema = createFormSchema(t);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      teamSize: ""
    }
  });

  useEffect(() => {
    let visitorId = localStorage.getItem("footchamp_visitor_id");
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("footchamp_visitor_id", visitorId);
    }
    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: "ramadan", visitorId }),
    }).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      await apiRequest("POST", "/api/tournament/register", data);
      setIsSuccess(true);
      form.reset();
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setIsPending(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    navigate(`/tournoi-ramadan?lang=${newLang}`, { replace: true });
  };

  const groups = [
    { name: t.groupA, teams: [1, 2, 3, 4] },
    { name: t.groupB, teams: [5, 6, 7, 8] },
  ];

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-950", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      <nav className="w-full py-3 px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight cursor-pointer" data-testid="link-logo">
              Foot<span className="text-primary">Champ</span>
            </span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="border-gray-200 dark:border-gray-700"
            data-testid="button-switch-language"
          >
            {t.switchLang}
          </Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Hero Section with Form - Visible on landing */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 text-center lg:text-start"
          >
            {/* Countdown - Compact */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-primary font-semibold text-sm">{t.countdown}</span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: countdown.days, label: t.days[0] },
                  { value: countdown.hours, label: t.hours[0] },
                  { value: countdown.minutes, label: t.minutes[0] },
                  { value: countdown.seconds, label: t.seconds[0] },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                    <span className="text-lg font-black text-gray-900 dark:text-white">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-gray-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-primary font-semibold text-sm">{t.title} - {t.subtitle}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-4 tracking-tight font-display">
              {t.headline}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto lg:mx-0">
              {t.description}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
              {[
                { icon: Users, label: t.teams },
                { icon: Trophy, label: t.groups },
                { icon: Star, label: t.format }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-gray-900 dark:text-white font-bold text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
              {t.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>Marrakech, Maroc</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            {isSuccess ? (
              <Card className="p-6 text-center border-primary/20 bg-primary/5" data-testid="card-success">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t.successTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{t.successMsg}</p>
                <Button
                  variant="ghost"
                  onClick={() => setIsSuccess(false)}
                  className="text-primary"
                  data-testid="button-register-another"
                >
                  {t.anotherReg}
                </Button>
              </Card>
            ) : (
              <Card className="p-5 shadow-xl border-2 border-primary/20" data-testid="card-registration-form">
                <div className="text-center mb-5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {t.registerTitle}
                  </h2>
                  <p className="text-primary text-sm font-medium">{t.registerSubtitle}</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t.name}
                              className="w-full px-4 py-3 h-auto rounded-xl"
                              data-testid="input-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              placeholder={t.phone}
                              className="w-full px-4 py-3 h-auto rounded-xl"
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                className="w-full px-4 py-3 h-auto rounded-xl"
                                data-testid="select-team-size"
                              >
                                <SelectValue placeholder={t.teamSize} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                              {t.teamSizeOptions.map((option, i) => (
                                <SelectItem key={i} value={option} className="text-gray-900 dark:text-white" data-testid={`select-option-${i}`}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-5 text-base font-bold rounded-xl"
                      data-testid="button-submit"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          {t.sending}
                        </>
                      ) : (
                        t.submit
                      )}
                    </Button>
                  </form>
                </Form>

                <p className="text-center text-gray-500 text-xs mt-4">
                  {language === "fr" 
                    ? "En vous inscrivant, vous acceptez d'être contacté par notre équipe." 
                    : "بالتسجيل، توافق على أن يتصل بك فريقنا."}
                </p>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Tournament Structure Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {t.tournamentStructure}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {groups.map((group, groupIndex) => (
              <Card key={groupIndex} className="p-4" data-testid={`card-group-${groupIndex}`}>
                <h3 className="text-base font-bold text-primary mb-3 text-center">{group.name}</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className={cn("py-2 text-xs font-semibold text-gray-500", isRTL ? "text-right" : "text-left")}>{t.team}</th>
                      <th className="py-2 text-xs font-semibold text-gray-500 text-center w-12">{t.points}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams.map((teamNum, teamIndex) => (
                      <tr key={teamIndex} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                        <td className={cn("py-2 text-gray-600 dark:text-gray-400 text-sm", isRTL ? "text-right" : "text-left")}>
                          <span className="inline-flex items-center gap-2">
                            <span className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                              {teamNum}
                            </span>
                            {t.tbd}
                          </span>
                        </td>
                        <td className="py-2 text-center font-bold text-gray-400 text-sm">0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-900 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} FootChamp. {language === "fr" ? "Tous droits réservés." : "جميع الحقوق محفوظة."}
          </p>
        </div>
      </footer>
    </div>
  );
}
