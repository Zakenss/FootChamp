import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Language = "fr" | "ar" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    "form.title": "Réaliser une demande de match",
    "form.dates": "Date souhaitée (max 4)",
    "form.add": "Ajouter",
    "form.slots": "Créneaux horaires",
    "form.matchTypes": "Types de match",
    "form.duration": "Durée",
    "form.friends": "Voulez-vous amener des amis ?",
    "form.level": "Niveau",
    "form.pitch": "Terrain préféré (Nom ou Quartier)",
    "pitch.placeholder": "Ex: Kick Off, Planete foot, Master foot, Maracana",
    "form.name": "Nom complet *",
    "form.email": "Email",
    "form.phone": "Téléphone *",
    "form.submit": "Envoyer ma demande",
    "form.sending": "Transmission...",
    "form.success.title": "Demande envoyée !",
    "form.success.msg": "Votre demande de match a bien été transmise. Notre équipe vous contactera sous peu pour finaliser l'organisation.",
    "form.success.another": "Réaliser une autre demande",
    "form.error.name": "Le nom est obligatoire",
    "form.error.phone": "Le numéro de téléphone est obligatoire",
    "levels.beginner": "Débutant",
    "levels.medium": "Moyen",
    "levels.expert": "Expert",
    "friends.solo": "Seul"
  },
  ar: {
    "form.title": "طلب حجز مباراة",
    "form.dates": "التواريخ المفضلة (أقصى 4)",
    "form.add": "إضافة",
    "form.slots": "الفترات الزمنية",
    "form.matchTypes": "نوع المباراة",
    "form.duration": "المدة",
    "form.friends": "هل ستجلب أصدقاء معك؟",
    "form.level": "المستوى",
    "form.pitch": "ملعب اللعب المفضل (الاسم أو الحي)",
    "pitch.placeholder": "مثال: Kick Off، Planete foot، Master foot، Maracana",
    "form.name": "الاسم الكامل *",
    "form.email": "البريد الإلكتروني",
    "form.phone": "رقم الهاتف *",
    "form.submit": "إرسال الطلب",
    "form.sending": "جاري الإرسال...",
    "form.success.title": "تم إرسال الطلب!",
    "form.success.msg": "تم استلام طلبك بنجاح. سيتواصل معك فريقنا قريبًا لتأكيد التنظيم.",
    "form.success.another": "إرسال طلب آخر",
    "form.error.name": "الاسم مطلوب",
    "form.error.phone": "رقم الهاتف مطلوب",
    "levels.beginner": "مبتدئ",
    "levels.medium": "متوسط",
    "levels.expert": "خبير",
    "friends.solo": "بمفردي"
  },
  en: {
    "form.title": "Request a Match Booking",
    "form.dates": "Preferred Dates (max 4)",
    "form.add": "Add",
    "form.slots": "Time Slots",
    "form.matchTypes": "Match Types",
    "form.duration": "Duration",
    "form.friends": "Bringing friends with you?",
    "form.level": "Skill Level",
    "form.pitch": "Preferred Playing Pitch (Name or Area)",
    "pitch.placeholder": "e.g. Kick Off, Planete foot, Master foot, Maracana",
    "form.name": "Full Name *",
    "form.email": "Email",
    "form.phone": "Phone Number *",
    "form.submit": "Send Request",
    "form.sending": "Sending...",
    "form.success.title": "Request Sent!",
    "form.success.msg": "Your match request has been successfully transmitted. Our team will contact you shortly to finalize the organization.",
    "form.success.another": "Make another request",
    "form.error.name": "Name is required",
    "form.error.phone": "Phone number is required",
    "levels.beginner": "Beginner",
    "levels.medium": "Medium",
    "levels.expert": "Expert",
    "friends.solo": "Solo"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
