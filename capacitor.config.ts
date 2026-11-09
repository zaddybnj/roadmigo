import type { CapacitorConfig } from '@capacitor/cli';

// By default the native iOS/Android app bundles the built web app from `dist/`
// (run `npm run build && npx cap sync` before building in Xcode/Android Studio).
//
// For live-reload development against a running dev server or the Lovable
// preview, set CAP_SERVER_URL when syncing, e.g.:
//   CAP_SERVER_URL=http://192.168.1.20:8080 npx cap sync
// Never ship a store build with CAP_SERVER_URL set.
const devServerUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'app.roadmigo',
  appName: 'Roadmigo',
  webDir: 'dist',
  ...(devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: devServerUrl.startsWith('http://'),
        },
      }
    : {}),
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
