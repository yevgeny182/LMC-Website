import {createClient} from '@supabase/supabase-js'

const supabaseUrl = 'https://uzlgueehgzteclzzltoe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGd1ZWVoZ3p0ZWNsenpsdG9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNDczMTMsImV4cCI6MjA2NzcyMzMxM30.gHsjNrPxGzLUmNsb-B0anusXke0lfoyli4oZauz7L4o'

export const supabase = createClient(supabaseUrl, supabaseKey)