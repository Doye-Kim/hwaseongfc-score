import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on) {
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

      const {
        seedActiveGame,
        clearCollection,
        seedAdminUser,
        getCustomToken,
      } = require('./cypress/support/firebase');

      on('task', {
        seedActiveGame: (gameId: string) =>
          seedActiveGame(gameId).then(() => null),
        clearCollection: (name: string) =>
          clearCollection(name).then(() => null),
        seedAdminUser: (uid: string) =>
          seedAdminUser(uid).then(() => null),
        getCustomToken: (uid: string) =>
          getCustomToken(uid),
      });
    },
  },
});
