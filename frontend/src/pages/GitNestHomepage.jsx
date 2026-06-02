import { useState } from "react";
import { useThemeStore } from "../store/useThemeStore";
import {
    GitBranch,
    ShieldCheck,
    Sparkles,
    Users,
    ArrowRight,
    Sun,
    Moon,
    Menu,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { AnimatePresence, motion } from "framer-motion";
import "../App.css";

const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Features", href: "#features" },
    { name: "Contributors", href: "#contributors" },
];

const marqueeItems = [
    "MERN Stack",
    "AI Workflows",
    "Open Source",
    "GSSoC 2026",
    "DevOps",
    "Realtime Collaboration",
    "PR Reviews",
    "Contributor Friendly",
    "TypeScript",
    "Node.js",
    "MongoDB",
];

const featureCards = [
    {
        title: "Version Control",
        description:
            "Create repositories, branches, pull requests, and commits with a modern collaborative workflow.",
        icon: <GitBranch className="w-7 h-7 text-[#00dc82]" />,
    },
    {
        title: "AI Workflows",
        description:
            "AI-assisted code reviews, commit summaries, onboarding, and contributor guidance.",
        icon: <Sparkles className="w-7 h-7 text-[#3b82f6]" />,
    },
    {
        title: "Team Collaboration",
        description:
            "Built for contributors, maintainers, and open-source teams working together.",
        icon: <Users className="w-7 h-7 text-[#9333ea]" />,
    },
    {
        title: "Developer First",
        description:
            "Clean APIs, scalable architecture, and a contributor-friendly structure from day one.",
        icon: <ShieldCheck className="w-7 h-7 text-[#f97316]" />,
    },
];

const summaryCards = [
    { value: "42", label: "Stars" },
    { value: "18", label: "PRs" },
    { value: "9", label: "Contributors" },
];

