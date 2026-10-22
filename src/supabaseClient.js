import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uptgizysjangwwcljstw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdGdpenlzamFuZ3d3Y2xqc3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2Nzg3NDYsImV4cCI6MjEwODI1NDc0Nn0.m_MZyWR8nZMmdfqaaaMs4RdKw7nhM6tXsZHpmzEpqx0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);