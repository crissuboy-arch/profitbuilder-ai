"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white font-[family-name:var(--font-geist-sans)]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
      </div>

      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-blue-500 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-violet-400">
            Introducing ProfitBuilder AI
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
        >
          Build Digital Empires
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
            At the Speed of Light
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
        >
          The all-in-one AI platform to discover products, validate ideas, generate sales pages, and launch your business. Stop planning. Start building.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-slate-950 hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="ghost" className="h-14 px-8 text-lg rounded-full border border-white/10 hover:bg-white/5 transition-all text-white">
            See how it works
          </Button>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}
