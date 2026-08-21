import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cxbycszyfatqxktriawq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4Ynljc3p5ZmF0cXhrdHJpYXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNjI4MDYsImV4cCI6MjEwMjczODgwNn0.SDbbafc84hmdNXQbKGtI4A2ZcfxGoyagbPjGttzjvf4";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Testing Email/Password Signup...");
  const email = `aabhaskhates+test${Date.now()}@gmail.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: "TestPassword123!",
  });
  
  if (error) {
    console.error("SIGNUP ERROR:", error.message);
  } else {
    console.log("SIGNUP SUCCESS:", data.user?.email);
  }
}
run();
