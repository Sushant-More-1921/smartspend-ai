"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 shadow-md p-6 sm:p-7">
        
        {/* Brand Header */}
        <div className="text-center mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group hover:opacity-90 transition-opacity mb-2"
          >
            <span className="text-lg font-extrabold tracking-tight text-black">
              SmartSpend <span className="text-black">AI</span>
            </span>
          </Link>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Sign in to understand your spending, track your financial goals, and make smarter money decisions.
          </p>
        </div>

        {/* Clerk Sign In Form with Predesign Stripped */}
        <div className="w-full">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            forceRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorPrimary: "#2563eb",
                colorText: "#0f172a",
                colorTextSecondary: "#64748b",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#0f172a",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
              },
              elements: {
                rootBox: "!w-full !h-80",
                cardBox: "!w-full !shadow-none !border-0 !p-0 !bg-transparent",
                card: "!w-full !bg-transparent !shadow-none !p-10 !border-none",
                header: "!hidden",
                headerTitle: "!hidden",
                headerSubtitle: "!hidden",
                footer: "!hidden",
                footerAction: "!hidden",
                form: "!space-y-3",
                formButtonPrimary:
                  "!w-full !bg-blue-600 hover:!bg-blue-700 active:!bg-blue-800 !text-white !font-semibold !py-2.5 !px-4 !rounded-xl !text-xs sm:!text-sm !shadow-xs !transition-all focus:!ring-2 focus:!ring-blue-500/20 disabled:!opacity-50",
                formFieldInput:
                  "!w-full !bg-white !border !border-slate-300 !text-slate-900 !rounded-xl focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-500/10 !text-xs sm:!text-sm !py-2.5 !px-3.5 !transition-colors placeholder:!text-slate-400",
                formFieldLabel: "!text-xs !font-semibold !text-slate-700 !mb-1",
                formFieldErrorText: "!text-xs !text-rose-600 !font-medium !mt-1",
                formFieldAction: "!text-xs !text-blue-600 hover:!text-blue-700 !font-semibold",
                identityPreviewText: "!text-xs !font-medium !text-slate-700",
                identityPreviewEditButton: "!text-xs !text-blue-600 hover:!text-blue-700 !font-semibold",
                socialButtonsBlockButton:
                  "!w-full !bg-white hover:!bg-slate-50 !border !border-slate-200 !text-slate-700 !text-xs !py-2.5 !px-3 !rounded-xl !transition-all !shadow-2xs !font-semibold !flex !items-center !justify-center !gap-2 hover:!border-slate-300",
                socialButtonsBlockButtonText: "!font-semibold !text-xs !text-slate-700",
                dividerLine: "!bg-slate-200",
                dividerText: "!text-[11px] !text-slate-400 !font-medium !uppercase !tracking-wider",
              },
            }}
          />
        </div>

        {/* Custom Supporting Text Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            New to SmartSpend AI?{" "}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Create an account.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
