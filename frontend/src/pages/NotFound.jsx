import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import logo from "../assets/logo.png";
import { useThemeStore } from "../store/useThemeStore";

const MotionLink = motion(Link);

const pageVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.14, delayChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: "easeOut" } },
};

const floatLogo = {
  animate: { y: [0, -10, 0], rotate: [0, 3, -3, 0] },
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
};

export default function NotFound() {
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    document.title = "404 - Page Not Found | GitNest";

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [navigate]);

  const motionMainProps = shouldReduceMotion ? { initial: false, animate: false } : { initial: "hidden", animate: "visible", variants: pageVariants };

  return (
    <motion.main
      {...motionMainProps}
      className={`min-h-screen relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8 ${
        isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-950"
      }`}
      aria-labelledby="page-title"
      role="main"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.span
            key={index}
            aria-hidden="true"
            className="absolute rounded-full bg-gradient-to-br from-[#00dc82]/20 to-transparent blur-3xl"
            style={{
              width: 120 + index * 40,
              height: 120 + index * 40,
              left: `${10 + index * 14}%`,
              top: `${12 + index * 10}%`,
              opacity: 0.16,
            }}
            {...(shouldReduceMotion
              ? {}
              : { animate: { y: [0, -18, 0], x: [0, 10, 0] }, transition: { duration: 8 + index, repeat: Infinity, ease: "easeInOut" } })}
          />
        ))}
      </div>

      <section className="relative z-10 mx-auto max-w-6xl flex min-h-[calc(100vh-4rem)] flex-col justify-center gap-6 px-0 py-6 text-center md:gap-12 md:px-4 lg:text-left">
        <motion.nav
          {...(shouldReduceMotion ? {} : { variants: fadeUp })}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between sm:gap-6"
          aria-label="GitNest 404 navigation"
        >
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
            <motion.div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900/70" {...floatLogo}>
              <img src={logo} alt="GitNest logo" className="h-10 w-10 object-contain" />
            </motion.div>
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-400">GitNest</p>
              <p className="text-[0.72rem] leading-5 text-slate-500 dark:text-slate-400 sm:text-xs">Developer-first git activity explorer</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300 sm:justify-end">
            <Link
              to="/"
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-cyan-400 dark:hover:text-cyan-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Home
            </Link>
            <Link
              to="/docs"
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              Documentation
            </Link>
          </div>
        </motion.nav>

        <motion.section
          {...(shouldReduceMotion ? {} : { variants: fadeUp })}
          className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 sm:p-8 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.65)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/70 lg:p-14"
        >
          <div className="flex flex-col items-center gap-6 lg:items-start">
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              Repository Not Found
            </div>
            <div className="space-y-6 text-center lg:text-left">
              <h1 id="page-title" className="text-5xl sm:text-6xl md:text-7xl lg:text-[8rem] font-black tracking-tight text-slate-950 dark:text-white leading-none">
                404
              </h1>
              <div className="space-y-4">
                <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Repository Not Found
                </p>
                <p className="max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                  The page or repository you&apos;re looking for may have been moved, renamed, or doesn&apos;t exist.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
            <MotionLink
              to="/"
              whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(16, 185, 129, 0.22)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              aria-label="Go back to home page"
            >
              Go Home
            </MotionLink>
            <MotionLink
              to="/docs"
              whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(14, 165, 233, 0.18)" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-950 transition hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 px-6 py-3"
              aria-label="View documentation"
            >
              Documentation
            </MotionLink>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-6 text-left text-sm text-slate-600 dark:border-slate-700/80 dark:bg-slate-950/80 dark:text-slate-300">
            <p className="font-medium text-slate-900 dark:text-white">Need help?</p>
            <p className="mt-2 leading-7">
              Press <span className="font-semibold text-slate-900 dark:text-white">Esc</span> to return to the homepage, or use the navigation links above to explore GitNest.
            </p>
          </div>
        </motion.section>

        <footer className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p className="font-medium text-slate-900 dark:text-white">GitNest</p>
          <p className="mt-2 max-w-2xl mx-auto text-slate-500 dark:text-slate-400">
            A modern GitHub-inspired developer experience for repository activity, collaboration, and open source contribution.
          </p>
        </footer>
      </section>
    </motion.main>
  );
}
