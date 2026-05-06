"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";

import { useAuth } from "@/providers/auth/useAuth";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

const initialFromEmail = (email: string | undefined): string => {
  if (!email) return "?";
  const [local] = email.split("@");
  return (local || email).slice(0, 2).toUpperCase();
};

const truncate = (value: string, max: number): string =>
  value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;

const compactEmail = (email: string | undefined): string => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return truncate(email, 22);
  return `${truncate(local, 10)}@${domain}`;
};

export function UserMenu() {
  const auth = useAuth();
  const user = auth?.user;

  if (!user) return null;

  const isAdmin = user.roles?.includes("admin") ?? false;
  const rawDisplay =
    user.username?.trim() ||
    user.email?.split("@")[0] ||
    user.email ||
    "Account";
  const display = truncate(rawDisplay, 14);
  const email = compactEmail(user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group inline-flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Open profile menu"
      >
        <Avatar className="h-8 w-8 border border-white/20 transition-colors group-hover:border-white/60">
          <AvatarFallback className="text-[9px] tracking-[0.18em]">
            {initialFromEmail(user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-52"
      >
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 px-2.5 py-2">
            <Avatar className="h-6 w-6 border border-white/20">
              <AvatarFallback className="text-[8px] tracking-[0.18em]">
                {initialFromEmail(user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[10px] font-medium uppercase tracking-[0.15em] text-white">
                {display}
              </span>
              <div className="flex items-center gap-1">
                <span className="truncate text-[9px] text-white/40 normal-case tracking-normal">
                  {email}
                </span>
                {isAdmin ? (
                  <span className="shrink-0 text-[8px] uppercase tracking-[0.18em] text-white/55">
                    · Admin
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
            }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, x: 6 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <UserIcon className="h-3 w-3" />
                  Profile
                </Link>
              </DropdownMenuItem>
            </motion.div>

            {isAdmin ? (
              <motion.div
                variants={{ hidden: { opacity: 0, x: 6 }, visible: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.2 }}
              >
                <DropdownMenuItem asChild>
                  <Link href="/admin/cars" className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" />
                    Admin
                  </Link>
                </DropdownMenuItem>
              </motion.div>
            ) : null}

            <DropdownMenuSeparator />

            <motion.div
              variants={{ hidden: { opacity: 0, x: 6 }, visible: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.2 }}
            >
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => auth?.logout()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </DropdownMenuItem>
            </motion.div>
          </motion.div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
