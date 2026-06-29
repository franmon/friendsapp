// app.config.js
// Reemplaza a app.json. La key de Google Maps se inyecta por variable de entorno
// (EXPO_PUBLIC_GOOGLE_MAPS_KEY) y NUNCA se escribe literal en este archivo ni en el repo.

export default {
  expo: {
    name: "Despedida Jordan",
    slug: "BachelorApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "bachelorapp",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        // foregroundImage original comentado; se usa el icono genérico:
        foregroundImage: "./assets/icon.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      package: "com.franmon.sharetrip",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission: "La app necesita acceso a tus fotos.",
          cameraPermission: "La app necesita la cámara para tomar fotos del viaje.",
        },
      ],
      [
        "expo-notifications",
        {
          color: "#6C63FF",
        },
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "La app usa tu ubicación para geolocalizar las fotos.",
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "af011023-35a6-4ca2-a999-59e9408a7002",
      },
    },
  },
};
