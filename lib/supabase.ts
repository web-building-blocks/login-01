import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,       // ✅ 禁用 Supabase 自动写 cookie
      autoRefreshToken: true,      // ✅ 保留自动刷新 token（你已手动 setSession）
    },
  }
);
