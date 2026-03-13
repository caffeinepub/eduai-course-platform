export interface ThemeConfig {
  name: string;
  primaryColor: string;
  accentColor: string;
  heroBgFrom: string;
  heroBgTo: string;
  bannerText: string;
  emoji: string;
  bannerBg: string;
}

export function getSeasonalTheme(): ThemeConfig {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // New Year's Day
  if (month === 1 && day === 1) {
    return {
      name: "new-year",
      primaryColor: "oklch(0.82 0.15 85)",
      accentColor: "oklch(0.88 0.05 100)",
      heroBgFrom: "#1a1500",
      heroBgTo: "#2d2800",
      bannerText: "Happy New Year! Start your learning journey!",
      emoji: "🎆",
      bannerBg: "linear-gradient(90deg, #3d3200, #5c4c00, #3d3200)",
    };
  }

  // Republic Day (India)
  if (month === 1 && day === 26) {
    return {
      name: "republic-day",
      primaryColor: "oklch(0.68 0.2 40)",
      accentColor: "oklch(0.55 0.18 150)",
      heroBgFrom: "#1a0800",
      heroBgTo: "#001a0d",
      bannerText: "Jai Hind! Happy Republic Day!",
      emoji: "🇮🇳",
      bannerBg: "linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)",
    };
  }

  // Valentine's Day
  if (month === 2 && day === 14) {
    return {
      name: "valentines",
      primaryColor: "oklch(0.62 0.24 10)",
      accentColor: "oklch(0.75 0.2 350)",
      heroBgFrom: "#1a0010",
      heroBgTo: "#2a0018",
      bannerText: "Spread the love of learning! ❤️",
      emoji: "❤️",
      bannerBg: "linear-gradient(90deg, #4a0020, #8b0040, #4a0020)",
    };
  }

  // Holi
  if (month === 3 && day >= 1 && day <= 20) {
    return {
      name: "holi",
      primaryColor: "oklch(0.72 0.22 310)",
      accentColor: "oklch(0.78 0.2 45)",
      heroBgFrom: "#150030",
      heroBgTo: "#300015",
      bannerText: "Happy Holi! Colors of knowledge!",
      emoji: "🎨",
      bannerBg:
        "linear-gradient(90deg, #ff6b35, #f7c59f, #efefd0, #004e89, #1a936f)",
    };
  }

  // Independence Day (India)
  if (month === 8 && day === 15) {
    return {
      name: "independence-day",
      primaryColor: "oklch(0.68 0.2 40)",
      accentColor: "oklch(0.55 0.18 150)",
      heroBgFrom: "#1a0800",
      heroBgTo: "#001a0d",
      bannerText: "Happy Independence Day! Jai Hind!",
      emoji: "🇮🇳",
      bannerBg: "linear-gradient(90deg, #ff9933 0%, #ffffff 50%, #138808 100%)",
    };
  }

  // Navratri
  if (month === 10 && day >= 2 && day <= 10) {
    return {
      name: "navratri",
      primaryColor: "oklch(0.72 0.22 40)",
      accentColor: "oklch(0.8 0.18 70)",
      heroBgFrom: "#1f0800",
      heroBgTo: "#2d1500",
      bannerText: "Navratri Greetings! Learn and celebrate!",
      emoji: "🪔",
      bannerBg:
        "linear-gradient(90deg, #8b1a00, #c84b00, #f5a623, #c84b00, #8b1a00)",
    };
  }

  // Halloween
  if (month === 10 && day === 31) {
    return {
      name: "halloween",
      primaryColor: "oklch(0.72 0.22 50)",
      accentColor: "oklch(0.3 0.02 265)",
      heroBgFrom: "#0d0500",
      heroBgTo: "#1a0a00",
      bannerText: "Spooky Learning Season! 🎃",
      emoji: "🎃",
      bannerBg: "linear-gradient(90deg, #1a0500, #3d1c00, #1a0500)",
    };
  }

  // Diwali
  if (month === 11 && day >= 1 && day <= 15) {
    return {
      name: "diwali",
      primaryColor: "oklch(0.8 0.17 80)",
      accentColor: "oklch(0.65 0.18 285)",
      heroBgFrom: "#1a1000",
      heroBgTo: "#100020",
      bannerText: "Happy Diwali! Festival of Knowledge!",
      emoji: "🪔",
      bannerBg:
        "linear-gradient(90deg, #2d1f00, #5c4000, #8b6200, #5c4000, #2d1f00)",
    };
  }

  // Christmas
  if (month === 12 && day === 25) {
    return {
      name: "christmas",
      primaryColor: "oklch(0.58 0.22 25)",
      accentColor: "oklch(0.55 0.18 150)",
      heroBgFrom: "#0d0000",
      heroBgTo: "#001a0d",
      bannerText: "Merry Christmas! Keep learning!",
      emoji: "🎄",
      bannerBg:
        "linear-gradient(90deg, #8b0000, #ffffff20, #006400, #ffffff20, #8b0000)",
    };
  }

  // New Year's Eve
  if (month === 12 && day === 31) {
    return {
      name: "nye",
      primaryColor: "oklch(0.82 0.15 85)",
      accentColor: "oklch(0.88 0.05 100)",
      heroBgFrom: "#1a1500",
      heroBgTo: "#2d2800",
      bannerText: "Countdown to New Year! Last chance to learn!",
      emoji: "🥂",
      bannerBg: "linear-gradient(90deg, #2d2800, #5c5000, #2d2800)",
    };
  }

  // Default
  return {
    name: "default",
    primaryColor: "oklch(0.65 0.18 168)",
    accentColor: "oklch(0.78 0.16 75)",
    heroBgFrom: "#0b1a2e",
    heroBgTo: "#0d2b1e",
    bannerText: "Learn anything. Grow everyday.",
    emoji: "🎓",
    bannerBg:
      "linear-gradient(90deg, oklch(0.18 0.04 265), oklch(0.22 0.06 168), oklch(0.18 0.04 265))",
  };
}

export function applySeasonalTheme(theme: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty("--seasonal-hero-from", theme.heroBgFrom);
  root.style.setProperty("--seasonal-hero-to", theme.heroBgTo);
}
