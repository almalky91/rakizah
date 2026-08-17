import 'next-auth';

declare module 'next-auth' {
  /**
   * Extended User interface with role field
   * Used during authentication to include user role from database
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  }

  /**
   * Extended Session interface with user role
   * Available on the client side via useSession() hook
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extended JWT interface with id and role fields
   * Used in JWT strategy for session management
   */
  interface JWT {
    id: string;
    role: string;
  }
}
