import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div 
      className="group p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300 ease-out"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-primary" strokeWidth={2.5} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display mb-3">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
