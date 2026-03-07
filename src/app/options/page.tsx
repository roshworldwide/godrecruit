"use client";

import { useState, useEffect } from "react";
import { Save, Check, KeySquare, HardDrive, Bot, User, Briefcase, GraduationCap, Wrench } from "lucide-react";

export default function Options() {
    const [geminiKey, setGeminiKey] = useState("");
    const [supabaseUrl, setSupabaseUrl] = useState("");
    const [supabaseKey, setSupabaseKey] = useState("");
    const [saved, setSaved] = useState(false);

    // Master Resume Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [summary, setSummary] = useState("");
    const [experience, setExperience] = useState("");
    const [education, setEducation] = useState("");
    const [skills, setSkills] = useState("");

    useEffect(() => {
        const loadConfig = async () => {
            if (typeof chrome !== "undefined" && chrome.storage) {
                // Load API keys from sync storage
                chrome.storage.sync.get(["geminiKey", "supabaseUrl", "supabaseKey"], (result: { [key: string]: string }) => {
                    setGeminiKey(result.geminiKey || "");
                    setSupabaseUrl(result.supabaseUrl || "");
                    setSupabaseKey(result.supabaseKey || "");
                });
                // Load master resume from local storage
                chrome.storage.local.get(["masterResume"], (result: { [key: string]: any }) => {
                    const r = result.masterResume;
                    if (r) {
                        setFullName(r.fullName || "");
                        setEmail(r.email || "");
                        setPhone(r.phone || "");
                        setLinkedin(r.linkedin || "");
                        setPortfolio(r.portfolio || "");
                        setSummary(r.summary || "");
                        setExperience(r.experience || "");
                        setEducation(r.education || "");
                        setSkills(r.skills || "");
                    }
                });
            } else {
                setGeminiKey(localStorage.getItem("geminiKey") || "");
                setSupabaseUrl(localStorage.getItem("supabaseUrl") || "");
                setSupabaseKey(localStorage.getItem("supabaseKey") || "");
                const stored = localStorage.getItem("masterResume");
                if (stored) {
                    const r = JSON.parse(stored);
                    setFullName(r.fullName || "");
                    setEmail(r.email || "");
                    setPhone(r.phone || "");
                    setLinkedin(r.linkedin || "");
                    setPortfolio(r.portfolio || "");
                    setSummary(r.summary || "");
                    setExperience(r.experience || "");
                    setEducation(r.education || "");
                    setSkills(r.skills || "");
                }
            }
        };
        loadConfig();
    }, []);

    const handleSave = () => {
        const masterResume = {
            fullName, email, phone, linkedin, portfolio,
            summary, experience, education, skills,
        };

        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ geminiKey, supabaseUrl, supabaseKey });
            chrome.storage.local.set({ masterResume }, () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            });
        } else {
            localStorage.setItem("geminiKey", geminiKey);
            localStorage.setItem("supabaseUrl", supabaseUrl);
            localStorage.setItem("supabaseKey", supabaseKey);
            localStorage.setItem("masterResume", JSON.stringify(masterResume));
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }
    };

    const inputClass = "w-full bg-white/[0.05] dark:bg-white/[0.05] border border-white/[0.12] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40 apple-transition shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] placeholder:text-gray-400/60 text-[15px]";
    const labelClass = "text-sm font-medium opacity-70 pl-1 tracking-wide";

    return (
        <div className="min-h-screen bg-transparent flex justify-center py-12 px-6 relative">
            <div className="absolute inset-0 z-[-2] bg-gradient-to-br from-[#f2f2f7] to-[#e5e5ea] dark:from-[#000000] dark:to-[#111111]" />

            {/* Aurora visual effects */}
            <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] bg-blue-500/20 rounded-full blur-[100px] z-[-1]" />
            <div className="absolute bottom-[20%] right-[10%] w-[25vw] h-[25vw] min-w-[250px] min-h-[250px] bg-purple-500/20 rounded-full blur-[100px] z-[-1]" />
            <div className="absolute top-[50%] right-[30%] w-[20vw] h-[20vw] min-w-[200px] min-h-[200px] bg-indigo-500/10 rounded-full blur-[80px] z-[-1]" />

            <main className="w-full max-w-3xl flex flex-col gap-8 pb-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bot className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-semibold tracking-tight">GodRecruit Preferences</h1>
                    </div>
                </div>

                {/* Intelligence Engine */}
                <section className="liquid-glass p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-black/5 dark:border-white/10">
                        <KeySquare className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-medium">Intelligence Engine</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Gemini API Key</label>
                        <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIzaSy..." className={inputClass} />
                    </div>
                </section>

                {/* Supabase Persistence */}
                <section className="liquid-glass p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-black/5 dark:border-white/10">
                        <HardDrive className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-medium">Supabase Persistence</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>Project URL</label>
                            <input type="text" value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://xyz.supabase.co" className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>Anon Key</label>
                            <input type="password" value={supabaseKey} onChange={(e) => setSupabaseKey(e.target.value)} placeholder="eyJhbG..." className={inputClass} />
                        </div>
                    </div>
                </section>

                {/* Section 1: Personal Info */}
                <section className="liquid-glass p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-black/5 dark:border-white/10">
                        <User className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-medium">Personal Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>Full Name</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Appleseed" className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>Phone Number</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className={labelClass}>LinkedIn URL</label>
                            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className={inputClass} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Portfolio / Website</label>
                        <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yourportfolio.dev" className={inputClass} />
                    </div>
                </section>

                {/* Section 2: Professional Summary */}
                <section className="liquid-glass p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-black/5 dark:border-white/10">
                        <Briefcase className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-medium">Professional Summary</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>A concise overview of your professional identity</label>
                        <textarea
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            placeholder="Experienced software engineer with 5+ years building scalable web applications..."
                            className={`${inputClass} min-h-[120px] resize-y`}
                        />
                    </div>
                </section>

                {/* Section 3: Experience & Education */}
                <section className="liquid-glass p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-black/5 dark:border-white/10">
                        <GraduationCap className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-medium">Experience & Education</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Work Experience (chronological — company, role, dates, highlights)</label>
                        <textarea
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder={"Google — Senior Software Engineer (2021–Present)\n• Led migration of core API layer to gRPC, reducing latency by 40%\n• Designed real-time analytics pipeline processing 2M events/sec\n\nMeta — Software Engineer (2018–2021)\n• Built React-based dashboard used by 50K+ internal users..."}
                            className={`${inputClass} min-h-[220px] resize-y font-mono text-[13px]`}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Education (institution, degree, year)</label>
                        <textarea
                            value={education}
                            onChange={(e) => setEducation(e.target.value)}
                            placeholder={"Stanford University — M.S. Computer Science (2018)\nMIT — B.S. Computer Science & Mathematics (2016)"}
                            className={`${inputClass} min-h-[120px] resize-y font-mono text-[13px]`}
                        />
                    </div>
                </section>

                {/* Section 4: Core Skills */}
                <section className="liquid-glass p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2 pb-4 border-b border-black/5 dark:border-white/10">
                        <Wrench className="w-5 h-5 text-gray-500" />
                        <h2 className="text-xl font-medium">Core Skills</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Comma-separated list of technical and soft skills</label>
                        <textarea
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="TypeScript, React, Node.js, Python, AWS, System Design, Technical Leadership, GraphQL, PostgreSQL, Docker, Kubernetes..."
                            className={`${inputClass} min-h-[100px] resize-y`}
                        />
                    </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end pt-2 pb-8">
                    <button
                        onClick={handleSave}
                        className={`
                            flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-semibold text-[15px]
                            shadow-lg apple-interactive
                            transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                            ${saved
                                ? "bg-green-500 shadow-green-500/30 text-white scale-[0.97]"
                                : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/25 text-white hover:shadow-blue-500/40 active:scale-[0.96]"
                            }
                        `}
                    >
                        {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {saved ? "Profile Saved to Chrome" : "Save Master Profile"}
                    </button>
                </div>
            </main>
        </div>
    );
}
