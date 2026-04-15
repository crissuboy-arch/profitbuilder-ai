import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { NavbarControls } from "@/components/layout/NavbarControls";
import { createClient } from "@/utils/supabase/server";

export const Navbar = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";
  const avatarUrl   = user?.user_metadata?.avatar_url || "";

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <MobileSidebar />
      <div className="flex-1" />
      <NavbarControls
        userEmail={user?.email}
        userInitial={userInitial}
        avatarUrl={avatarUrl}
      />
    </header>
  );
};
