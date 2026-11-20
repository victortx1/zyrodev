(function () {
  const STORAGE_KEYS = {
    theme: "zyrodev_theme",
    language: "zyrodev_language",
    site: "zyrodev_site_config",
    features: "zyrodev_features_config",
    customColors: "zyrodev_custom_colors",
    socials: "zyrodev_socials_config",
    seo: "zyrodev_seo_config",
    navbar: "zyrodev_navbar_config",
    login: "zyrodev_login_config",
    courses: "zyrodev_courses_config",
    preloader: "zyrodev_preloader_config",
    animations: "zyrodev_animations_config",
    cookie: "zyrodev_cookie_config",
    admin: "zyrodev_admin_config"
  };

  const THEME_PRESETS = {
    "dark-orange": {
      primary: "#ff6a00",
      secondary: "#ff8533",
      accent: "#ffb067",
      text: "#f5f5f5",
      textSecondary: "#b8b8b8",
      background: "#000000",
      cards: "#111111",
      panels: "#171717",
      borders: "rgba(255,255,255,0.10)",
      buttons: "#ff6a00",
      buttonHover: "#ff8533",
      links: "#ff8a3d",
      navbar: "rgba(10,14,25,0.85)",
      footer: "#0a0a0a",
      icons: "#ff6a00",
      headings: "#ffffff",
      subtitles: "#b8b8b8",
      opacity: 0.9,
      shadow: "0 12px 30px rgba(0,0,0,0.45)",
      borderWidth: "1px",
      borderRadiusCard: "18px",
      borderRadiusButton: "12px",
      effectIntensity: 1,
      animationSpeed: 0.3
    },
    light: {
      primary: "#111111",
      secondary: "#2f2f2f",
      accent: "#ff6a00",
      text: "#111111",
      textSecondary: "#4b5563",
      background: "#f5f5f5",
      cards: "#ffffff",
      panels: "#f3f4f6",
      borders: "rgba(17,17,17,0.12)",
      buttons: "#111111",
      buttonHover: "#2a2a2a",
      links: "#111111",
      navbar: "rgba(255,255,255,0.78)",
      footer: "#ededed",
      icons: "#111111",
      headings: "#111111",
      subtitles: "#4b5563",
      opacity: 0.95,
      shadow: "0 12px 30px rgba(0,0,0,0.08)",
      borderWidth: "1px",
      borderRadiusCard: "18px",
      borderRadiusButton: "12px",
      effectIntensity: 0.9,
      animationSpeed: 0.3
    },
    "light-orange": {
      primary: "#ff6a00",
      secondary: "#ff8533",
      accent: "#ff8a3d",
      text: "#1a1a1a",
      textSecondary: "#4b5563",
      background: "#fff8f3",
      cards: "#ffffff",
      panels: "#fff1e8",
      borders: "rgba(255,106,0,0.18)",
      buttons: "#ff6a00",
      buttonHover: "#e85d00",
      links: "#cc5200",
      navbar: "rgba(255,255,255,0.82)",
      footer: "#f8efe8",
      icons: "#ff6a00",
      headings: "#1a1a1a",
      subtitles: "#5b5b5b",
      opacity: 0.96,
      shadow: "0 12px 28px rgba(255,106,0,0.13)",
      borderWidth: "1px",
      borderRadiusCard: "18px",
      borderRadiusButton: "12px",
      effectIntensity: 1,
      animationSpeed: 0.3
    }
  };

  const DEFAULT_CONFIG = {
    theme: "dark-orange",
    language: "pt-BR",
    site: {
      name: "ZyroDev",
      logo: "Z",
      favicon: "./fotos/zraposa.png",
      title: "ZyroDev",
      description: "Aprenda programação gratuitamente e evolua com a ZyroDev",
      url: "https://zyrodev.com",
      email: "contato@zyrodev.com",
      founderName: "Delarotaldev",
      copyright: "© 2026 ZyroDev Temp 2",
      footerText: "Aprenda programação gratuitamente e evolua junto com a comunidade."
    },
    socials: {
      discord: "https://discord.gg/AJkeUcN47e",
      instagram: "https://www.instagram.com/delarotaldev",
      tiktok: "",
      youtube: "https://youtube.com/@delarotaldev",
      github: "https://github.com/victortx1",
      linkedin: "https://www.linkedin.com/"
    },
    features: {
      showNavbar: true,
      showHero: true,
      showStats: true,
      showCourses: true,
      showCommunity: true,
      showFooter: true,
      showCookies: true,
      showGooglePopup: true,
      showPreloader: true,
      showAnimations: true,
      showMotivationalPhrases: true,
      showUpdates: true,
      showDiscord: true,
      showSocialLinks: true,
      showProfile: true,
      showLogin: true,
      showSearch: true,
      showNotifications: true,
      showAdminButton: true,
      showPartnerSection: true,
      showFounderBadge: true,
      showVipBadge: true
    },
    visual: {
      primary: "#ff6a00",
      secondary: "#ff8533",
      accent: "#ffb067",
      text: "#f5f5f5",
      textSecondary: "#b8b8b8",
      background: "#000000",
      cards: "#111111",
      panels: "#171717",
      borders: "rgba(255,255,255,0.10)",
      buttons: "#ff6a00",
      buttonHover: "#ff8533",
      links: "#ff8a3d",
      navbar: "rgba(10,14,25,0.85)",
      footer: "#0a0a0a",
      icons: "#ff6a00",
      headings: "#ffffff",
      subtitles: "#b8b8b8",
      opacity: 0.9,
      shadow: "0 12px 30px rgba(0,0,0,0.45)",
      borderWidth: "1px",
      borderRadiusCard: "18px",
      borderRadiusButton: "12px",
      effectIntensity: 1,
      animationSpeed: 0.3
    },
    preloader: {
      enabled: true,
      duration: 1690,
      animation: "honeycomb",
      color: "#ff6a00",
      elementColor: "#ff8533",
      onlyOncePerSession: true,
      showOnAllPages: true
    },
    animations: {
      enabled: true,
      pageEntrance: true,
      scrollReveal: true,
      hover: true,
      cards: true,
      buttons: true,
      navbar: true,
      hero: true,
      modal: true,
      preloader: true,
      transitions: true
    },
    seo: {
      title: "ZyroDev",
      description: "Aprenda programação gratuitamente e evolua com a ZyroDev",
      keywords: "programação, cursos, desenvolvimento, ZyroDev, JavaScript, Python, HTML, CSS",
      author: "ZyroDev",
      ogTitle: "ZyroDev",
      ogDescription: "Aprenda programação gratuitamente e evolua com a ZyroDev",
      ogImage: "/preview.png",
      language: "pt-BR",
      robots: "index,follow",
      canonical: ""
    },
    cookies: {
      showCookieBanner: true,
      cookieEnabled: true,
      cookieText: "🍪 Este site utiliza cookies para melhorar sua experiência no ZyroDev.",
      cookieButtonText: "Aceitar",
      cookieStorageKey: "zyro_cookie"
    },
    login: {
      googleLogin: true,
      googlePopup: true,
      showProfile: true,
      redirectAfterLogin: "perfil.html",
      protectedPagesRedirect: "login.html",
      showLoggedUser: true,
      showPhoto: true,
      showName: true
    },
    courses: {
      showCourses: true,
      visibleCount: 12,
      showClassButton: true,
      requireLogin: true,
      showProtectedContent: true,
      unauthenticatedMessage: "Faça login para acessar os cursos."
    },
    admin: {
      showAdminButton: true,
      showAdminResources: true,
      displayAdminInfo: true
    },
    navbar: {
      brand: "Z",
      links: [
        { label: "Sobre", href: "#sobre" },
        { label: "Créditos", href: "creditos.html" },
        { label: "ZYRO PODEPA", href: "podepa.html" },
        { label: "Login", href: "login.html" }
      ]
    }
  };

  const translations = {
    "pt-BR": {
      navbarAbout: "Sobre",
      navbarCredits: "Créditos",
      navbarChat: "Bate Papo",
      navbarLogin: "Login",
      heroTitle: "Aprenda a programar de graça com a ZyroDev.",
      heroSubtitle: "metodologia prática, direto ao ponto e de forma simples.",
      heroCTA: "Aulas",
      statsTitle1: "Vídeos de Programação com atualizações constantes",
      statsTitle2: "Tecnologias",
      statsTitle3: "Conteúdo Gratuito",
      feature1Title: "📚 Conteúdo Organizado",
      feature1Text: "Cursos organizados para facilitar sua evolução na programação.",
      feature2Title: "🚀 Evolução Rápida",
      feature2Text: "Aprenda com os melhores conteúdos gratuitos da internet.",
      feature3Title: "💬 Comunidade",
      feature3Text: "Entre no Discord da ZyroDev e evolua junto com outros devs.",
      communityTitle: "Uma comunidade 🇧🇷",
      communityText: "Mais que uma plataforma de estudos: a ZyroDev é uma comunidade de devs evoluindo juntos, trocando experiência no Discord.",
      communityButton: "Entrar no Discord",
      footerSocial: "Redes Sociais",
      footerLinks: "Links",
      footerHome: "Início",
      footerInfo: "Informações",
      footerCredits: "Créditos",
      footerAdmin: "Painel Admin",
      loginPrompt: "Crie sua conta Google",
      loginDescription: "Entre com sua conta para acessar seu perfil, salvar suas informações e aproveitar melhor a experiência na ZyroDev.",
      loginMain: "Entrar com Google",
      loginLater: "Agora não",
      cookieText: "🍪 Este site utiliza cookies para melhorar sua experiência no ZyroDev.",
      cookieButton: "Aceitar",
      siteName: "ZyroDev",
      adminPanel: "Painel Admin",
      pageTitle: "ZyroDev",
      about: "Sobre",
      credits: "Créditos",
      chat: "Bate Papo",
      login: "Login",
      enter: "Entrar",
      courses: "Cursos",
      community: "Comunidade",
      updates: "Atualizações",
      footer: "Rodapé",
      admin: "Admin",
      profile: "Perfil",
      search: "Buscar",
      notifications: "Notificações",
      languageLabel: "Idioma",
      themeLabel: "Tema",
      save: "Salvar",
      reset: "Resetar",
      storeName: "Loja",
      freeStoreEyebrow: "ZYRODEV STORE",
      freeStoreTitle: "Personalize seu <span>perfil.</span>",
      freeStoreDescription: "Escolha molduras, banners e fotos de perfil gratuitas. Adquira com um clique e depois escolha tudo no Editar perfil.",
      framesTitle: "Molduras",
      framesSubtitle: "Todas gratuitas para usar no seu perfil.",
      bannersTitle: "Banners",
      bannersSubtitle: "Fundos para deixar seu perfil com a sua identidade.",
      avatarsTitle: "Fotos de perfil",
      avatarsSubtitle: "Avatares gratuitos para escolher no Editar perfil.",
      freeStoreFooter: "Loja gratuita de personalização",
      freeTag: "GRÁTIS",
      freePrice: "GRÁTIS",
      owned: "Adquirido",
      acquireFree: "Adquirir gratuitamente",
      myProfile: "Meu perfil",
    },
    en: {
      navbarAbout: "About",
      navbarCredits: "Credits",
      navbarChat: "Chat",
      navbarLogin: "Login",
      heroTitle: "Learn to code for free with ZyroDev.",
      heroSubtitle: "practical methodology, direct and simple.",
      heroCTA: "Classes",
      statsTitle1: "Programming videos with constant updates",
      statsTitle2: "Technologies",
      statsTitle3: "Free Content",
      feature1Title: "📚 Organized Content",
      feature1Text: "Organized courses to make your programming journey easier.",
      feature2Title: "🚀 Fast Growth",
      feature2Text: "Learn from the best free content available online.",
      feature3Title: "💬 Community",
      feature3Text: "Join the ZyroDev Discord and grow alongside other developers.",
      communityTitle: "A community 🇧🇷",
      communityText: "More than a study platform: ZyroDev is a community of developers growing together and sharing experience on Discord.",
      communityButton: "Join Discord",
      footerSocial: "Social Media",
      footerLinks: "Links",
      footerHome: "Home",
      footerInfo: "Info",
      footerCredits: "Credits",
      footerAdmin: "Admin Panel",
      loginPrompt: "Create your Google account",
      loginDescription: "Sign in with your account to access your profile, save your information and enjoy a better experience on ZyroDev.",
      loginMain: "Sign in with Google",
      loginLater: "Not now",
      cookieText: "🍪 This site uses cookies to improve your experience on ZyroDev.",
      cookieButton: "Accept",
      siteName: "ZyroDev",
      adminPanel: "Admin Panel",
      pageTitle: "ZyroDev",
      about: "About",
      credits: "Credits",
      chat: "Chat",
      login: "Login",
      enter: "Enter",
      courses: "Courses",
      community: "Community",
      updates: "Updates",
      footer: "Footer",
      admin: "Admin",
      profile: "Profile",
      search: "Search",
      notifications: "Notifications",
      languageLabel: "Language",
      themeLabel: "Theme",
      save: "Save",
      reset: "Reset",
      storeName: "Store",
      freeStoreEyebrow: "ZYRODEV STORE",
      freeStoreTitle: "Customize your <span>profile.</span>",
      freeStoreDescription: "Choose free frames, banners and profile pictures. Get them with one click and then choose everything in Edit profile.",
      framesTitle: "Frames",
      framesSubtitle: "All free to use on your profile.",
      bannersTitle: "Banners",
      bannersSubtitle: "Backgrounds to give your profile its own identity.",
      avatarsTitle: "Profile pictures",
      avatarsSubtitle: "Free avatars to choose in Edit profile.",
      freeStoreFooter: "Free customization store",
      freeTag: "FREE",
      freePrice: "FREE",
      owned: "Owned",
      acquireFree: "Get for free",
      myProfile: "My profile",
    }
  };

  function deepMerge(base, incoming) {
    const out = Array.isArray(base) ? [...base] : { ...(base || {}) };
    if (!incoming || typeof incoming !== "object") return out;
    Object.keys(incoming).forEach((key) => {
      const oldValue = out[key];
      const newValue = incoming[key];
      if (oldValue && typeof oldValue === "object" && !Array.isArray(oldValue) && newValue && typeof newValue === "object" && !Array.isArray(newValue)) {
        out[key] = deepMerge(oldValue, newValue);
      } else {
        out[key] = newValue;
      }
    });
    return out;
  }

  function safeStorageGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function getBaseConfig() {
    const storedSite = safeStorageGet(STORAGE_KEYS.site, {});
    const storedFeatures = safeStorageGet(STORAGE_KEYS.features, {});
    const storedCustomColors = safeStorageGet(STORAGE_KEYS.customColors, {});
    const storedSocials = safeStorageGet(STORAGE_KEYS.socials, {});
    const storedSeo = safeStorageGet(STORAGE_KEYS.seo, {});
    const storedNavbar = safeStorageGet(STORAGE_KEYS.navbar, {});
    const storedLogin = safeStorageGet(STORAGE_KEYS.login, {});
    const storedCourses = safeStorageGet(STORAGE_KEYS.courses, {});
    const storedPreloader = safeStorageGet(STORAGE_KEYS.preloader, {});
    const storedAnimations = safeStorageGet(STORAGE_KEYS.animations, {});
    const storedCookie = safeStorageGet(STORAGE_KEYS.cookie, {});
    const storedAdmin = safeStorageGet(STORAGE_KEYS.admin, {});

    const merged = deepMerge(DEFAULT_CONFIG, storedSite);
    merged.features = deepMerge(DEFAULT_CONFIG.features, storedFeatures);
    merged.visual = deepMerge(DEFAULT_CONFIG.visual, storedCustomColors);
    merged.socials = deepMerge(DEFAULT_CONFIG.socials, storedSocials);
    merged.seo = deepMerge(DEFAULT_CONFIG.seo, storedSeo);
    merged.navbar = deepMerge(DEFAULT_CONFIG.navbar, storedNavbar);
    merged.login = deepMerge(DEFAULT_CONFIG.login, storedLogin);
    merged.courses = deepMerge(DEFAULT_CONFIG.courses, storedCourses);
    merged.preloader = deepMerge(DEFAULT_CONFIG.preloader, storedPreloader);
    merged.animations = deepMerge(DEFAULT_CONFIG.animations, storedAnimations);
    merged.cookies = deepMerge(DEFAULT_CONFIG.cookies, storedCookie);
    merged.admin = deepMerge(DEFAULT_CONFIG.admin, storedAdmin);

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.language);
    if (savedTheme) merged.theme = savedTheme;
    if (savedLanguage) merged.language = savedLanguage;

    return merged;
  }

  function getEffectiveConfig() {
    const cfg = getBaseConfig();
    const preset = THEME_PRESETS[cfg.theme] || THEME_PRESETS["dark-orange"];
    cfg.visual = deepMerge(preset, cfg.visual || {});
    cfg.seo = deepMerge(DEFAULT_CONFIG.seo, cfg.seo || {});
    cfg.site = deepMerge(DEFAULT_CONFIG.site, cfg.site || {});
    cfg.socials = deepMerge(DEFAULT_CONFIG.socials, cfg.socials || {});
    cfg.login = deepMerge(DEFAULT_CONFIG.login, cfg.login || {});
    cfg.courses = deepMerge(DEFAULT_CONFIG.courses, cfg.courses || {});
    cfg.admin = deepMerge(DEFAULT_CONFIG.admin, cfg.admin || {});
    cfg.preloader = deepMerge(DEFAULT_CONFIG.preloader, cfg.preloader || {});
    return cfg;
  }

  function saveInstanceConfig(cfg) {
    if (cfg.theme) localStorage.setItem(STORAGE_KEYS.theme, cfg.theme);
    if (cfg.language) localStorage.setItem(STORAGE_KEYS.language, cfg.language);
    safeStorageSet(STORAGE_KEYS.site, cfg.site || DEFAULT_CONFIG.site);
    safeStorageSet(STORAGE_KEYS.features, cfg.features || DEFAULT_CONFIG.features);
    safeStorageSet(STORAGE_KEYS.customColors, cfg.visual || DEFAULT_CONFIG.visual);
    safeStorageSet(STORAGE_KEYS.socials, cfg.socials || DEFAULT_CONFIG.socials);
    safeStorageSet(STORAGE_KEYS.seo, cfg.seo || DEFAULT_CONFIG.seo);
    safeStorageSet(STORAGE_KEYS.navbar, cfg.navbar || DEFAULT_CONFIG.navbar);
    safeStorageSet(STORAGE_KEYS.login, cfg.login || DEFAULT_CONFIG.login);
    safeStorageSet(STORAGE_KEYS.courses, cfg.courses || DEFAULT_CONFIG.courses);
    safeStorageSet(STORAGE_KEYS.preloader, cfg.preloader || DEFAULT_CONFIG.preloader);
    safeStorageSet(STORAGE_KEYS.animations, cfg.animations || DEFAULT_CONFIG.animations);
    safeStorageSet(STORAGE_KEYS.cookie, cfg.cookies || DEFAULT_CONFIG.cookies);
    safeStorageSet(STORAGE_KEYS.admin, cfg.admin || DEFAULT_CONFIG.admin);
    return true;
  }

  function applyTheme(cfg) {
    const root = document.documentElement;
    const colors = cfg.visual;
    const themeKey = cfg.theme || "dark-orange";
    const preset = THEME_PRESETS[themeKey] || THEME_PRESETS["dark-orange"];
    const visual = deepMerge(preset, colors || {});

    Object.entries({
      "--primary": visual.primary,
      "--secondary": visual.secondary,
      "--accent": visual.accent,
      "--text": visual.text,
      "--text-secondary": visual.textSecondary,
      "--bg": visual.background,
      "--card": visual.cards,
      "--panel": visual.panels,
      "--border": visual.borders,
      "--button": visual.buttons,
      "--button-hover": visual.buttonHover,
      "--link": visual.links,
      "--navbar": visual.navbar,
      "--footer": visual.footer,
      "--icon": visual.icons,
      "--heading": visual.headings,
      "--subtitle": visual.subtitles,
      "--opacity": visual.opacity,
      "--shadow": visual.shadow,
      "--border-width": visual.borderWidth,
      "--radius-card": visual.borderRadiusCard,
      "--radius-button": visual.borderRadiusButton,
      "--effect-intensity": visual.effectIntensity,
      "--animation-speed": visual.animationSpeed
    }).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    document.body?.setAttribute("data-theme", themeKey);
    document.body?.setAttribute("data-site-theme", themeKey);

    const lightThemes = ["light", "light-orange"];
    if (lightThemes.includes(themeKey)) {
      document.body.classList.add("theme-light");
    } else {
      document.body.classList.remove("theme-light");
    }
  }

  function applyLanguage(cfg) {
    const lang = cfg.language || "pt-BR";
    document.documentElement.lang = lang;
    const map = translations[lang] || translations["pt-BR"];
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.getAttribute("data-i18n");
      const text = map[key];
      if (text) {
        element.textContent = text;
      }
    });
    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const key = element.getAttribute("data-i18n-html");
      const value = map[key];
      if (value) {
        element.innerHTML = value;
      }
    });
    if (document.title && (lang === "en" || cfg.site.title)) {
      document.title = cfg.site.title || "ZyroDev";
    }
  }

  function applyFeatureVisibility(cfg) {
    const featureMap = {
      showNavbar: ".navbar",
      showHero: ".hero",
      showStats: ".stats",
      showCourses: ".course-card, .courses-section, .course-item",
      showCommunity: ".zr-community, .community-section",
      showFooter: ".footer",
      showCookies: ".cookie-box",
      showGooglePopup: "#googlePopup",
      showPreloader: "#preloader",
      showMotivationalPhrases: ".motivacao-area, #palavras",
      showUpdates: "#listaUpdates",
      showDiscord: "[href*='discord']",
      showSocialLinks: ".social-icons, .footer-social",
      showProfile: "#perfilLink, #headerNome",
      showLogin: "[href='login.html']",
      showSearch: ".search-box, .header-search",
      showNotifications: ".notification, .notif",
      showAdminButton: "#adminLink",
      showPartnerSection: ".partner-section, .partners",
      showFounderBadge: ".nome-fundador, .fundador-dourado",
      showVipBadge: ".vip-ativo, .vip-perola-negra, .vip-esmeralda"
    };

    Object.entries(featureMap).forEach(([key, selector]) => {
      const shouldShow = Boolean(cfg.features?.[key]);
      const nodes = document.querySelectorAll(selector);
      nodes.forEach((node) => {
        node.style.display = shouldShow ? "" : "none";
        node.hidden = !shouldShow;
      });
    });

    const nav = document.querySelector(".nav-links");
    if (nav) nav.style.display = cfg.features?.showNavbar === false ? "none" : "";
  }

  function applyAnimations(cfg) {
    const enabled = cfg.animations?.enabled !== false;
    const body = document.body;
    if (!body) return;
    body.classList.toggle("zyro-no-animations", !enabled);

    if (!enabled) {
      const style = document.createElement("style");
      style.id = "zyro-no-animations-style";
      style.textContent = `
        .zyro-no-animations *, .zyro-no-animations *::before, .zyro-no-animations *::after {
          animation: none !important;
          transition: none !important;
          scroll-behavior: auto !important;
          transform: none !important;
        }
      `;
      if (!document.getElementById(style.id)) {
        document.head.appendChild(style);
      }
    } else {
      const existing = document.getElementById("zyro-no-animations-style");
      if (existing) existing.remove();
    }
  }

  function applyPreloader(cfg) {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    if (cfg.preloader?.enabled === false) {
      preloader.style.display = "none";
      const siteWrapper = document.getElementById("siteWrapper");
      if (siteWrapper) siteWrapper.classList.add("site-in");
      return;
    }
    preloader.style.display = "block";
    preloader.style.setProperty("--preloader-color", cfg.preloader?.color || "#ff6a00");
    preloader.style.setProperty("--preloader-element-color", cfg.preloader?.elementColor || "#ff8533");
  }

  function applyCookies(cfg) {
    const cookieBox = document.getElementById("cookieBox");
    if (!cookieBox) return;
    const enabled = cfg.cookies?.showCookieBanner !== false;
    cookieBox.style.display = enabled ? "block" : "none";
    const textEl = cookieBox.querySelector(".cookie-text");
    const btn = cookieBox.querySelector(".cookie-btn");
    if (textEl) textEl.textContent = cfg.cookies?.cookieText || DEFAULT_CONFIG.cookies.cookieText;
    if (btn) btn.textContent = cfg.cookies?.cookieButtonText || DEFAULT_CONFIG.cookies.cookieButtonText;
  }

  function applyMetadata(cfg) {
    document.title = cfg.site?.title || cfg.seo?.title || DEFAULT_CONFIG.site.title;
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    if (description) description.setAttribute("content", cfg.seo?.description || cfg.site?.description || DEFAULT_CONFIG.seo.description);
    if (ogTitle) ogTitle.setAttribute("content", cfg.seo?.ogTitle || cfg.site?.title || DEFAULT_CONFIG.seo.ogTitle);
    if (ogDescription) ogDescription.setAttribute("content", cfg.seo?.ogDescription || cfg.site?.description || DEFAULT_CONFIG.seo.ogDescription);
    if (ogImage) ogImage.setAttribute("content", cfg.seo?.ogImage || DEFAULT_CONFIG.seo.ogImage);
    if (canonical && cfg.seo?.canonical) canonical.setAttribute("href", cfg.seo.canonical);
    document.documentElement.setAttribute("lang", cfg.language || "pt-BR");
  }

  function applySiteConfig() {
    const cfg = getEffectiveConfig();
    window.ZyroConfig = cfg;
    window.ZyroConfigAPI = {
      getConfig: getEffectiveConfig,
      saveConfig: saveInstanceConfig,
      apply: applySiteConfig,
      setTheme: function (theme) {
        const current = getEffectiveConfig();
        current.theme = theme;
        saveInstanceConfig(current);
        applySiteConfig();
      },
      setLanguage: function (language) {
        const current = getEffectiveConfig();
        current.language = language;
        saveInstanceConfig(current);
        applySiteConfig();
      }
    };

    applyTheme(cfg);
    applyLanguage(cfg);
    applyFeatureVisibility(cfg);
    applyAnimations(cfg);
    applyPreloader(cfg);
    applyCookies(cfg);
    applyMetadata(cfg);
    return cfg;
  }

  window.ZyroConfig = getEffectiveConfig();
  window.ZyroConfigAPI = {
    getConfig: getEffectiveConfig,
    saveConfig: saveInstanceConfig,
    apply: applySiteConfig,
    setTheme: function (theme) {
      const current = getEffectiveConfig();
      current.theme = theme;
      saveInstanceConfig(current);
      applySiteConfig();
    },
    setLanguage: function (language) {
      const current = getEffectiveConfig();
      current.language = language;
      saveInstanceConfig(current);
      applySiteConfig();
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", applySiteConfig);
    window.addEventListener("load", applySiteConfig);
  }
})();
