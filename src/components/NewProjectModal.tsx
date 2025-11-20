import { useState } from "react";
import { useAuth } from '@clerk/nextjs';
import { createProject } from "../../services/api";

interface Props {
  onClose: () => void;
  onSubmit: (projectData: { repoUrl: string; skillLevel: string; domain: string }) => void;
}

export default function NewProjectModal({ onClose, onSubmit }: Props) {
  const { getToken } = useAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [domain, setDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!repoUrl || !skillLevel || !domain) {
      alert("Please fill all fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createProject(
        {
          repo_url: repoUrl,
          skill_level: skillLevel,
          domain: domain,
        },
        getToken
      );
      
      // Pass the data back to parent component
      onSubmit({ repoUrl, skillLevel, domain });
      
      alert("Project saved to database! ✅");
      onClose(); // close modal after submission
    } catch (err) {
      console.error("❌ Error submitting project:", err);
      alert("Failed to save project ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="cyber-card p-8 w-full max-w-2xl relative overflow-hidden">
        {/* Animated Corner Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#00f0ff]/30 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#ff006e]/30 to-transparent animate-pulse"></div>
        
        {/* Header */}
        <div className="relative z-10 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-[#00f0ff] to-[#ff006e]"></div>
            <h2 className="text-3xl font-black uppercase tracking-tight">
              <span className="neon-text">Initialize</span>
              <span className="text-[#e0e7ff]"> Project</span>
            </h2>
          </div>
          <p className="text-[#94a3b8] text-sm uppercase tracking-widest ml-4">
            {'//'} Neural Network Configuration
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          {/* GitHub URL Input */}
          <div>
            <label className="block mb-3 text-[#00f0ff] font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="text-lg">▸</span>
              <span>Repository URL</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full p-4 bg-[#0a0e27]/50 border border-[#00f0ff]/30 text-[#e0e7ff] placeholder-[#64748b] focus:border-[#00f0ff] focus:outline-none focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-300 font-mono"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                placeholder="https://github.com/username/repo"
                disabled={isSubmitting}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00f0ff] opacity-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block mb-3 text-[#ff006e] font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="text-lg">▸</span>
              <span>Skill Protocol</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Beginner", "Intermediate", "Pro"].map((level) => (
                <label 
                  key={level} 
                  className={`cursor-pointer transition-all duration-300 ${
                    skillLevel === level 
                      ? 'border-[#ff006e] bg-[#ff006e]/10 shadow-[0_0_15px_rgba(255,0,110,0.3)]' 
                      : 'border-[#ff006e]/30 hover:border-[#ff006e]/60 hover:bg-[#ff006e]/5'
                  }`}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <input
                    type="radio"
                    name="skill"
                    value={level}
                    checked={skillLevel === level}
                    onChange={() => setSkillLevel(level)}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <div className="p-4 border flex flex-col items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${skillLevel === level ? 'bg-[#ff006e] animate-pulse' : 'bg-[#ff006e]/30'}`}></div>
                    <span className={`text-sm font-bold uppercase tracking-wider ${skillLevel === level ? 'text-[#ff006e]' : 'text-[#94a3b8]'}`}>
                      {level}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block mb-3 text-[#ffbe0b] font-bold uppercase tracking-wider text-sm flex items-center gap-2">
              <span className="text-lg">▸</span>
              <span>Domain Sector</span>
            </label>
            <div className="relative">
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full p-4 bg-[#0a0e27]/50 border border-[#ffbe0b]/30 text-[#e0e7ff] focus:border-[#ffbe0b] focus:outline-none focus:shadow-[0_0_10px_rgba(255,190,11,0.3)] transition-all duration-300 appearance-none cursor-pointer font-bold uppercase tracking-wider text-sm"
                style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                disabled={isSubmitting}
              >
                <option value="" className="bg-[#0a0e27] text-[#64748b]">Select Domain</option>
                <option value="Full Stack" className="bg-[#0a0e27] text-[#e0e7ff]">Full Stack</option>
                <option value="Machine Learning" className="bg-[#0a0e27] text-[#e0e7ff]">Machine Learning</option>
                <option value="Data Science" className="bg-[#0a0e27] text-[#e0e7ff]">Data Science</option>
                <option value="Mobile App" className="bg-[#0a0e27] text-[#e0e7ff]">Mobile App</option>
                <option value="Game Dev" className="bg-[#0a0e27] text-[#e0e7ff]">Game Dev</option>
                <option value="CLI Tool" className="bg-[#0a0e27] text-[#e0e7ff]">CLI Tool</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ffbe0b] pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-10 relative z-10">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border border-[#64748b]/50 text-[#94a3b8] hover:border-[#94a3b8] hover:text-[#e0e7ff] font-bold uppercase tracking-wider text-sm transition-all duration-300 disabled:opacity-50"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !repoUrl || !skillLevel || !domain}
            className="cyber-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Initialize</span>
                  <span>⚡</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
} 