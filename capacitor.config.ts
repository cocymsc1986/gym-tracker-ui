import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cocymsc1986.gymtracker",
  appName: "Gym Tracker",
  webDir: "build/client",
  server: {
    // Allow navigation to any path (for client-side routing)
    allowNavigation: ["*"],
    // Handle 404s by serving index.html
    errorPath: "index.html",
  },
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;
