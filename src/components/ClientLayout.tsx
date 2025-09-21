"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
                GitGuide
              </h1>
            </div>
            
            {/* Auth Section */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton>
                  <button className="text-gray-200 hover:text-white font-medium transition-colors duration-200">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-white text-purple-700 px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
