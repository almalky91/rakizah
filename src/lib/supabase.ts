// Supabase client has been removed as part of the migration to NextAuth and Drizzle ORM
// This file is kept for backwards compatibility but the export is no longer available
// Components using this should be migrated to use the API client from @/lib/api-client

// Temporary stub to prevent import errors during migration
export const supabase = {
  from: () => {
    throw new Error('Supabase client has been removed. Please use the API client from @/lib/api-client instead.');
  },
  auth: {
    signIn: () => {
      throw new Error('Supabase auth has been removed. Please use NextAuth from @/contexts/AuthContext instead.');
    },
    signOut: () => {
      throw new Error('Supabase auth has been removed. Please use NextAuth from @/contexts/AuthContext instead.');
    },
    signUp: () => {
      throw new Error('Supabase auth has been removed. Please use NextAuth from @/contexts/AuthContext instead.');
    },
  },
};
