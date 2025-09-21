// import { createClient } from '@supabase/supabase-js'
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const SUPABASE_URL = "https://xlwenykwcfwyvcvoceaq.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhsd2VueWt3Y2Z3eXZjdm9jZWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI5MjE4NDQsImV4cCI6MjAyODQ5Nzg0NH0.MVfirgXyFO55TMy_LzU5YM97nIMbGa7lYOIAImaGm98";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON);

module.exports = supabaseClient;
