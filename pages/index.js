import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from 'framer-motion';
import Head from 'next/head';
import ComparisonDemo from '../components/ComparisonDemo';
import SpellQuest from '../components/SpellQuest';
import ReadingMaze from '../components/ReadingMaze';

// Constants for localStorage keys
const STORAGE_KEYS = {
  CORRECTED_WORDS: 'wordflow_corrected_words',
  ACTIVE_INDEX: 'wordflow_active_index',
  AUTO_PLAY: 'wordflow_auto_play',
  CURRENT_INDEX: 'wordflow_current_index',
  SHOW_TAGLINE: 'wordflow_show_tagline'
};

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Initialize state with null values
  const [activeIndex, setActiveIndex] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctedWords, setCorrectedWords] = useState([]);
  const [showTagline, setShowTagline] = useState(false);
  const [hoveringWordIndex, setHoveringWordIndex] = useState(null);
  
  const demoRef = useRef(null);
  const controls = useAnimation();
  const heroRef = useRef(null);

  // Load saved state from localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Load saved states
    const loadSavedState = () => {
      try {
        const savedCorrectedWords = JSON.parse(localStorage.getItem(STORAGE_KEYS.CORRECTED_WORDS)) || [];
        const savedActiveIndex = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVE_INDEX));
        const savedAutoPlay = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTO_PLAY)) || false;
        const savedCurrentIndex = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX)) || 0;
        const savedShowTagline = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOW_TAGLINE)) || false;

        setCorrectedWords(savedCorrectedWords);
        setActiveIndex(savedActiveIndex);
        setAutoPlay(savedAutoPlay);
        setCurrentIndex(savedCurrentIndex);
        setShowTagline(savedShowTagline);
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };

    loadSavedState();
    
    // Set up mobile detection
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Save state changes to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEYS.CORRECTED_WORDS, JSON.stringify(correctedWords));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_INDEX, JSON.stringify(activeIndex));
      localStorage.setItem(STORAGE_KEYS.AUTO_PLAY, JSON.stringify(autoPlay));
      localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, JSON.stringify(currentIndex));
      localStorage.setItem(STORAGE_KEYS.SHOW_TAGLINE, JSON.stringify(showTagline));
    }
  }, [correctedWords, activeIndex, autoPlay, currentIndex, showTagline, isClient]);

  // Handle word correction with state persistence
  const handleWordCorrection = (word) => {
    if (!correctedWords.includes(word)) {
      const newCorrectedWords = [...correctedWords, word];
      setCorrectedWords(newCorrectedWords);
      localStorage.setItem(STORAGE_KEYS.CORRECTED_WORDS, JSON.stringify(newCorrectedWords));
    }
  };

  // Handle auto-play with state persistence
  const handleAutoPlayToggle = () => {
    const newAutoPlay = !autoPlay;
    setAutoPlay(newAutoPlay);
    localStorage.setItem(STORAGE_KEYS.AUTO_PLAY, JSON.stringify(newAutoPlay));
  };

  // Handle phrase hover with state persistence
  const handlePhraseHover = (index) => {
    if (!autoPlay) {
      setActiveIndex(index);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_INDEX, JSON.stringify(index));
    }
  };

  // Check if enough words have been corrected to show tagline
  useEffect(() => {
    if (correctedWords.length >= 4 && !showTagline) {
      setShowTagline(true);
      localStorage.setItem(STORAGE_KEYS.SHOW_TAGLINE, JSON.stringify(true));
    }
  }, [correctedWords, showTagline]);

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (autoPlay) {
      interval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % phrases.length;
        setCurrentIndex(nextIndex);
        setActiveIndex(nextIndex);
        localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, JSON.stringify(nextIndex));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_INDEX, JSON.stringify(nextIndex));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [autoPlay, currentIndex]);

  // Jumbled word pairs [jumbled, correct] - Using words from the tagline with more realistic dyslexic jumbling
  const wordPairs = [
    ["wodrs", "words"],         // letter reversal
    ["sholdn't", "shouldn't"],  // letter omission
    ["feeel", "feel"],          // letter repetition
    ["lkie", "like"],           // letter order switch
    ["puzzels", "puzzles"],     // letter order switch
    ["readnig", "reading"],     // letter order switch
    ["flwo", "flow"]            // letter order switch
  ];

  // Demo text broken into phrases for better reading experience
  const phrases = [
    "Reading can be challenging",
    "for many people with dyslexia.",
    "WordFlow creates a visual path",
    "that guides your eyes",
    "making reading more natural",
    "and less stressful."
  ];

  // Scroll into view when demo is activated
  useEffect(() => {
    if (autoPlay && demoRef.current) {
      demoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [autoPlay]);

  // Handle jumbled word hover and correction
  const handleWordHover = (index) => {
    if (!correctedWords.includes(wordPairs[index][1])) {
      setHoveringWordIndex(index);
    }
  };

  const handleWordLeave = () => {
    setHoveringWordIndex(null);
  };

  // Set up client-side detection
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: isMobile ? 0.4 : 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.15 : 0.2,
        delayChildren: isMobile ? 0.2 : 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: isMobile ? 0.3 : 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: "easeInOut"
      }
    }
  };

  // Flow path animation
  const flowPathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        pathLength: { type: "spring", duration: 1.5, bounce: 0.3 },
        opacity: { duration: 0.3 }
      }
    }
  };

  // Animation for floating jumbled words
  const floatingWordVariants = {
    initial: (i) => ({
      opacity: 0.7,
      y: 0,
      x: 0,
      rotate: 0,
      scale: 1,
      filter: "blur(0px)",
    }),
    animate: (i) => ({
      opacity: [0.7, 0.8, 0.7],
      y: [0, -8, 0],
      x: [0, i % 2 === 0 ? 4 : -4, 0],
      rotate: [0, i % 2 === 0 ? 1 : -1, 0],
      filter: ["blur(0px)", "blur(0.5px)", "blur(0px)"],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 3 + i % 2,
        ease: "easeInOut",
      }
    }),
    hover: {
      scale: 1.08,
      opacity: 0.9,
      y: -3,
      filter: "blur(0px)",
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    corrected: {
      scale: 1.15,
      opacity: 1,
      y: 0,
      color: "#2563EB",
      filter: "blur(0px)",
      textShadow: "0 0 12px rgba(59, 130, 246, 0.5), 0 0 4px rgba(59, 130, 246, 0.3)",
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  // Tagline animation
  const taglineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Calculate positions along the curved path
  const getPositionAlongPath = (index, total) => {
    const progress = index / (total - 1);
    const x = 10 + progress * 80; // 10% to 90% of container width
    
    // Create arc-like vertical positioning (higher in middle, lower at ends)
    let y;
    if (progress <= 0.5) {
      y = 50 - (progress * 2) * 30; // Start at 50%, go up to 20%
    } else {
      y = 20 + ((progress - 0.5) * 2) * 30; // Start at 20%, go down to 50%
    }
    
    return { x, y };
  };

  // Letter animation for morphing effect
  const LetterAnimation = ({ jumbledWord, correctWord, isHovering, isCorrected }) => {
    // Find the letter mapping between jumbled and correct
    const getLetterVariants = (jumbled, correct, letterIndex) => {
      // Transition from jumbled to correct letters
      return {
        initial: { 
          opacity: 1, 
          y: 0,
          color: '#4B5563'
        },
        hover: { 
          opacity: 1,
          y: [-2, 2, 0],
          color: '#3B82F6',
          transition: { 
            y: { repeat: 1, duration: 0.3, ease: "easeInOut" },
            color: { duration: 0.2 }
          }
        },
        corrected: {
          opacity: 1,
          y: 0,
          color: '#2563EB',
        }
      };
    };

    // Decide which word to display
    const displayWord = isCorrected ? correctWord : jumbledWord;
    const targetWord = isCorrected ? correctWord : (isHovering ? correctWord : jumbledWord);
  
    return (
      <span className="relative inline-block">
        {displayWord.split('').map((letter, letterIndex) => {
          const variants = getLetterVariants(jumbledWord, correctWord, letterIndex);
          const state = isCorrected ? "corrected" : (isHovering ? "hover" : "initial");
          
          // Stagger the transition timing for letters when hovering
          const transitionDelay = isHovering ? letterIndex * 0.05 : 0;
    
          return (
            <motion.span
              key={letterIndex}
              variants={variants}
              initial="initial"
              animate={state}
              className="inline-block"
              transition={{ delay: transitionDelay }}
            >
              {targetWord[letterIndex] || letter}
            </motion.span>
          );
        })}
      </span>
    );
  };

  // Add scroll-based animations
  const { scrollY } = useScroll();
  const mainControls = useAnimation();

  // Enhanced animation variants
  const pageTransitionVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.8,
        when: "beforeChildren",
      }
    },
    exit: { opacity: 0 }
  };

  // Add a reset function
  const handleReset = () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    setCorrectedWords([]);
    setActiveIndex(null);
    setAutoPlay(false);
    setCurrentIndex(0);
    setShowTagline(false);
    setHoveringWordIndex(null);
  };

  if (!isClient) {
    return null;
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50/80 to-pink-100/70 relative overflow-hidden"
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Sakura petals */}
      {[...Array(isMobile ? 6 : 8)].map((_, index) => (
        <motion.div
          key={index}
          className="sakura"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      ))}

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
      
      <Head>
        <title>WordFlow - Making Reading Flow Naturally</title>
        <meta name="description" content="WordFlow helps make reading more natural and less stressful for people with dyslexia through innovative visual guidance and interactive tools." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 relative z-10">
        {/* Hero Section with transparent background */}
        <motion.section 
          className="text-center min-h-screen relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Animated background elements */}
          <motion.div 
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(circle at 20% 20%, rgba(244, 114, 182, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
                "radial-gradient(circle at 80% 80%, rgba(251, 113, 133, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
                "radial-gradient(circle at 20% 20%, rgba(244, 114, 182, 0.15) 0%, rgba(255, 255, 255, 0) 70%)"
              ]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Decorative circles with pink tones */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-10 right-10 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          <motion.div 
            ref={heroRef}
            className="min-h-screen flex flex-col items-center justify-center relative px-4"
            animate={{ 
              y: [0, -10, 0],
              transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <motion.div
              className="relative mb-12"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-bold tracking-tight text-center z-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-blue-600"
                variants={variants}
              >
                Word<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Flow</span>
              </motion.h1>
            </motion.div>
            
            {/* Floating jumbled words with enhanced styling */}
            <div className="relative w-full max-w-3xl h-48 mx-auto mb-12">
              {wordPairs.map(([jumbled, correct], index) => {
                const position = getPositionAlongPath(index, wordPairs.length);
                const isHovering = hoveringWordIndex === index;
                const isCorrected = correctedWords.includes(correct);
                
                return (
                  <motion.div
                    key={index}
                    className="absolute cursor-pointer"
                    style={{
                      top: `${position.y}%`,
                      left: `${position.x}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: isCorrected ? 2 : (isHovering ? 3 : 1),
                    }}
                    custom={index}
                    variants={floatingWordVariants}
                    initial="initial"
                    animate={isCorrected ? "corrected" : (isHovering ? "hover" : "animate")}
                    onMouseEnter={() => handleWordHover(index)}
                    onMouseLeave={handleWordLeave}
                    onClick={() => handleWordCorrection(correct)}
                  >
                    <div className={`text-2xl md:text-3xl font-medium ${isCorrected ? 'text-blue-600' : 'text-gray-600'}`}>
                      <LetterAnimation 
                        jumbledWord={jumbled} 
                        correctWord={correct} 
                        isHovering={isHovering} 
                        isCorrected={isCorrected} 
                      />
                    </div>
                    
                    {(isCorrected || isHovering) && (
                      <motion.div
                        className={`h-0.5 rounded-full mt-1 mx-auto ${isCorrected ? 'bg-blue-500' : 'bg-blue-300'}`}
                        initial={{ width: isHovering ? 0 : '100%', opacity: isHovering ? 0 : 1 }}
                        animate={{ width: '100%', opacity: 1 }}
                        transition={{ duration: isHovering ? 0.3 : 0 }}
                      />
                    )}
                    
                    {(isCorrected || isHovering) && (
                      <motion.div 
                        className="absolute inset-0 -m-2 rounded-xl opacity-25"
                        initial={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 70%)' }}
                        animate={{ 
                          background: isCorrected 
                            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0) 70%)' 
                            : 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0) 70%)'
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Enhanced tagline */}
            <AnimatePresence>
              {showTagline && (
                <motion.p
                  className="text-xl md:text-3xl text-gray-600 max-w-2xl mx-auto text-center leading-relaxed z-10"
                  variants={taglineVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  Words shouldn't feel like puzzles.
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
                    Let's make reading feel like flow.
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{
              y: [0, 10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </motion.section>

        {/* Features Section with transparent background */}
        <motion.section 
          className="py-8 md:py-12 relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="max-w-4xl mx-auto">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-indigo-900 mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Interactive Reading Tools
            </motion.h2>
            
            {/* Feature Cards with enhanced glass morphism effect */}
            <div className="space-y-8">
              {/* WordFlow Demo */}
              <motion.div 
                className="backdrop-blur-md bg-white/40 rounded-2xl shadow-lg overflow-hidden border border-pink-100/30 transform-gpu"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  scale: 1.01, 
                  boxShadow: "0 20px 30px -8px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
                  transition: {
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500">
                  <motion.h3 
                    className="text-2xl font-semibold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    WordFlow Visual Guide
                  </motion.h3>
                </div>
                <div className="p-6">
                  <ComparisonDemo />
                </div>
              </motion.div>

              {/* Reading Maze with enhanced effects */}
              <motion.div 
                className="backdrop-blur-md bg-white/40 rounded-2xl shadow-lg overflow-hidden border border-pink-100/30 transform-gpu"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  scale: 1.01, 
                  boxShadow: "0 20px 30px -8px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
                  transition: {
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500">
                  <motion.h3 
                    className="text-2xl font-semibold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Reading Maze Challenge
                  </motion.h3>
                </div>
                <div className="p-6">
                  <ReadingMaze />
                </div>
              </motion.div>

              {/* SpellQuest with enhanced effects */}
              <motion.div 
                className="backdrop-blur-md bg-white/40 rounded-2xl shadow-lg overflow-hidden border border-pink-100/30 transform-gpu"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  scale: 1.01, 
                  boxShadow: "0 20px 30px -8px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
                  transition: {
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1]
                  }
                }}
              >
                <div className="px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-400">
                  <motion.h3 
                    className="text-2xl font-semibold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    SpellQuest
                  </motion.h3>
                </div>
                <div className="p-6">
                  <SpellQuest />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>
      </main>

      <motion.footer 
        className="mt-8 backdrop-blur-sm bg-white/10 border-t border-white/10 py-6 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="container mx-auto px-4 text-center text-pink-900"
          whileHover={{ scale: 1.02 }}
        >
          <p>&copy; {new Date().getFullYear()} WordFlow. All rights reserved.</p>
        </motion.div>
      </motion.footer>

      {/* Bottom flower decoration */}
      <div className="flower-container">
        <div className="flower-row">
          {[...Array(isMobile ? 4 : 6)].map((_, index) => (
            <motion.div
              key={`front-${index}`}
              className="flower"
              style={{
                fontSize: `${isMobile ? 20 : 24}px`,
                opacity: 0.8 + Math.random() * 0.2,
                animationDelay: `${Math.random() * 2}s`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              🌸
            </motion.div>
          ))}
        </div>
        <div className="flower-row">
          {[...Array(isMobile ? 3 : 5)].map((_, index) => (
            <motion.div
              key={`back-${index}`}
              className="flower"
              style={{
                fontSize: `${isMobile ? 16 : 20}px`,
                opacity: 0.6 + Math.random() * 0.2,
                animationDelay: `${Math.random() * 2}s`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              {Math.random() > 0.5 ? '🌸' : '💮'}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 