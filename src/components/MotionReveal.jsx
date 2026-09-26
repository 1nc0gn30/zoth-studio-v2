/**
 * MotionReveal.jsx — Premium $100k-tier animation system for Zoth Studio v2
 *
 * Reusable Framer Motion components for cinematic hero entrances,
 * scroll-triggered reveals, split-text animations, parallax glows,
 * and staggered children. All respect prefers-reduced-motion.
 */
import React, { useRef, useMemo } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';

/* ========================================================================
   EASING PRESETS
   ======================================================================== */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1];
const SPRING_SMOOTH = { type: 'spring', damping: 30, stiffness: 200 };
const SPRING_SNAPPY = { type: 'spring', damping: 25, stiffness: 300 };
const SPRING_GENTLE = { type: 'spring', damping: 40, stiffness: 120 };

/* ========================================================================
   1. HeroReveal — Staggered hero section entrance
   Wraps children and staggers them with cinematic timing.
   Usage:
     <HeroReveal>
       <Chip ... />
       <Typography variant="h3">...</Typography>
       <Typography color="text.secondary">...</Typography>
       <Button ... />
     </HeroReveal>
   ======================================================================== */
const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const heroItemVariants = {
  hidden: {
    opacity: 0,
    y: 32,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: EASE_OUT_EXPO,
    },
  },
};

export function HeroReveal({ children, className, style, delay = 0, ...rest }) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  if (prefersReduced) {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={heroContainerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delayChildren: delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* Individual hero item wrapper (each child in HeroReveal should be wrapped) */
export function HeroItem({ children, custom, style, ...rest }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div style={style} {...rest}>{children}</div>;
  }
  return (
    <motion.div variants={heroItemVariants} style={style} {...rest}>
      {children}
    </motion.div>
  );
}

/* ========================================================================
   2. RevealOnScroll — Viewport-triggered reveal with multiple presets
   Preset: 'fadeUp' | 'fadeIn' | 'scaleUp' | 'slideLeft' | 'slideRight'
   ======================================================================== */
const revealPresets = {
  fadeUp: {
    hidden: { opacity: 0, y: 48, filter: 'blur(6px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.88, filter: 'blur(4px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
};

export function RevealOnScroll({
  children,
  preset = 'fadeUp',
  duration = 0.7,
  delay = 0,
  threshold = 0.15,
  once = true,
  style,
  className,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  if (prefersReduced) {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  const variants = revealPresets[preset] || revealPresets.fadeUp;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ========================================================================
   3. StaggerChildren — Auto-stagger container for grid items / cards
   ======================================================================== */
const staggerContainerVariants = {
  hidden: {},
  visible: (staggerDelay = 0.06) => ({
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  }),
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
};

export function StaggerChildren({
  children,
  staggerDelay = 0.06,
  className,
  style,
  once = true,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  if (prefersReduced) {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={staggerContainerVariants}
      custom={staggerDelay}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, style, ...rest }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return <div style={style} {...rest}>{children}</div>;
  }
  return (
    <motion.div variants={staggerItemVariants} style={style} {...rest}>
      {children}
    </motion.div>
  );
}

/* ========================================================================
   4. GlowLine — Animated gold accent line that draws in from left
   ======================================================================== */
export function GlowLine({
  height = 3,
  color = '#D4AF37',
  glowColor = 'rgba(212,175,55,0.45)',
  duration = 0.9,
  delay = 0.2,
  borderRadius = 2,
  style,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  if (prefersReduced) {
    return (
      <div
        ref={ref}
        style={{
          height,
          borderRadius,
          background: `linear-gradient(90deg, transparent, ${color} 20%, ${color} 80%, transparent)`,
          boxShadow: `0 0 18px 2px ${glowColor}`,
          ...style,
        }}
        {...rest}
      />
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{
        height,
        borderRadius,
        background: `linear-gradient(90deg, transparent, ${color} 20%, ${color} 80%, transparent)`,
        boxShadow: `0 0 18px 2px ${glowColor}`,
        transformOrigin: 'left center',
        ...style,
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={
        isInView
          ? { scaleX: 1, opacity: 1 }
          : { scaleX: 0, opacity: 0 }
      }
      transition={{
        duration,
        delay,
        ease: EASE_OUT_EXPO,
      }}
      {...rest}
    />
  );
}

/* ========================================================================
   5. ParallaxGlow — Scroll-linked parallax background glow element
   ======================================================================== */
export function ParallaxGlow({
  children,
  offset = 80,
  style,
  className,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.05, 0.95]);

  if (prefersReduced) {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, scale, ...style }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ========================================================================
   6. SplitText — Word-level text animation for headings
   Each word fades up with stagger for a cinematic reveal.
   ======================================================================== */
export function SplitText({
  text,
  as: Component = 'span',
  className,
  style,
  wordDelay = 0.04,
  charDelay = 0,
  duration = 0.5,
  delay = 0,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  const words = useMemo(() => text.split(' '), [text]);

  if (prefersReduced) {
    return (
      <Component ref={ref} className={className} style={style} {...rest}>
        {text}
      </Component>
    );
  }

  return (
    <Component
      ref={ref}
      className={className}
      style={{ display: 'inline', ...style }}
      {...rest}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          style={{ display: 'inline-block', whiteSpace: 'pre' }}
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : { opacity: 0, y: 20, filter: 'blur(6px)' }
          }
          transition={{
            duration,
            delay: delay + i * wordDelay,
            ease: EASE_OUT_EXPO,
          }}
        >
          {word}
          {i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Component>
  );
}

/* ========================================================================
   7. FloatingElement — Continuous subtle float for 3D logos, icons etc
   ======================================================================== */
export function FloatingElement({
  children,
  amplitude = 8,
  duration = 4,
  style,
  ...rest
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div style={style} {...rest}>{children}</div>;
  }

  return (
    <motion.div
      style={style}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ========================================================================
   8. CountUp — Animated number counter
   ======================================================================== */
export function CountUp({
  from = 0,
  to,
  duration = 1.5,
  delay = 0,
  suffix = '',
  prefix = '',
  style,
  className,
  ...rest
}) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = React.useState(from);

  React.useEffect(() => {
    if (!isInView || prefersReduced) {
      if (isInView) setDisplay(to);
      return;
    }

    const startTime = performance.now() + delay * 1000;
    let raf;

    const animate = (now) => {
      if (now < startTime) {
        raf = requestAnimationFrame(animate);
        return;
      }
      const elapsed = (now - startTime) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isInView, from, to, duration, delay, prefersReduced]);

  return (
    <span ref={ref} className={className} style={style} {...rest}>
      {prefix}{display}{suffix}
    </span>
  );
}

/* ========================================================================
   9. MagneticHover — Premium magnetic/tilt hover effect for buttons
   ======================================================================== */
export function MagneticHover({ children, intensity = 0.3, style, ...rest }) {
  const prefersReduced = useReducedMotion();
  const ref = useRef(null);

  if (prefersReduced) {
    return <div ref={ref} style={style} {...rest}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ display: 'inline-block', ...style }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SNAPPY}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* Default export: all components */
export default {
  HeroReveal,
  HeroItem,
  RevealOnScroll,
  StaggerChildren,
  StaggerItem,
  GlowLine,
  ParallaxGlow,
  SplitText,
  FloatingElement,
  CountUp,
  MagneticHover,
};
