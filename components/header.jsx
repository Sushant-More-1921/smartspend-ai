// header.jsx
"use client";
import React, { useState } from "react";
import Link from "next/link";
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

  return (
    <>
    <header className="fixed top-0 w-full bg-black/30 backdrop-blur-lg z-50 border-b border-purple-500/20">
      <nav className="container mx-auto px-3 py-3 flex items-center justify-between">
        
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center text-lg font-semibold tracking-tight">
          <img
            src="/logo-sm.png"
            alt="SmartSpend Ai Logo"
            className="w-8 h-8 rounded-full mr-2"
          />
          <span className="text-white">Smart</span>
          <span className="text-white">Spend Ai</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-5 text-white text-sm font-medium">
          <Link href="/" className="hover:text-purple-400">Home</Link>
          <Link href="/future-spend" className="hover:text-purple-400">Future Spend</Link>
          {/* <Link href="/reports" className="hover:text-purple-400">Monthly Reports</Link> */}
          {/* <Link href="/pricing" className="hover:text-purple-400">Feature 3</Link> */}
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-2">
          <SignedIn>
            <Link href="/dashboard">
              <Button className="px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow hover:opacity-90 rounded-full">
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button className="px-3 py-1 text-sm border border-purple-400 text-purple-400 hover:bg-purple-600/10 hover:text-white rounded-full">
                <PenBox size={16} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="outline"
                className="px-3 py-1 text-sm border-purple-500 text-purple-400 hover:bg-purple-600/10 hover:text-white rounded-full"
              >
                Login
              </Button>
            </SignInButton>
            <SignUpButton forceRedirectUrl="/dashboard">
              <Button className="px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow rounded-full hover:opacity-90">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-8 h-8 border-2 border-purple-500 shadow-md shadow-purple-500/40",
                },
              }}
            />
          </SignedIn>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white ml-2 p-2 rounded-md hover:bg-purple-600/20"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

     
    </header>
    {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute right-4 top-14 w-5/12 rounded-2xl bg-black/40 backdrop-blur-lg z-50 border mt-4 border-purple-400">
          <div className="flex flex-col items-center py-4 space-y-4 text-white text-sm font-medium">
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>About us</Link>
            <Link href="/products" onClick={() => setIsOpen(false)}>Products</Link>
            <Link href="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link href="/blog" onClick={() => setIsOpen(false)}>Blog</Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
