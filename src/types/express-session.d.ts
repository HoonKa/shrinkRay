import 'express-session';

declare module 'express-session' {
  export interface Session {
    clearSession(): Promise<void>; // DO NOT MODIFY THIS!

    authenticatedUser: {
      userId: string;
      isPro: true;
      isAdmin: true;
      username: string;
    };

    // NOTES: Add your app's custom session properties here:
  }
}
