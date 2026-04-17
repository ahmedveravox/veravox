import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.muwazafi.app",
  appName: "موظفي",
  // Points to the deployed web URL - the app wraps the live site
  server: {
    url: "https://veravox.vercel.app",
    cleartext: false,
  },
  android: {
    backgroundColor: "#0a0f1e",
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0a0f1e",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0a0f1e",
    },
  },
};

export default config;
