import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on) {
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

      const {
        seedActiveGame,
        clearCollection,
      } = require('./cypress/support/firebase');

      on('task', {
        seedActiveGame: (gameId: string) =>
          seedActiveGame(gameId).then(() => null),
        clearCollection: (name: string) =>
          clearCollection(name).then(() => null),
      });
    },
  },
});
