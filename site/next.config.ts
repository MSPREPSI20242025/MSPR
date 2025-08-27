import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Configuration pour les déploiements multi-clusters
    output: "standalone",

    // Variables d'environnement publiques
    env: {
        NEXT_PUBLIC_CLUSTER_NAME: process.env.CLUSTER_NAME || "development",
        NEXT_PUBLIC_CLUSTER_FEATURES: process.env.CLUSTER_FEATURES || "",
        NEXT_PUBLIC_CLUSTER_LANGUAGES: process.env.CLUSTER_LANGUAGES || "en",
    },

    // Note: i18n configuration is handled by App Router middleware
    // See site/src/middleware.ts for internationalization setup
};

export default nextConfig;
