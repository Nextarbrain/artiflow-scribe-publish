// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iibrrqrdntitlazuvazz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpYnJycXJkbnRpdGxhenV2YXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzAzNjYsImV4cCI6MjA2NDUwNjM2Nn0.RY2o7c4k97siLGtZAGjwSyqi5uS6sH-tThRqrKTOYlc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);