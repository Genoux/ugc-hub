export const ROUTES = {
  adminHome: "/projects",
  creatorHome: "/creator",
  apply: "/apply",
  signIn: "/sign-in",
  signUp: "/sign-up",
  signOut: "/sign-out",
  creatorProfile: (id: string) => `/database/${id}`,
} as const;
