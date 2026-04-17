const config = {
  appId: "io.muwazafi.app",
  appName: "موظفي",
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
