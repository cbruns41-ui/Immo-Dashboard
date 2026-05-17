// src/supabase/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bgxxbgbqsedfddtzbnhr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJneHhiZ2Jxc2VkZmRkdHpibmhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Njg3MTEsImV4cCI6MjA5NDQ0NDcxMX0.7khkEyHZpO0Ownl-o_U2gpnX0wVQXVROqCQbYU-_Jvs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)