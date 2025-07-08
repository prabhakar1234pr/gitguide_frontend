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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200/50">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
          Create New Learning Project
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">GitHub Repo URL</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
              placeholder="https://github.com/username/repo"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-3 font-semibold text-gray-700">Skill Level</label>
            <div className="flex gap-4">
              {["Beginner", "Intermediate", "Pro"].map((level) => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="skill"
                    value={level}
                    onChange={() => setSkillLevel(level)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-gray-700 font-medium">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-gray-700 bg-white"
              disabled={isSubmitting}
            >
              <option value="" className="text-gray-400">Select domain</option>
              <option value="Full Stack" className="text-gray-700">Full Stack</option>
              <option value="Machine Learning" className="text-gray-700">Machine Learning</option>
              <option value="Data Science" className="text-gray-700">Data Science</option>
              <option value="Mobile App" className="text-gray-700">Mobile App</option>
              <option value="Game Dev" className="text-gray-700">Game Dev</option>
              <option value="CLI Tool" className="text-gray-700">CLI Tool</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
} 