const sectionMotion = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function GitNestHomepage() {
    const [activeLink, setActiveLink] = useState(() => {
        if (typeof window !== "undefined" && window.location.hash) {
            return window.location.hash;
        }
        return "#home";
    });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isDarkMode, toggleTheme } = useThemeStore();

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f6f8f7] dark:bg-[#07090d] text-zinc-900 dark:text-white transition-colors">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-[260px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,220,130,0.12),transparent_60%)] blur-3xl" />
                <div className="absolute top-[18%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
            </div>

            <header className="fixed top-4 inset-x-0 z-50 px-3 md:px-6">
                <div className="max-w-7xl mx-auto h-16 md:h-20 rounded-[24px] md:rounded-[28px] border border-white/50 dark:border-white/10 bg-white/80 dark:bg-[#0c0f14]/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] flex items-center justify-between px-4 md:px-8 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#10141b] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00dc82]/20 to-cyan-400/20 blur-xl" />
                            <img src={logo} alt="GitNest" className="relative w-8 h-8 object-contain dark:bg-white rounded-2xl" />
                        </div>

                        {/* NAVBAR (handled above) */}

                        <AnimatePresence>
                            {mobileMenuOpen && (
                                <>
                                    {/* Backdrop — click outside to close */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="lg:hidden fixed inset-0 z-40"
                                        onClick={() => setMobileMenuOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.25 }}
                                        className="lg:hidden fixed top-[88px] left-3 right-3 rounded-3xl border border-white/10 bg-white/95 dark:bg-[#0c0f14]/95 backdrop-blur-2xl shadow-2xl p-6 z-50"
                                    >
                                        <div className="flex flex-col gap-5">
                                            {navLinks.map((item) => (
                                                <a
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="text-lg font-medium text-zinc-800 dark:text-white"
                                                >
                                                    {item.name}
                                                </a>
                                            ))}

                                            <Link
                                                to="/docs"
                                                className="w-full text-center rounded-2xl border px-4 py-3"
                                            >
                                                Documentation
                                            </Link>

                                            <Link
                                                to="/contact"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="w-full text-center rounded-2xl border border-zinc-200 dark:border-white/10 px-4 py-3 text-zinc-800 dark:text-white"
                                            >
                                                Contact Us
                                            </Link>

                                            <Link
                                                to="/register"
                                                className="w-full text-center rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] px-4 py-3 font-bold text-black"
                                            >
                                                Start Contributing
                                            </Link>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="w-full sm:w-auto px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm text-center"
                        >
                            {isDarkMode ? "🌞 Light" : "🌙 Dark"}
                        </button>
                        <div className="flex flex-wrap items-center gap-2 justify-end w-full sm:w-auto">
                            <Link
                                to="/docs"
                                className="hidden sm:inline-flex px-3 sm:px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-all"
                            >
                                Documentation
                            </Link>
                            <Link
                                to="/register"
                                className="w-full sm:w-auto max-w-[12rem] px-4 sm:px-5 py-2 rounded-xl bg-emerald-400 text-black font-semibold text-sm hover:scale-[1.02] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                            >
                                Start Contributing
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                            aria-pressed={isDarkMode}
                            className="relative w-[90px] h-12 rounded-full bg-white dark:bg-[#11151c] border border-zinc-200 dark:border-white/10 shadow-inner flex items-center px-1"
                        >
                            <div
                                className={`absolute top-1 w-10 h-10 rounded-full bg-gradient-to-br from-[#00dc82] to-cyan-400 transition-all duration-500 shadow-lg ${isDarkMode ? "translate-x-[45px]" : "translate-x-0"
                                    }`}
                            />
                            <div className="relative flex w-full justify-between px-1 z-10">
                                <Sun className="w-7 h-5 text-zinc-700" />
                                <Moon className="w-5 h-5 text-zinc-700" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((current) => !current)}
                            className="lg:hidden p-3 rounded-xl border border-zinc-200 dark:border-white/10"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="lg:hidden fixed inset-0 z-40 bg-black/20"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.25 }}
                            className="lg:hidden fixed top-[88px] left-3 right-3 rounded-3xl border border-white/10 bg-white/95 dark:bg-[#0c0f14]/95 backdrop-blur-2xl shadow-2xl p-6 z-50"
                        >
                            <div className="flex flex-col gap-5">
                                {navLinks.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => {
                                            setActiveLink(item.href);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="text-lg font-medium text-zinc-800 dark:text-white"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                                <Link
                                    to="/docs"
                                    className="w-full text-center rounded-2xl border px-4 py-3"
                                >
                                    Documentation
                                </Link>
                                <Link
                                    to="/register"
                                    className="w-full text-center rounded-2xl bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff] px-4 py-3 font-bold text-black"
                                >
                                    Start Contributing
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="relative pt-28">
                <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-16 lg:grid-cols-2 items-center py-24">
                    <motion.div {...sectionMotion} className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Open Source • GSSoC 2026
                        </div>
                        <div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight">
                                Build the future of
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff]">
                                    collaborative coding
                                </span>
                            </h1>
                        </div>
                        <p className="max-w-2xl text-base leading-8 text-zinc-900 dark:text-zinc-300">
                            GitNest is a full-featured GitHub-inspired platform built with the MERN stack. Create repositories, browse code, manage issues, review pull requests, and collaborate • all in one open-source developer ecosystem.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[#00dc82] to-[#36e4da] px-8 py-4 text-sm font-bold text-black shadow-[0_15px_45px_rgba(0,220,130,0.30)] hover:-translate-y-0.5 transition-transform"
                            >
                                Explore Repositories
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/docs#architecture"
                                className="inline-flex items-center gap-3 rounded-3xl border border-zinc-200 bg-white/80 px-8 py-4 text-sm font-semibold text-zinc-900 dark:border-white/10 dark:bg-white/[0.06] dark:text-white transition hover:shadow-lg"
                            >
                                View Architecture
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div {...sectionMotion} className="relative overflow-hidden rounded-[32px] border border-zinc-200 bg-white/80 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950/80">
                        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#00dc82] via-[#2be4da] to-[#4fd1ff]" />
                        <div className="mt-6 space-y-6">
                            <div className="rounded-[28px] border border-[#00dc82]/10 bg-gradient-to-br from-white to-[#f3fffb] p-6 shadow-lg">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black">gitnest-core</h3>
                                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                                            GitHub-inspired repository management with pull requests, issues, branching, and AI-assisted collaboration.
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-[#00dc82]/10 px-3 py-2 text-sm font-semibold text-[#00dc82]">
                                        Public
                                    </span>
                                </div>
                                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                    {summaryCards.map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                                            <div className="text-2xl font-black">{item.value}</div>
                                            <p className="mt-1 text-xs text-zinc-500">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {featureCards.map((feature) => (
                                    <div key={feature.title} className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                                        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#00dc82]/10 text-[#00dc82]">
                                            {feature.icon}
                                        </div>
                                        <h4 className="text-xl font-bold">{feature.title}</h4>
                                        <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </section>

                <section className="relative mt-12 overflow-hidden border-y border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl">
                    <div className="flex whitespace-nowrap animate-marquee py-6">
                        {[...marqueeItems, ...marqueeItems].map((item, index) => (
                            <div
                                key={index}
                                className="mx-4 px-6 py-3 rounded-full border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] shadow-md text-zinc-700 dark:text-zinc-300 font-medium"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </section>

                <section id="features" className="relative border-t border-zinc-200 dark:border-white/5 bg-[#f7faf9] dark:bg-[#050816] py-32">
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute left-[-120px] top-[45%] w-[220px] h-[220px] rounded-full bg-blue-200/25 blur-3xl" />
                        <div className="absolute -top-24 right-12 h-80 w-80 rounded-full bg-white/50 blur-3xl dark:bg-cyan-400/10" />
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
                    </div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mb-20">
                            <p className="text-[15px] font-bold tracking-[0.25em] uppercase bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent mb-6">
                                Platform Features
                            </p>
                            <h2 className="text-[52px] md:text-[72px] leading-[0.95] tracking-[-0.05em] font-black text-[#071138] dark:text-white mb-8">
                                Designed for contributors
                                <br />
                                and maintainers
                            </h2>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#00dc82] to-[#36e4da]" />
                                <div className="w-2 h-2 rounded-full bg-[#00dc82]" />
                            </div>
                            <p className="text-[20px] leading-10 text-[#64748b] dark:text-zinc-400 max-w-3xl">
                                The UI system establishes a consistent design language so contributors can confidently build new pages, dashboards, workflows, and tools.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
                            {featureCards.map((feature) => (
                                <div key={feature.title} className="group relative overflow-hidden rounded-[34px] border border-white/60 dark:border-white/5 bg-gradient-to-br from-white to-[#f8fffc] dark:from-[#0b1915] dark:to-[#0f1f1a] p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)] hover:-translate-y-2 transition-all duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/15 to-transparent dark:from-black dark:via-white/5 pointer-events-none" />
                                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: feature.title === "Developer First" ? "#f97316" : feature.title === "Team Collaboration" ? "#9333ea" : feature.title === "AI Workflows" ? "#3b82f6" : "#00dc82" }} />
                                    <div className="relative w-20 h-20 rounded-[24px] border border-white/60 flex items-center justify-center shadow-inner mb-10" style={{ background: `${feature.title === "Developer First" ? "#f9731610" : feature.title === "Team Collaboration" ? "#9333ea10" : feature.title === "AI Workflows" ? "#3b82f610" : "#00dc8210"}` }}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-[34px] leading-tight tracking-[-0.03em] font-black text-[#071138] dark:text-white mb-4">{feature.title}</h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-10 h-1 rounded-full" style={{ background: feature.title === "Developer First" ? "#f97316" : feature.title === "Team Collaboration" ? "#9333ea" : feature.title === "AI Workflows" ? "#3b82f6" : "#00dc82" }} />
                                        <div className="w-2 h-2 rounded-full" style={{ background: feature.title === "Developer First" ? "#f97316" : feature.title === "Team Collaboration" ? "#9333ea" : feature.title === "AI Workflows" ? "#3b82f6" : "#00dc82" }} />
                                    </div>
                                    <p className="text-[17px] leading-9 text-[#64748b] dark:text-zinc-400 relative z-10">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="contributors" className="relative py-32 overflow-hidden border-t border-[#dce7e3] dark:border-white/5 bg-[#f7faf9] dark:bg-[#080b11]">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-r from-[#00dc82]/10 to-[#4fd1ff]/10 blur-3xl" />
                        <div className="absolute left-[-120px] top-28 w-[320px] h-[320px] rounded-full bg-gradient-to-br from-[#a7f3d0]/40 to-[#d9f99d]/20 blur-2xl" />
                        <div className="absolute left-[14%] bottom-24 w-14 h-14 rounded-full bg-gradient-to-br from-[#d9f99d]/70 to-[#bef264]/40 blur-sm border border-white/40" />
                        <div className="absolute right-[8%] top-[26%] w-[260px] h-[260px] rounded-full bg-gradient-to-br from-[#00dc82]/20 to-[#fde047]/20 blur-3xl" />
                        <div className="absolute top-16 right-[12%] grid grid-cols-5 gap-5 opacity-20">
                            {Array.from({ length: 25 }).map((_, index) => (
                                <div key={index} className="w-1.5 h-1.5 rounded-full bg-[#00dc82]" />
                            ))}
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="relative overflow-hidden rounded-[42px] border border-[#cfe7df] dark:border-[#00dc82]/10 bg-gradient-to-br from-[#f8fffc] via-[#eefbf6] to-[#f4fffd] dark:from-[#071019] dark:via-[#0a1320] dark:to-[#07111b] shadow-[0_20px_80px_rgba(0,220,130,0.08)] px-8 md:px-16 py-16 text-center">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,220,130,0.10),transparent_55%)]" />
                            <div className="hidden lg:flex pointer-events-none absolute right-16 top-20 w-[132px] h-[132px] rounded-[34px] border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,220,130,0.10)] items-center justify-center rotate-[16deg]">
                                <div className="absolute inset-0 rounded-[34px] bg-gradient-to-br from-[#00dc82]/10 to-[#4fd1ff]/10" />
                                <div className="relative text-6xl font-black bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent">{"</>"}</div>
                            </div>
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-[#00dc82]/20 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,220,130,0.06)] mb-10">
                                <Users className="w-5 h-5 text-[#00dc82]" />
                                <span className="text-[14px] font-bold tracking-[0.22em] uppercase bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] bg-clip-text text-transparent">
                                    Open Source Collaboration
                                </span>
                            </div>
                            <h2 className="text-[52px] md:text-[82px] leading-[0.95] tracking-[-0.06em] font-black text-[#07111b] dark:text-white mb-8">
                                Build <span className="bg-gradient-to-r from-[#00dc82] via-[#22c55e] to-[#4fd1ff] bg-clip-text text-transparent">GitNest</span> together
                            </h2>
                            <p className="text-[20px] md:text-[22px] leading-[2.1rem] text-[#475569] dark:text-zinc-400 max-w-4xl mx-auto mb-14">
                                Join developers worldwide in building repositories, managing pull requests, collaborating on features, and shaping the future of open-source development.
                            </p>
                            <div className="relative z-20 flex flex-wrap justify-center gap-6">
                                <Link
                                    to="/register"
                                    className="group inline-flex items-center gap-4 rounded-[22px] bg-gradient-to-r from-[#00dc82] to-[#4fd1ff] px-10 py-5 text-[18px] font-bold text-[#07111b] shadow-[0_15px_40px_rgba(0,220,130,0.20)] hover:scale-[1.03] transition-all duration-300"
                                >
                                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    Contribute Now
                                </Link>
                                <Link
                                    to="/docs"
                                    className="group inline-flex items-center gap-4 rounded-[22px] border border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.03] backdrop-blur-xl px-10 py-5 text-[18px] font-semibold text-[#07111b] dark:text-white hover:border-[#00dc82]/30 hover:bg-white dark:hover:bg-white/[0.05] transition-all duration-300"
                                >
                                    <ShieldCheck className="w-5 h-5 text-[#00dc82]" />
                                    Read Contribution Guide
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="relative overflow-hidden border-t border-[#dce7e3] bg-[#f8fbfa] dark:bg-[#080b11] py-14">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] bg-gradient-to-r from-[#00dc82]/10 via-[#4fd1ff]/10 to-[#d9f99d]/10 blur-3xl rounded-full" />
                        <div className="absolute left-[-80px] bottom-0 w-[240px] h-60 bg-[#4fd1ff]/10 blur-3xl rounded-full" />
                        <div className="absolute right-[-80px] top-0 w-[240px] h-60 bg-[#00dc82]/10 blur-3xl rounded-full" />
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-4 items-start">
                            <div>
                                <div className="flex items-center gap-4 mb-7">
                                    <div className="w-14 h-14 rounded-[20px] bg-white border border-[#e4ece8] shadow-[0_10px_30px_rgba(15,23,42,0.06)] flex items-center justify-center overflow-hidden p-2">
                                        <img src={logo} alt="GitNest Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[34px] tracking-[-0.05em] text-[#071138] dark:text-white">
                                            Git<span className="text-[#00c97b]">Nest</span>
                                        </h3>
                                        <p className="text-[12px] uppercase tracking-[0.24em] text-[#7c8aa5] font-medium mt-1">
                                            Open Source Platform
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[17px] leading-9 text-[#64748b] dark:text-zinc-400 max-w-sm mb-8">
                                    A modern collaborative development platform inspired by GitHub and built for open source communities worldwide.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[22px] font-black text-[#071138] dark:text-white mb-8">Platform</h4>
                                <div className="space-y-5 text-[#64748b] dark:text-zinc-400">
                                    {['Repositories', 'Pull Requests', 'AI Workflows', 'Discussions'].map((item) => (
                                        <a key={item} href="#" className="group flex items-center gap-3 text-[17px] hover:text-[#00b86b] transition-all duration-300">
                                            <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />
                                            {item}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[22px] font-black text-[#071138] dark:text-white mb-8">Developers</h4>
                                <div className="space-y-3">
                                    {['Contribution Guide', 'Roadmap', 'API Docs', 'Architecture'].map((item) => (
                                        <a key={item} href="#" className="group flex items-center gap-3 text-[17px] hover:text-[#00b86b] transition-all duration-300">
                                            <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />
                                            {item}
                                        </a>
                                    ))}
                                    <Link to="/terms" className="group flex items-center gap-3 text-[16px] hover:text-[#00b86b] transition-all duration-300">
                                        <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />
                                        Terms & Conditions
                                    </Link>
                                    <Link to="/contact" className="group flex items-center gap-3 text-[16px] hover:text-[#00b86b] transition-all duration-300">
                                        <div className="w-2 h-2 rounded-full bg-[#00c97b] group-hover:scale-150 transition-transform" />
                                        Contact Us
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[22px] font-black text-[#071138] dark:text-white mb-8">Tech Stack</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {['React', 'Tailwind', 'Node.js', 'MongoDB', 'Express', 'Socket.io', 'JWT', 'AI'].map((tech) => (
                                        <div key={tech} className="rounded-2xl border border-[#e6ece9] bg-white px-4 py-3 text-[15px] font-medium text-[#334155] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 justify-center">
                                            <div className="w-2 h-2 rounded-full bg-[#00c97b]" />
                                            {tech}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 pt-6 border-t border-[#dce7e3] dark:border-zinc-800 flex justify-center text-center">
                            <p className="text-[15px] text-[#64748b] dark:text-zinc-400">© 2026 GitNest. Built for open-source collaboration.</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
