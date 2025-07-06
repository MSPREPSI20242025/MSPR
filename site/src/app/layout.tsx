import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/ui/Navigation";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { TranslationProvider } from "@/components/TranslationProvider";
import ClusterLanguageManager from "@/components/ClusterLanguageManager";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MSPR - Surveillance des Pandémies",
    description: "Plateforme de surveillance épidémiologique pour l'OMS - Données COVID-19 et MPOX",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <head>
                <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                />
            </head>
            <body className={inter.className}>
                <TranslationProvider>
                    <ClusterLanguageManager />
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                        <Navigation />
                        <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
                            {children}
                        </main>
                        <Footer />
                        <CookieBanner />
                    </div>
                </TranslationProvider>
            </body>
        </html>
    );
}
