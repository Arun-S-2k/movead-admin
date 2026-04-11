import { createClient } from '@supabase/supabase-js'

const url = 'https://zdvowifsjuyolnsxasuq.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkdm93aWZzanV5b2xuc3hhc3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDc0NDEsImV4cCI6MjA5MDI4MzQ0MX0.Y2H0fFX6yK31wxwbsTLJZaaLiHKbNe6uIkRevgyyvKU'

export const supabase = createClient(url, key)