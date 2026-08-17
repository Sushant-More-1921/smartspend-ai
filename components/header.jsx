// header.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PenBox, LayoutDashboard, Menu, X } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Future Spend", href: "/future-spend" },
    { name: "Smart Budget", href: "/smart-budget" },
    { name: "Monthly Reports", href: "/reports" },
    { name: "Know More", href: "/know-more" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full bg-[#090314]/90 backdrop-blur-xl z-50 border-b border-purple-500/20 shadow-[0_4px_25px_rgba(147,51,234,0.15)]">
        <nav className="w-full px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Left Corner: Brand Logo */}
          <Link href="/" prefetch={true} className="flex items-center text-lg font-semibold tracking-tight mr-6 md:mr-10 shrink-0 hover:opacity-90 transition-opacity">
            <Image
              src="/logo-sm.png"
              alt="SmartSpend Ai Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-full mr-2"
              priority
            />
            <span className="text-white">Smart</span>
            <span className="text-white ml-1">Spend Ai</span>
          </Link>

          {/* Middle: Single-Row Floating Glass Navigation Capsule */}
          <div className="hidden md:flex items-center gap-1 bg-[#160a2c]/85 border border-purple-500/30 px-3 py-1 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold"
                      : "text-gray-300 hover:text-white hover:bg-purple-600/30 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Action Buttons in Single Row */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <SignedIn>
              <Link href="/dashboard" prefetch={true}>
                <Button className="gap-1.5 px-3.5 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] hover:scale-105 transition-all rounded-full border border-purple-400/30">
                  <LayoutDashboard size={14} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/transaction/create" prefetch={true}>
                <Button variant="outline" className="gap-1.5 px-3.5 py-1 text-xs font-semibold border-purple-400/50 text-black hover:bg-purple-600/20 hover:text-white hover:border-purple-300 hover:scale-105 rounded-full transition-all backdrop-blur-sm">
                  <PenBox size={14} />
                  <span className="hidden sm:inline">Add Transaction</span>
                </Button>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button
                  variant="outline"
                  className="px-3.5 py-1 text-xs font-semibold border-purple-500/50 text-purple-300 hover:bg-purple-600/20 hover:text-white hover:scale-105 rounded-full transition-all"
                >
                  Login
                </Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/dashboard">
                <Button className="px-4 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 hover:scale-105 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] rounded-full transition-all">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-8 h-8 border-2 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.5)] hover:scale-110 transition-transform",
                  },
                }}
              />
            </SignedIn>

            {/* Mobile Hamburger Menu Trigger */}
            <button
              className="md:hidden text-white p-1.5 rounded-full hover:bg-purple-600/25 border border-purple-500/30 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Glass Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden fixed top-14 right-4 w-60 rounded-2xl bg-[#0e051f]/95 border border-purple-500/30 backdrop-blur-2xl z-50 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                      : "text-gray-300 hover:bg-purple-600/20 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
