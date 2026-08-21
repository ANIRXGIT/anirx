import { execSync } from 'child_process';
const url = 'https://cxbycszyfatqxktriawq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Ynljc3p5ZmF0cXhrdHJpYXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNjI4MDYsImV4cCI6MjEwMjczODgwNn0.SDbbafc84hmdNXQbKGtI4A2ZcfxGoyagbPjGttzjvf4';
execSync('npx vercel env add VITE_SUPABASE_URL production', { input: url });
execSync('npx vercel env add VITE_SUPABASE_ANON_KEY production', { input: key });

