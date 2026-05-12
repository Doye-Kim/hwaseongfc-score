import { connectAuthEmulator, getAuth, signInWithCustomToken } from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

if (process.env.REACT_APP_USE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  (window as any).__signInWithCustomToken = (token: string) =>
    signInWithCustomToken(auth, token);
}
