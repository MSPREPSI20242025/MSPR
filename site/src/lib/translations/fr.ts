export const fr = {
  // Navigation
  nav: {
    home: 'Accueil',
    covid: 'COVID-19',
    mpox: 'MPOX',
    compare: 'Comparer',
    allData: 'Toutes les données',
    predictions: 'Prédictions',
    settings: 'Paramètres'
  },

  // Page d'accueil
  home: {
    title: 'Surveillance des Pandémies',
    subtitle: 'Plateforme de surveillance épidémiologique de l\'OMS',
    description: 'Accédez aux données en temps réel sur les pandémies mondiales, analysez les tendances et surveillez l\'évolution épidémiologique.',
    latestData: 'Dernières données',
    viewDashboard: 'Voir le tableau de bord',
    exploreData: 'Explorer les données'
  },

  // Pages spécifiques
  pages: {
    covid: {
      title: 'Données COVID-19',
      subtitle: 'Surveillance en temps réel des cas COVID-19',
      globalData: 'Données Mondiales',
      countryData: 'Données par Pays',
      timeline: 'Évolution Temporelle',
      selectCountry: 'Sélectionner un pays',
      timeRange: 'Période',
      last30days: '30 derniers jours',
      last90days: '90 derniers jours',
      last365days: '365 derniers jours',
      allTime: 'Toutes les données',
      loading: 'Chargement des données...',
      error: 'Erreur lors du chargement'
    },
    mpox: {
      title: 'Données MPOX',
      subtitle: 'Surveillance des cas de variole du singe',
      description: 'Suivi en temps réel des cas de MPOX dans le monde'
    },
    compare: {
      title: 'Comparaison des Pandémies',
      subtitle: 'Analyse comparative COVID-19 vs MPOX',
      description: 'Comparez l\'évolution et l\'impact des différentes pandémies'
    },
    allData: {
      title: 'Toutes les Données',
      subtitle: 'Vue d\'ensemble complète',
      description: 'Accès complet à toutes les données épidémiologiques'
    }
  },

  // Données
  data: {
    totalCases: 'Cas totaux',
    newCases: 'Nouveaux cas',
    totalDeaths: 'Décès totaux',
    newDeaths: 'Nouveaux décès',
    recoveries: 'Guérisons',
    activeCases: 'Cas actifs',
    country: 'Pays',
    date: 'Date',
    lastUpdated: 'Dernière mise à jour',
    latestUpdates: 'Dernières mises à jour COVID-19',
    loading: 'Chargement...',
    noData: 'Aucune donnée disponible',
    error: 'Erreur lors du chargement des données',
    covidCases: 'Cas COVID',
    covidDeaths: 'Décès COVID',
    mpoxCases: 'Cas MPOX',
    mpoxDeaths: 'Décès MPOX',
    newCasesLatest: 'Nouveaux cas (dernier)',
    newDeathsLatest: 'Nouveaux décès (dernier)'
  },

  // Graphiques
  charts: {
    evolution: 'Évolution temporelle',
    distribution: 'Distribution géographique',
    comparison: 'Comparaison',
    trend: 'Tendance',
    daily: 'Données quotidiennes',
    cumulative: 'Données cumulées',
    perCapita: 'Par habitant',
    weeklyNewCases: 'Nouveaux cas hebdomadaires',
    weeklyNewDeaths: 'Nouveaux décès hebdomadaires', 
    weeklyCasesDistribution: 'Distribution des cas hebdomadaires',
    weeklyDeathsDistribution: 'Distribution des décès hebdomadaires',
    covidWeeklyNewCases: 'COVID-19 Nouveaux cas hebdomadaires',
    covidWeeklyNewDeaths: 'COVID-19 Nouveaux décès hebdomadaires',
    covidWeeklyCasesDistribution: 'COVID-19 Distribution des cas hebdomadaires',
    covidWeeklyDeathsDistribution: 'COVID-19 Distribution des décès hebdomadaires',
    mpoxWeeklyNewCases: 'MPOX Nouveaux cas hebdomadaires',
    mpoxWeeklyNewDeaths: 'MPOX Nouveaux décès hebdomadaires',
    mpoxWeeklyCasesDistribution: 'MPOX Distribution des cas hebdomadaires',
    mpoxWeeklyDeathsDistribution: 'MPOX Distribution des décès hebdomadaires'
  },

  // Filtres
  filters: {
    selectCountry: 'Sélectionner un pays',
    selectDate: 'Sélectionner une date',
    selectPeriod: 'Sélectionner une période',
    all: 'Tous',
    last7days: '7 derniers jours',
    last30days: '30 derniers jours',
    last90days: '90 derniers jours',
    customRange: 'Période personnalisée'
  },

  // RGPD et légal
  legal: {
    privacyPolicy: 'Politique de confidentialité',
    cookiePolicy: 'Politique des cookies',
    legalNotices: 'Mentions légales',
    gdprCompliant: 'Conforme RGPD',
    contactDPO: 'Contacter le DPO',
    yourRights: 'Vos droits',
    dataRetention: 'Conservation des données',
    acceptCookies: 'Accepter les cookies',
    manageCookies: 'Gérer les cookies',
    essential: 'Essentiels',
    analytics: 'Analytiques',
    marketing: 'Marketing',
    backToHome: 'Retour à l\'accueil',
    
    // Page mentions légales
    mentionsLegales: {
      title: 'Mentions Légales',
      subtitle: 'Politique de confidentialité et conformité RGPD',
      editor: 'Éditeur du site',
      hosting: 'Hébergement',
      dataCollection: 'Collecte et traitement des données',
      userRights: 'Vos droits (RGPD)',
      cookiesSection: 'Politique des cookies',
      dataRetention: 'Conservation des données',
      security: 'Sécurité des données',
      internationalTransfers: 'Transferts internationaux',
      complaints: 'Réclamations',
      contact: 'Contact',
      lastUpdate: 'Dernière mise à jour',
      dpoTitle: 'Délégué à la Protection des Données (DPO)'
    },
    
    // Page politique cookies
    cookiePage: {
      title: 'Politique des Cookies',
      subtitle: 'Gestion de vos préférences de cookies',
      whatAreCookies: 'Qu\'est-ce qu\'un cookie ?',
      typesOfCookies: 'Types de cookies utilisés',
      essentialCookies: 'Cookies Essentiels',
      analyticsCookies: 'Cookies Analytiques',
      marketingCookies: 'Cookies Marketing',
      howToManage: 'Comment gérer vos cookies ?',
      viaBrowser: 'Via votre navigateur',
      viaSite: 'Via ce site',
      importantInfo: 'Informations importantes',
      disableImpact: 'Impact de la désactivation',
      updatePrefs: 'Mise à jour des préférences',
      retention: 'Durée de conservation',
      questions: 'Questions sur les cookies ?',
      savePreferences: 'Sauvegarder mes préférences',
      allow: 'Autoriser',
      required: 'Obligatoires'
    }
  },

  // Messages
  messages: {
    success: 'Succès',
    error: 'Erreur',
    warning: 'Attention',
    info: 'Information',
    confirm: 'Confirmer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    download: 'Télécharger',
    share: 'Partager',
    print: 'Imprimer'
  },

  // Footer
  footer: {
    aboutWHO: 'À propos de l\'OMS',
    quickLinks: 'Liens rapides',
    compliance: 'Conformité & Légal',
    contact: 'Contact',
    copyright: 'Organisation Mondiale de la Santé (OMS). Tous droits réservés.',
    address: 'Avenue Appia 20, 1211 Genève, Suisse'
  },

  // Erreurs communes
  errors: {
    pageNotFound: 'Page non trouvée',
    serverError: 'Erreur serveur',
    networkError: 'Erreur réseau',
    permissionDenied: 'Permission refusée',
    sessionExpired: 'Session expirée'
  }
};