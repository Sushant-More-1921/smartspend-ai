// header.jsx
import React from "react";
import Link from "next/link";
import { PenBox, LayoutDashboard } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-black/30 backdrop-blur-lg z-50 border-b border-purple-500/20">
      <nav className="container mx-auto px-3 py-4 flex items-center justify-between">
        
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center text-xl font-bold tracking-wide">
          <img
            src="/logo-sm.png"
            alt="SmartSpend Ai Logo"
            className="w-9 h-9 rounded-full mr-2" // reduced margin-right
          />
          <span className="text-white">Smart</span>
          <span className="text-white">Spend</span>
          <span className="ml-2 text-white">
            Ai
          </span>
        </Link>


        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <SignedIn>
            <Link href="/dashboard">
              <Button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:opacity-90 transition rounded-full">
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-purple-400 text-purple-400 hover:bg-purple-600/10 hover:text-white transition rounded-full">
                <PenBox size={16} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="outline"
                className="px-3 py-1.5 text-sm border-purple-500 text-purple-400 hover:bg-purple-600/10 hover:text-white transition rounded-full"
              >
                Login
              </Button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/dashboard">
              <Button className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md rounded-full hover:opacity-90 transition">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-9 h-9 border-2 border-purple-500 shadow-md shadow-purple-500/50",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
