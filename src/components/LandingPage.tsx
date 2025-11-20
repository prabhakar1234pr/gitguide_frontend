import {
  SignInButton,
  SignUpButton,
} from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative z-10">
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-16 max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="relative inline-block">
              <h1 className="text-8xl md:text-9xl font-black uppercase tracking-tighter">
                <span className="neon-text neon-pulse">GIT</span>
                <span className="neon-text-magenta">GUIDE</span>
              </h1>
              <div className="absolute -top-3 -left-3 text-8xl md:text-9xl font-black uppercase tracking-tighter opacity-10 text-[#00f0ff] -z-10">
                GITGUIDE
              </div>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#ff006e] to-[#ffbe0b]"></div>
            </div>
            
            <p className="text-xl md:text-2xl text-[#94a3b8] max-w-4xl mx-auto leading-relaxed font-light">
              <span className="text-[#00f0ff]">{'//'} </span>
              Transform GitHub repositories into 
              <span className="text-[#ff006e] font-semibold"> neural learning paths</span>
              <br />
              <span className="text-[#00f0ff]">{'//'} </span>
              Master code with 
              <span className="text-[#ffbe0b] font-semibold"> AI-powered guidance </span>
              tailored to your skill level
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="cyber-card p-8 group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00f0ff]/20 to-[#ff006e]/20 border border-[#00f0ff]/30 flex items-center justify-center mx-auto mb-6 group-hover:border-[#00f0ff] transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
              >
                <svg className="w-10 h-10 text-[#00f0ff] group-hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)] transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-wide text-[#00f0ff] mb-3">Any Repository</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">Paste any GitHub repo URL and our neural network analyzes it to create your learning path</p>
            </div>

            <div className="cyber-card p-8 group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ff006e]/20 to-[#ffbe0b]/20 border border-[#ff006e]/30 flex items-center justify-center mx-auto mb-6 group-hover:border-[#ff006e] transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
              >
                <svg className="w-10 h-10 text-[#ff006e] group-hover:drop-shadow-[0_0_10px_rgba(255,0,110,0.8)] transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-wide text-[#ff006e] mb-3">Skill Protocol</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">Choose your level - Beginner, Intermediate, or Pro - for personalized AI-generated content</p>
            </div>

            <div className="cyber-card p-8 group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ffbe0b]/20 to-[#39ff14]/20 border border-[#ffbe0b]/30 flex items-center justify-center mx-auto mb-6 group-hover:border-[#ffbe0b] transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
              >
                <svg className="w-10 h-10 text-[#ffbe0b] group-hover:drop-shadow-[0_0_10px_rgba(255,190,11,0.8)] transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-black uppercase tracking-wide text-[#ffbe0b] mb-3">14-Day Protocol</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">Step-by-step interactive guides with 100 tasks per day help you master projects</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-8 mt-16">
            <div className="space-y-3">
              <h2 className="text-4xl font-black uppercase tracking-tight">
                <span className="text-[#e0e7ff]">Ready to </span>
                <span className="neon-text">Jack In</span>
                <span className="text-[#e0e7ff]">?</span>
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#00f0ff]"></div>
                <p className="text-[#64748b] text-sm uppercase tracking-widest">Initialize Neural Connection</p>
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#ff006e]"></div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignUpButton>
                <button className="cyber-button text-lg group">
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <span>Get Started Free</span>
                    <span className="text-2xl">⚡</span>
                  </span>
                </button>
              </SignUpButton>
              
              <SignInButton>
                <button className="px-8 py-4 border-2 border-[#64748b]/50 text-[#94a3b8] hover:border-[#00f0ff] hover:text-[#00f0ff] hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] font-bold uppercase tracking-wider text-sm transition-all duration-300"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                >
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-12 border-t border-[#00f0ff]/20">
            <div className="text-center">
              <div className="text-3xl font-black text-[#00f0ff] mb-1">14</div>
              <div className="text-xs text-[#64748b] uppercase tracking-widest">Days Protocol</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#ff006e] mb-1">100</div>
              <div className="text-xs text-[#64748b] uppercase tracking-widest">Tasks/Day</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#ffbe0b] mb-1">AI</div>
              <div className="text-xs text-[#64748b] uppercase tracking-widest">Powered</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 