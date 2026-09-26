import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';

const mono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export default function CinematicIntro({ words = ["WELCOME", "TO", "ZOTH OS"], onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (currentIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1000); // 1 second per word
      return () => clearTimeout(timer);
    } else {
      // Done with words, wait a brief moment then fire onComplete
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, words.length, onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: theme.palette.background.default,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence mode="wait">
        {currentIndex < words.length && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: mono,
                fontSize: { xs: '3rem', sm: '5rem', md: '7rem' },
                fontWeight: 800,
                color: isDark ? '#D4AF37' : '#B8860B', // Gold accent
                letterSpacing: '0.1em',
                textAlign: 'center',
                textTransform: 'uppercase',
                textShadow: isDark 
                  ? '0 0 20px rgba(212,175,55,0.4), 0 0 40px rgba(212,175,55,0.2)' 
                  : '0 0 20px rgba(184,134,11,0.3)',
              }}
            >
              {words[currentIndex]}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
