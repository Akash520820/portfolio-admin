// Shared Framer Motion variants — keeps animation timing/easing consistent
// across the whole frontend instead of every component inventing its own.
// Respect prefers-reduced-motion by keeping distances small and relying on
// framer-motion's built-in reduced-motion handling via useReducedMotion()
// in components that need it.

export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const staggerContainer = (stagger = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Applied via whileHover on cards / chips for a light tactile "bounce".
export const hoverBounce = {
  whileHover: { y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  whileTap: { scale: 0.97 },
};

// Applied via whileHover on buttons/links for a subtle lift + bounce.
export const buttonBounce = {
  whileHover: { scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 12 } },
  whileTap: { scale: 0.96 },
};

// Default viewport settings for scroll-triggered reveals — fires once,
// a little before the element is fully in view.
// NOTE: amount must be 'some' (any pixel visible), NOT a fraction like 0.25.
// A fractional amount means "25% of the element must be on screen at once",
// which is impossible for tall blocks (e.g. the Projects list stacked on a
// narrow screen can be taller than 4x the viewport) -> it never reveals and
// stays at opacity 0. The negative bottom margin keeps the reveal feeling
// like it fires slightly after the element enters the screen.
export const revealViewport = { once: true, amount: 'some', margin: '0px 0px -60px 0px' };