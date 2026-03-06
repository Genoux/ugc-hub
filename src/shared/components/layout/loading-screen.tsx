import { motion } from "motion/react";
import Image from "next/image";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background text-foreground"
    >
      <Image src="/inBeat.svg" alt="inBeat UGC Hub" width={42} height={42} />
    </motion.div>
  );
}
