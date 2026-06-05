
const SUPABASE_URL = 'https://whmtcydjksujvgxbbtfy.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobXRjeWRqa3N1anZneGJidGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzI5NDEsImV4cCI6MjA5NDcwODk0MX0.i03iwv2v-msmEphjf-qNH6qkanD83pnt82K3XnVKR90';

window.supabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log('Supabase inicializado');