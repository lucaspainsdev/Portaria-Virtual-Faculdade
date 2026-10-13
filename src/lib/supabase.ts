import { createBrowserClient } from '@supabase/ssr'

// Singleton para uso em Client Components (Header, Sidebar, etc.)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
