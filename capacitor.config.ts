// @ts-nocheck
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.jstyp.kiosk',
  appName: 'JSTYP.me',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  backgroundColor: '#111827',
  plugins: {
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;