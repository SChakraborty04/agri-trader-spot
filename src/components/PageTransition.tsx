import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.99,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -8,
    scale: 0.99,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  duration: 0.3,
};

export const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Stagger children animation wrapper
export const StaggerContainer = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

// Individual stagger item
export const StaggerItem = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y: 12, scale: 0.96 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      },
    }}
  >
    {children}
  </motion.div>
);

// Haptic button wrapper with scale feedback
export const HapticButton = ({ 
  children, 
  className = "",
  onClick,
  disabled = false,
}: { 
  children: ReactNode; 
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <motion.button
    className={className}
    onClick={onClick}
    disabled={disabled}
    whileTap={{ scale: 0.96 }}
    whileHover={{ scale: 1.02 }}
    transition={{
      type: "spring",
      stiffness: 500,
      damping: 20,
    }}
  >
    {children}
  </motion.button>
);

// Card with lift effect on hover
export const LiftCard = ({ 
  children, 
  className = "",
  onClick,
}: { 
  children: ReactNode; 
  className?: string;
  onClick?: () => void;
}) => (
  <motion.div
    className={className}
    onClick={onClick}
    whileHover={{ 
      y: -4,
      boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08), 0 6px 12px rgba(0, 0, 0, 0.04)",
    }}
    whileTap={{ scale: 0.98 }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 25,
    }}
  >
    {children}
  </motion.div>
);

// Fade in from bottom animation
export const FadeInUp = ({ 
  children, 
  delay = 0,
  className = "",
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 25,
      delay,
    }}
  >
    {children}
  </motion.div>
);

// Scale in animation
export const ScaleIn = ({ 
  children, 
  delay = 0,
  className = "",
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay,
    }}
  >
    {children}
  </motion.div>
);
