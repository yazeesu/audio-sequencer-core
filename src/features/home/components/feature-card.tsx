"use client";

import { motion } from "motion/react";
import { fadeUp } from "@/src/shared/lib/motion";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors hover:shadow-lg hover:shadow-primary/10"
    >
      <motion.div
        className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4"
        whileHover={{ scale: 1.08, rotate: 3 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
