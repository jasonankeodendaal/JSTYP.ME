// @ts-nocheck
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.jstyp.kiosk',
  appName: 'DIGITAL STORE DISPLAY',
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