import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: "pt", label: t("language.portuguese") },
    { code: "en", label: t("language.english") },
    { code: "es", label: t("language.spanish") },
    { code: "fr", label: t("language.french") },
    { code: "de", label: t("language.german") },
    { code: "it", label: t("language.italian") },
    { code: "ja", label: t("language.japanese") },
    { code: "zh", label: t("language.chinese") },
    { code: "ko", label: t("language.korean") },
    { code: "ru", label: t("language.russian") },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t("language.select")} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
