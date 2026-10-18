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
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "About", href: "/#about" },
  ];

  return (
    <>
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-200/80 shadow-xs">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <Link
            href="/"
            prefetch={true}
            className="flex items-center text-lg font-bold tracking-tight shrink-0 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo-sm.png"
              alt="SmartSpend AI Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg mr-2.5 object-cover"
              priority
            />
            <span className="text-black font-extrabold tracking-tight">SmartSpend</span>
            <span className="text-black font-extrabold ml-1">AI</span>
          </Link>

          {/* Clean Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/70 border border-slate-200/60 p-1 rounded-xl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-blue-600 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <SignedIn>
              <Link href="/dashboard" prefetch={true}>
                <Button className="gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors">
                  <LayoutDashboard size={14} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Link href="/transaction/create" prefetch={true}>
                <Button
                  variant="outline"
                  className="gap-1.5 px-3.5 py-1.5 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <PenBox size={14} />
                  <span className="hidden sm:inline">Add Transaction</span>
                </Button>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button
                  variant="outline"
                  className="px-3.5 py-1.5 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton forceRedirectUrl="/dashboard">
                <Button className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors">
                  Get Started Free
                </Button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  variables: {
                    colorBackground: "#ffffff",
                    colorText: "#0f172a",
                    colorTextSecondary: "#64748b",
                    colorInputBackground: "#ffffff",
                    colorInputText: "#0f172a",
                  },
                  elements: {
                    avatarBox:
                      "w-8 h-8 rounded-lg border border-slate-200 hover:ring-2 hover:ring-blue-500/20 transition-all",
                    userButtonPopoverCard:
                      "!bg-white !text-slate-900 shadow-lg border border-slate-200 rounded-xl",
                    userButtonPopoverActionButton:
                      "!text-slate-700 hover:!bg-slate-50 transition-colors",
                    userButtonPopoverActionButtonText:
                      "!text-slate-900 font-medium",
                    userButtonPopoverActionButtonIcon:
                      "!text-slate-600",
                    userButtonPopoverFooter:
                      "!bg-slate-50 border-t border-slate-100",
                  },
                }}
              />
            </SignedIn>

            {/* Mobile Hamburger Menu Trigger */}
            <button
              className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-md">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                prefetch={true}
                onClick={() => setIsOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <SignedIn>
                <Link
                  href="/dashboard"
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold py-2">
                    <LayoutDashboard size={14} />
                    <span>Go to Dashboard</span>
                  </Button>
                </Link>
                <Link
                  href="/transaction/create"
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-slate-300 text-slate-700 rounded-lg text-xs font-semibold py-2"
                  >
                    <PenBox size={14} />
                    <span>Add Transaction</span>
                  </Button>
                </Link>
              </SignedIn>

              <SignedOut>
                <SignInButton forceRedirectUrl="/dashboard">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 rounded-lg text-xs font-semibold py-2"
                  >
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton forceRedirectUrl="/dashboard">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold py-2 shadow-xs">
                    Get Started Free
                  </Button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
