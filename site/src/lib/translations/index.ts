import { fr } from "./fr";
import { de } from "./de";
import { it } from "./it";
import { en } from "./en";
import type { Locale } from "../i18n";

export const translations = {
    fr,
    de,
    it,
    en,
} as const;

export type TranslationKeys = typeof fr;
export type TranslationPath = string;

// Helper pour obtenir une traduction imbriquée
export function getNestedTranslation(
    obj: any,
    path: string,
    fallback: string = path
): string {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
            current = current[key];
        } else {
            return fallback;
        }
    }

    return typeof current === "string" ? current : fallback;
}

// Helper pour obtenir toutes les traductions d'une locale
export function getTranslations(locale: Locale): TranslationKeys | any {
    return translations[locale] || translations.fr;
}
