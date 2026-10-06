"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MarketingNav } from "@/components/navigation/marketing-nav";
import { useScroll } from "@/animations/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MarketingHeader() {
  const scrolled = useScroll(20);

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8 md:gap-12">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-semibold tracking-tight">
              Hackathon
            </span>
          </Link>
          <MarketingNav />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "font-medium text-foreground/80 hover:text-foreground")}>
                  Log In
              </Link>
              <Link href="/register" className={cn(buttonVariants({ size: "sm" }), "font-medium px-6 shadow-sm")}>
                  Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mr-2")}>
                  Dashboard
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            </SignedIn>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))} aria-label="Menu">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/about" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
                  <Link href="/features" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
                  <Link href="/pricing" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
                  <hr className="my-4" />
                  <SignedOut>
                    <Link href="/login" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">Log In</Link>
                    <Link href="/register" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">Get Started</Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                    <div className="mt-4">
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
