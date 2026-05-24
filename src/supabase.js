import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fxctjprzgudemofmmnnh.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3RqcHJ6Z3VkZW1vZm1tbm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDA0MjIsImV4cCI6MjA5NDg3NjQyMn0.S0ugUsR0pHk1cuzzD5DFVeFD93nFWheK8vVo2d4C9tk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)