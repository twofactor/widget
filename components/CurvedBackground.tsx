import { motion } from "framer-motion";

export function CurvedBackground() {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-[85%] z-0"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 100,
        delay: 0.2,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
        style={{ transform: "scale(1.1)" }}
      >
        <path
          d="M0 20 C 30 10, 70 10, 100 20 L 100 100 L 0 100 Z"
          fill="#F3D9B1"
        />
      </svg>
    </motion.div>
  );
}
