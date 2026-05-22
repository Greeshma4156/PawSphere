export const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: 15, transition: { duration: 0.3 } }
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export const floatHover = {
  whileHover: { y: -8, transition: { duration: 0.3, ease: 'easeInOut' } }
};

export const cardHover = {
  whileHover: { 
    y: -6, 
    scale: 1.02, 
    boxShadow: '0 12px 30px rgba(183, 156, 255, 0.15)',
    transition: { duration: 0.2, ease: 'easeInOut' } 
  }
};
