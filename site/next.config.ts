import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Configuration pour les déploiements multi-clusters
    output: "standalone",

    // Variables d'environnement publiques
    env: {
        CLUSTER_NAME: process.env.CLUSTER_NAME || "development",
        CLUSTER_FEATURES: process.env.CLUSTER_FEATURES || "",
        CLUSTER_LANGUAGES: process.env.CLUSTER_LANGUAGES || "en",
    },
};

export default nextConfig;
