/* Tender Days — client configuration.
   These values are SAFE to expose in the browser and commit to GitHub.
   NEVER put the Stripe secret key, Stripe webhook secret, or Supabase
   service_role key here — those live only in Supabase → Edge Functions → Secrets. */
window.TENDER_CONFIG = {
  SUPABASE_URL: "https://kossvyzyhpkfzjungidh.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvc3N2eXp5aHBrZnpqdW5naWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODQwNzksImV4cCI6MjA5OTQ2MDA3OX0.kyF7DiQKV9pMnhiF0Fq0-WhI3X8Q_cddP0srBCgVwxY"
};
