import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/server";
import { logout } from "@/app/(auth)/actions";

export const Navbar = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex items-center p-4">
      <MobileSidebar />
      <div className="flex w-full justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <Avatar>
              {/* Add avatarUrl from meta processing later if available */}
              <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-xs text-slate-500 font-medium">
              {user?.email}
            </div>
            <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <form action={logout}>
              <DropdownMenuItem render={<button type="submit" className="w-full text-left text-red-500 cursor-pointer" />}>
                Log out
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
