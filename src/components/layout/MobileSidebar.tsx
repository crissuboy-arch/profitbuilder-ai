"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";

export const MobileSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-slate-900 border-none text-white">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
