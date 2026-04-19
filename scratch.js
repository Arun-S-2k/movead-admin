import { createClient } from '@supabase/supabase-js'

const url = 'https://zdvowifsjuyolnsxasuq.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpkdm93aWZzanV5b2xuc3hhc3VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDc0NDEsImV4cCI6MjA5MDI4MzQ0MX0.Y2H0fFX6yK31wxwbsTLJZaaLiHKbNe6uIkRevgyyvKU'

const supabase = createClient(url, key)

async function test() {
  const { data, error } = await supabase.from('photo_uploads').select('*').limit(5);
  console.log(error ? error : data);
}
test();
