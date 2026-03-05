"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { Button } from "@/shared/components/ui/button";
import { EASING_FUNCTION } from "@/shared/lib/constant";
import { CreatorProfileInfo } from "./_components/creator-profile-info";

interface CreatorSidebarProps {
  creator: CreatorProfile;
  sidebarOpen?: boolean;
  onClose?: () => void;
}

export function CreatorSidebar({ creator, sidebarOpen = false, onClose }: CreatorSidebarProps) {
  return (
    <>
      {/* Mobile: absolute overlay panel, slides in over the content */}
      <motion.div
        className="sm:hidden absolute inset-y-0 left-0 z-10 w-80 flex flex-col bg-background border-r border-border shadow-xl"
        initial={{ x: "-100%" }}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ duration: 0.2, ease: EASING_FUNCTION.exponential }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
          <CreatorProfileInfo creator={creator} />
        </div>
      </motion.div>

      {/* Desktop: inline sidebar */}
      <div className="hidden sm:block w-80 shrink-0 border-r border-border overflow-y-auto">
        <CreatorProfileInfo creator={creator} />
      </div>
    </>
  );
}
