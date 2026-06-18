"use client";

import dynamic from "next/dynamic";
import {
  Activity,
  AudioWaveform,
  Mic2,
  Music,
  Radio,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import LayoutNavbar from "@/src/shared/components/layout/layout-navbar";
import { LazyMount } from "@/src/shared/components/lazy-mount";
import { ImageWithFallback } from "@/src/features/home/components/image-with-fallback";
import { FadeInView } from "@/src/features/home/components/fade-in-view";
import { HeroWaveform } from "@/src/features/home/components/hero-waveform";
import { FeatureCard } from "@/src/features/home/components/feature-card";
import {
  defaultTransition,
  fadeUp,
  staggerContainer,
} from "@/src/shared/lib/motion";

const InteractivePiano = dynamic(
  () =>
    import("@/src/features/home/components/interactive-piano").then(
      (mod) => mod.InteractivePiano,
    ),
  {
    loading: () => (
      <div className="h-52 rounded-2xl border border-border bg-card/50 animate-pulse" />
    ),
  },
);

const features = [
  {
    icon: <Music className="w-8 h-8" />,
    title: "MIDI Composition",
    description:
      "Create complex arrangements with our intuitive MIDI editor and piano roll interface.",
  },
  {
    icon: <AudioWaveform className="w-8 h-8" />,
    title: "Song Analysis",
    description:
      "Analyze and visualize your tracks with advanced waveform and spectrum tools.",
  },
  {
    icon: <Mic2 className="w-8 h-8" />,
    title: "Virtual Instruments",
    description:
      "Access a library of high-quality synthesizers, samplers, and sound engines.",
  },
  {
    icon: <Radio className="w-8 h-8" />,
    title: "Effects & Processing",
    description:
      "Professional-grade effects including reverb, compression, EQ, and more.",
  },
  {
    icon: <Activity className="w-8 h-8" />,
    title: "Real-time Preview",
    description:
      "Hear your changes instantly with low-latency audio processing.",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI-Assisted",
    description:
      "Smart suggestions for chord progressions, melodies, and mixing.",
  },
] as const;

const stats = [
  { value: "32-bit", label: "Float Processing" },
  { value: "192kHz", label: "Sample Rate" },
  { value: "∞", label: "Tracks & Effects" },
  { value: "<5ms", label: "Latency" },
] as const;

function SectionPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-muted/30 animate-pulse ${className ?? ""}`}
      aria-hidden
    />
  );
}

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LayoutNavbar />

      {/* Above the fold — always mounted for fast LCP */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(124,58,237,0.1),transparent)]" />

        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute top-24 left-[10%] w-72 h-72 rounded-full bg-primary/20 blur-3xl"
              animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-40 right-[15%] w-96 h-96 rounded-full bg-accent/15 blur-3xl"
              animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1, 1.08, 1] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        )}

        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
          <motion.div
            className="text-center space-y-8 max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              transition={defaultTransition}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                Professional Music Production Suite
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={defaultTransition}
              className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight"
            >
              Create Music
              <br />
              Like Never Before
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={defaultTransition}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              PolySonus brings professional-grade music production tools to your
              browser. Compose, analyze, and master your tracks with MIDI
              precision.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={defaultTransition}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/auth?mode=sign-up"
                  className="block px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors shadow-lg shadow-primary/25 text-center"
                >
                  Start Creating Free
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-card hover:bg-card/80 border border-border rounded-lg transition-colors"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </motion.div>

          <LazyMount
            className="mt-20 relative"
            minHeight={320}
            rootMargin="120px 0px"
            fallback={<SectionPlaceholder className="h-80" />}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <HeroWaveform />
          </LazyMount>
        </div>
      </div>

      <LazyMount
        minHeight={520}
        rootMargin="200px 0px"
        fallback={<SectionPlaceholder className="mx-6 my-24 h-[520px] max-w-7xl lg:mx-auto" />}
      >
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
            <FadeInView direction="left">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Studio-Grade Production
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Experience professional music production tools right in your
                browser. From MIDI composition to advanced mixing, PolySonus
                brings the power of a full DAW to the web.
              </p>
              <motion.div
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={staggerContainer}
              >
                {[
                  {
                    title: "Cloud-Native Workflow",
                    description:
                      "Access your projects anywhere, collaborate in real-time",
                  },
                  {
                    title: "Professional Sound Quality",
                    description: "High-fidelity audio processing and export",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    transition={defaultTransition}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </FadeInView>

            <FadeInView direction="right" delay={0.1}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1632582204758-5ac65783517a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtdXNpYyUyMHByb2R1Y3Rpb24lMjBzdHVkaW98ZW58MXx8fHwxNzgwNTg3MzI3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Music production studio setup with monitor and equipment"
                    className="relative rounded-xl shadow-2xl object-cover w-full h-[400px]"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              </div>
            </FadeInView>
          </div>

          <FadeInView className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to produce professional music
            </p>
          </FadeInView>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
          >
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </motion.div>
        </div>
      </LazyMount>

      <LazyMount
        minHeight={400}
        rootMargin="200px 0px"
        fallback={
          <SectionPlaceholder className="hidden md:block mx-6 my-24 h-[400px] max-w-7xl lg:mx-auto" />
        }
      >
        <div className="hidden md:block bg-gradient-to-b from-background to-card/30 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <FadeInView className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Try It Yourself
              </h2>
              <p className="text-muted-foreground text-lg">
                Click the keys or use your keyboard to play — two octaves, no
                setup required
              </p>
            </FadeInView>

            <FadeInView delay={0.1}>
              <div className="max-w-4xl mx-auto">
                <InteractivePiano />
              </div>
            </FadeInView>
          </div>
        </div>
      </LazyMount>

      <LazyMount
        minHeight={480}
        rootMargin="200px 0px"
        fallback={<SectionPlaceholder className="mx-6 my-24 h-[480px] max-w-7xl lg:mx-auto" />}
      >
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeInView direction="right" className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-2xl blur-2xl" />
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1618609377864-68609b857e90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpbyUyMG1peGluZyUyMGNvbnNvbGV8ZW58MXx8fHwxNzgwNTg3MzI4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Professional audio mixing console"
                  className="relative rounded-xl shadow-2xl object-cover w-full h-[400px]"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </FadeInView>

            <FadeInView
              direction="left"
              delay={0.1}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Mix Like a Pro
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Advanced mixing tools and effects give you complete control over
                your sound. Shape your tracks with precision using our intuitive
                interface and professional-grade processors.
              </p>
              <motion.div
                className="grid grid-cols-2 gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={staggerContainer}
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={fadeUp}
                    transition={defaultTransition}
                    whileHover={{
                      y: -4,
                      borderColor: "rgba(124, 58, 237, 0.4)",
                    }}
                    className="p-4 rounded-lg bg-card border border-border transition-colors"
                  >
                    <div className="text-3xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </FadeInView>
          </div>
        </div>
      </LazyMount>

      <LazyMount
        minHeight={320}
        rootMargin="200px 0px"
        fallback={<SectionPlaceholder className="mx-6 my-24 h-[320px] max-w-4xl lg:mx-auto" />}
      >
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <FadeInView direction="scale">
            <motion.div
              className="rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 p-12"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <h2 className="text-4xl font-bold mb-4">Ready to Create?</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of musicians creating their next masterpiece
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/auth?mode=sign-up"
                  className="inline-block px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors shadow-lg shadow-primary/25"
                >
                  Get Started Now
                </Link>
              </motion.div>
            </motion.div>
          </FadeInView>
        </div>
      </LazyMount>
    </div>
  );
}
