import { motion } from "motion/react";
import Image from "next/image";

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 2, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <Image
        className="animate-pulse"
        src="/inBeat.svg"
        alt="inBeat UGC Hub"
        width={60}
        height={60}
      />
    </motion.div>
  );
}
