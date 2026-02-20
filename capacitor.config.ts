import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mx.quetzart.app',
  appName: 'Quetzart',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    }
  }
  // webDir: 'www',
  // "server": {
  //   "url": "http://192.168.100.16:4200",
  //   "cleartext": true
  // },
};

export default config;
