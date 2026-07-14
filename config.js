/* Tender Days — client configuration.
   These values are SAFE to expose in the browser and commit to GitHub.
   NEVER put the Stripe secret key, Stripe webhook secret, or Supabase
   service_role key here — those live only in Supabase → Edge Functions → Secrets. */
window.TENDER_CONFIG = {
  SUPABASE_URL: "https://mtbtjplrbwamemwybeyl.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10YnRqcGxyYndhbWVtd3liZXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5OTc2NTAsImV4cCI6MjA5OTU3MzY1MH0.IcWnrdSRj7l8Jv6hYJL3gXJAjkHhyAuCiZXRJgVFFEk"
};
