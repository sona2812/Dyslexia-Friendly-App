import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComparisonDemo() {
  const [demoText, setDemoText] = useState(
    "Reading can sometimes be challenging, especially for those with dyslexia. Words might appear jumbled or letters seem to move around. WordFlow helps create a more focused reading experience."
  );
  const [activeWord, setActiveWord] = useState(null);
  const [isTypeMode, setIsTypeMode] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Feature toggles
  const [features, setFeatures] = useState({
    focusHighlight: false,   // Focus Word Highlighting
    rhythmMode: false,      // Rhythm-based word grouping
    wordShape: false,       // WordShape Lens Tool
    chunkedText: false,     // Chunked Text Display
    lineFlow: false,        // Animated underline
  });
  
  const [tempo, setTempo] = useState(60);
  const [animationSpeed, setAnimationSpeed] = useState(500); // Speed in milliseconds (500 = medium)
  
  const textAreaRef = useRef(null);
  const enhancedTextRef = useRef(null);
  const words = demoText.split(' ');
  
  // Auto-advance through words when play is active
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentWordIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % words.length;
          setActiveWord(words[nextIndex]);
          return nextIndex;
        });
      }, animationSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, words, animationSpeed]);
  
  // Handle spacebar to advance words
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && features.focusHighlight && !isPlaying && enhancedTextRef.current && enhancedTextRef.current.contains(document.activeElement)) {
        e.preventDefault();
        setCurrentWordIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % words.length;
          setActiveWord(words[nextIndex]);
          return nextIndex;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [words, features.focusHighlight, isPlaying]);
  
  // Focus effect for enhanced panel
  const handleWordHover = (word, index) => {
    if (features.focusHighlight && !isPlaying) {
      setActiveWord(word);
      setCurrentWordIndex(index);
    }
  };
  
  const handleWordLeave = () => {
    if (!isPlaying) {
      setActiveWord(null);
    }
  };
  
  // Auto-focus textarea when switching to type mode
  useEffect(() => {
    if (isTypeMode && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isTypeMode]);
  
  // Toggle a feature
  const toggleFeature = (featureName) => {
    setFeatures(prev => {
      const newFeatures = {
        focusHighlight: false,
        rhythmMode: false,
        wordShape: false,
        chunkedText: false,
        lineFlow: false,
      };
      
      if (!prev[featureName]) {
        newFeatures[featureName] = true;
      }
      
      if (featureName === 'focusHighlight' && prev.focusHighlight) {
        setIsPlaying(false);
        setActiveWord(null);
      }
      
      // Reset WordShape states
      if (featureName === 'wordShape') {
        setSelectedWord(null);
        setHoveredWord(null);
      }
      
      // Clear tooltip on feature change
      setHoveredWord(null);
      
      return newFeatures;
    });
  };
  
  // Reset current indices when text changes
  useEffect(() => {
    setCurrentWordIndex(0);
    setActiveWord(null);
  }, [demoText]);
  
  // Variants for animations
  const wordVariants = {
    initial: {
      color: '#4B5563',
      y: 0,
      scale: 1,
      backgroundColor: 'transparent',
    },
    hover: {
      color: '#2563EB',
      y: 0,
      scale: 1.05,
      backgroundColor: 'rgba(219, 234, 254, 0.8)', // light blue bg for hover
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 20,
      },
    },
    focus: {
      color: '#854d0e', // amber-800 for better contrast on yellow
      y: 0,
      scale: 1.05,
      backgroundColor: 'rgba(254, 240, 138, 0.7)', // yellow bg for focused words
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 20,
      },
    }
  };
  
  // Create an effect for blurry/distorted text
  const applyDyslexicEffect = (text) => {
    return text.split(' ').map((word, idx) => (
      <span
        key={idx}
        className="inline-block relative px-0.5 mr-1"
      >
        <span 
          className="relative inline-block text-gray-800 transition-all duration-200"
          style={{
            filter: 'blur(0.3px)',
            transform: idx % 3 === 0 ? 'skew(-1deg)' : (idx % 3 === 1 ? 'skew(1deg)' : 'skew(0deg)'),
            letterSpacing: '0.02em'
          }}
        >
          {word}
        </span>
      </span>
    ));
  };

  // Add RhythmMode component before the return statement
  const RhythmMode = ({ words, isActive, isPlaying, tempo }) => {
    const [currentBeat, setCurrentBeat] = useState(0);
    const intervalRef = useRef(null);
    const [hoveredWord, setHoveredWord] = useState(null);

    useEffect(() => {
      if (!isActive || !isPlaying) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        return;
      }

      const beatInterval = (60 / tempo) * 1000; // Convert BPM to milliseconds
      intervalRef.current = setInterval(() => {
        setCurrentBeat(prev => (prev + 1) % words.length);
      }, beatInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [isActive, isPlaying, tempo, words.length]);

    // Reset currentBeat when stopping
    useEffect(() => {
      if (!isPlaying) {
        setCurrentBeat(0);
      }
    }, [isPlaying]);

    return (
      <div className="text-lg leading-relaxed">
        {words.map((word, index) => {
          const delay = (index * (60 / tempo)) % (words.length * (60 / tempo));
          
          return (
            <motion.span
              key={index}
              className="inline-block mx-1 relative cursor-pointer"
              onMouseEnter={() => features.wordShape && setHoveredWord(word)}
              onMouseLeave={() => setHoveredWord(null)}
              initial={{ scale: 1, color: '#1F2937' }}
              animate={{
                scale: [1, 1.2, 1],
                color: ['#1F2937', '#2563EB', '#1F2937'],
              }}
              transition={{
                scale: {
                  duration: 60 / tempo,
                  repeat: Infinity,
                  repeatDelay: ((words.length - 1) * (60 / tempo)),
                  delay: delay,
                  ease: "easeInOut"
                },
                color: {
                  duration: 60 / tempo,
                  repeat: Infinity,
                  repeatDelay: ((words.length - 1) * (60 / tempo)),
                  delay: delay,
                  ease: "easeInOut"
                }
              }}
            >
              {word}
              <AnimatePresence>
                {hoveredWord === word && features.wordShape && (
                  <WordShapeTooltip word={word} />
                )}
              </AnimatePresence>
            </motion.span>
          );
        })}
      </div>
    );
  };

  // Add state for selected word and hover state at the top level
  const [selectedWord, setSelectedWord] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Update TextDisplay component
  const TextDisplay = ({ word, index, withRhythm = false, isEnhancedPanel = false }) => {
    const delay = withRhythm ? (index * (60 / tempo)) % (words.length * (60 / tempo)) : 0;
    const isHighlighted = isEnhancedPanel && features.focusHighlight && (
      isPlaying ? index === currentWordIndex : word === activeWord
    );
    
    // For line flow: underline on hover (not just auto-play)
    const isLineFlowActive = features.lineFlow && isEnhancedPanel && (
      isPlaying ? index === currentWordIndex : word === activeWord
    );

    return (
      <motion.span
        key={index}
        className={`inline-block relative mx-0.5 cursor-pointer px-0.5
          ${isHighlighted ? 'bg-yellow-100 text-amber-800' : 'text-gray-800'}`}
        onMouseEnter={() => {
          if (features.lineFlow && !isPlaying && isEnhancedPanel) {
            setActiveWord(word);
            setCurrentWordIndex(index);
          }
          if (features.wordShape && isEnhancedPanel) {
            setHoveredWord(word);
            setSelectedWord(word);
          }
          if (features.focusHighlight && !isPlaying && isEnhancedPanel) {
            setActiveWord(word);
            setCurrentWordIndex(index);
          }
        }}
        onMouseLeave={() => {
          if ((features.focusHighlight || features.lineFlow) && !isPlaying && isEnhancedPanel) {
            setActiveWord(null);
          }
        }}
        animate={withRhythm ? {
          scale: [1, 1.2, 1],
          color: ['#1F2937', '#2563EB', '#1F2937'],
        } : isHighlighted ? {
          scale: [1, 1.05, 1],
          transition: {
            scale: {
              duration: 0.3,
              ease: "easeInOut"
            }
          }
        } : {
          scale: 1
        }}
        transition={withRhythm ? {
          scale: {
            duration: 60 / tempo,
            repeat: Infinity,
            repeatDelay: ((words.length - 1) * (60 / tempo)),
            delay: delay,
            ease: "easeInOut"
          },
          color: {
            duration: 60 / tempo,
            repeat: Infinity,
            repeatDelay: ((words.length - 1) * (60 / tempo)),
            delay: delay,
            ease: "easeInOut"
          }
        } : {
          duration: 0.3
        }}
      >
        <LineFlow 
          word={word}
          index={index}
          isActive={isLineFlowActive}
        />
      </motion.span>
    );
  };

  // Update WordShapeTooltip component
  const WordShapeTooltip = ({ word }) => {
    const handlePronunciation = useCallback((e) => {
      e.stopPropagation();
      if (audioPlaying) return;
      setAudioPlaying(true);
      const speech = new SpeechSynthesisUtterance(word);
      speech.rate = 0.9;
      speech.onend = () => setAudioPlaying(false);
      window.speechSynthesis.speak(speech);
    }, [word]);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="sticky top-32 w-[280px] flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-blue-600">WordShape Lens</span>
              <button 
                className={`text-blue-400 hover:text-blue-600 transition-colors rounded-full p-1.5 hover:bg-blue-50 relative
                  ${audioPlaying ? 'animate-pulse' : ''}`}
                onClick={() => {
                  if (audioPlaying) return;
                  setAudioPlaying(true);
                  const speech = new SpeechSynthesisUtterance(word);
                  speech.rate = 0.9;
                  speech.onend = () => setAudioPlaying(false);
                  window.speechSynthesis.speak(speech);
                }}
                disabled={audioPlaying}
                title="Listen to pronunciation"
              >
                <span role="img" aria-label="speaker" className="text-sm">
                  {audioPlaying ? '🔊' : '🔈'}
                </span>
              </button>
            </div>
          </div>
          <div className="px-4 py-3 bg-gradient-to-b from-yellow-50 to-orange-50">
            <div 
              className="text-3xl font-bold text-center"
              style={{ 
                fontFamily: 'Lexend, sans-serif',
                letterSpacing: '0.03em',
                color: '#1e40af',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              {word}
            </div>
          </div>
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Hover over words to see them in dyslexia-friendly format
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Process text into logical chunks
  const chunks = useMemo(() => {
    if (!features.chunkedText) return [demoText];

    // Split into sentences first (keeping punctuation)
    const sentenceRegex = /[^.!?]+[.!?]+/g;
    const sentences = demoText.match(sentenceRegex) || [demoText];

    const processedChunks = [];
    
    sentences.forEach(sentence => {
      if (!sentence || typeof sentence !== 'string') return;

      // First split by natural break points (commas and specific conjunctions)
      const breakPoints = /,|\s+(and|but|or|nor|yet|so)\s+/g;
      const parts = sentence.split(breakPoints)
        .filter(part => part && typeof part === 'string')
        .map(part => part.trim())
        .filter(part => part.length > 0);
      
      // Process each part
      parts.forEach(part => {
        // For longer phrases, try to break at logical points
        if (part.split(' ').length > 8) {
          // Look for natural phrase breaks like prepositions
          const phraseBreaks = /\s+(with|for|to|in|on|at|by|from)\s+/g;
          const subParts = part.split(phraseBreaks)
            .filter(subPart => subPart && typeof subPart === 'string')
            .map(subPart => subPart.trim())
            .filter(subPart => subPart.length > 0);
          
          // Add each sub-part as its own chunk
          subParts.forEach(subPart => {
            processedChunks.push(subPart);
          });
        } else {
          // Keep shorter parts as single chunks
          processedChunks.push(part);
        }
      });
    });

    return processedChunks
      .filter(chunk => chunk && typeof chunk === 'string' && chunk.length > 0)
      .map(chunk => chunk.replace(/\s+/g, ' ').trim());
  }, [demoText, features.chunkedText]);

  // Add LineFlow component
  const LineFlow = ({ word, index, isActive }) => {
    const wordRef = useRef(null);
    const [lineLength, setLineLength] = useState(0);
    
    useEffect(() => {
      if (wordRef.current) {
        setLineLength(wordRef.current.offsetWidth);
      }
    }, [word]);

    return (
      <div className="relative inline-block" ref={wordRef}>
        {word}
        {isActive && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-blue-400"
            initial={{ width: 0 }}
            animate={{ width: lineLength }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    );
  };

  // Update ChunkedTextDisplay component
  const ChunkedTextDisplay = ({ chunks, isEnhancedPanel = false }) => {
    return (
      <div className="space-y-3">
        {chunks.map((chunk, index) => {
          if (!chunk || typeof chunk !== 'string') return null;
          
          const words = chunk.split(' ').filter(word => word.length > 0);
          
          return (
            <div 
              key={index}
              className={`p-2 rounded ${isEnhancedPanel ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'bg-gray-50/40'} 
                transition-colors duration-200 ease-in-out`}
            >
              {words.map((word, wordIndex, arr) => (
                <React.Fragment key={`${index}-${wordIndex}`}>
                  <TextDisplay
                    word={word}
                    index={wordIndex}
                    withRhythm={features.rhythmMode}
                    isEnhancedPanel={isEnhancedPanel}
                  />
                  {wordIndex < arr.length - 1 && ' '}
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // Update auto-play effect to handle word progression
  useEffect(() => {
    let interval;
    let currentIndex = currentWordIndex;

    if (isPlaying && features.focusHighlight) {
      // Set initial word
      setActiveWord(words[currentIndex]);

      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % words.length;
        setCurrentWordIndex(currentIndex);
        setActiveWord(words[currentIndex]);
      }, animationSpeed);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, features.focusHighlight, words, animationSpeed]);

  // Reset states when features change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
    setActiveWord(null);
  }, [features]);

  // Reset states when text changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentWordIndex(0);
    setActiveWord(null);
  }, [demoText]);

  // Update the auto-play button click handler
  const handleAutoPlayClick = () => {
    if (!isPlaying) {
      // When starting auto-play, ensure we start from the beginning
      setCurrentWordIndex(0);
      setActiveWord(words[0]);
    } else {
      // When stopping, clear the active word
      setActiveWord(null);
    }
    setIsPlaying(!isPlaying);
  };

  // Update CongratulationsPopup to include streak and score
  const CongratulationsPopup = ({ onClose, sentence, streak, score, scoreGained }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
        >
          {/* Confetti-like decoration */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-yellow-200 rounded-full opacity-50"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>
          
          <div className="text-center relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className="text-5xl mb-4"
            >
              {streak >= 3 ? '🔥' : '🎉'}
            </motion.div>
            
            <h2 className="text-2xl font-bold text-indigo-600 mb-2">
              Fantastic Job!
            </h2>

            {/* Score Display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 space-y-2"
            >
              <div className="flex justify-center items-center gap-2">
                <span className="text-2xl font-bold text-indigo-500">+{scoreGained}</span>
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-500"
                >
                  points
                </motion.span>
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                🏆 Total Score: {score}
              </span>
            </motion.div>

            {/* Streak Display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                {streak >= 3 ? '🔥' : '⭐'} Streak: {streak}
              </span>
            </motion.div>
            
            <p className="text-gray-600 mb-6">
              You successfully completed the sentence:
              <br />
              <span className="font-medium text-gray-800 mt-2 block">
                "{sentence}"
              </span>
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onClose(true)}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Back to Features
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex items-start gap-8 w-full max-w-7xl mx-auto">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden relative">
        <div className="p-6 bg-indigo-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-2xl font-bold">Experience the Difference</h3>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setIsTypeMode(!isTypeMode)}
              className="px-4 py-2 text-sm font-medium bg-white text-indigo-900 rounded-md hover:bg-indigo-50 transition-colors shadow-sm"
            >
              {isTypeMode ? 'Done' : 'Try Your Own Text'}
            </button>
          </div>
        </div>
        
        {/* Feature Toggle Bar */}
        <div className="p-4 bg-indigo-800 text-white">
          <div className="text-lg font-medium mb-4">Select a Feature:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Focus Highlighting Toggle */}
            <div 
              className={`p-5 rounded-lg cursor-pointer border-2 transition shadow-md ${features.focusHighlight ? 'bg-blue-50 border-blue-500 shadow-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              onClick={() => toggleFeature('focusHighlight')}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-4 ${features.focusHighlight ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <div>
                  <div className="font-semibold text-gray-800 text-base">Focus Highlighting</div>
                  <div className="text-sm text-gray-600 mt-1">Highlight active words</div>
                </div>
              </div>
            </div>
            
            {/* Rhythm Mode Toggle */}
            <div 
              className={`p-5 rounded-lg cursor-pointer border-2 transition shadow-md ${features.rhythmMode ? 'bg-blue-50 border-blue-500 shadow-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              onClick={() => toggleFeature('rhythmMode')}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-4 ${features.rhythmMode ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <div>
                  <div className="font-semibold text-gray-800 text-base">Rhythm Mode</div>
                  <div className="text-sm text-gray-600 mt-1">Beat-based word grouping</div>
                </div>
              </div>
            </div>

            {/* Chunked Text Toggle */}
            <div 
              className={`p-5 rounded-lg cursor-pointer border-2 transition shadow-md ${features.chunkedText ? 'bg-blue-50 border-blue-500 shadow-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              onClick={() => toggleFeature('chunkedText')}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-4 ${features.chunkedText ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <div>
                  <div className="font-semibold text-gray-800 text-base">Chunked Text</div>
                  <div className="text-sm text-gray-600 mt-1">Break text into logical phrases</div>
                </div>
              </div>
            </div>

            {/* WordShape Lens Toggle */}
            <div 
              className={`p-5 rounded-lg cursor-pointer border-2 transition shadow-md ${features.wordShape ? 'bg-blue-50 border-blue-500 shadow-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              onClick={() => toggleFeature('wordShape')}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-4 ${features.wordShape ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <div>
                  <div className="font-semibold text-gray-800 text-base">WordShape Lens</div>
                  <div className="text-sm text-gray-600 mt-1">Enhanced word visualization</div>
                </div>
              </div>
            </div>

            {/* Line Flow Toggle */}
            <div 
              className={`p-5 rounded-lg cursor-pointer border-2 transition shadow-md ${features.lineFlow ? 'bg-blue-50 border-blue-500 shadow-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
              onClick={() => toggleFeature('lineFlow')}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full mr-4 ${features.lineFlow ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                <div>
                  <div className="font-semibold text-gray-800 text-base">Line Flow</div>
                  <div className="text-sm text-gray-600 mt-1">Animated reading guide</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Auto-Play Button for Focus Highlighting and Line Flow */}
          {(features.focusHighlight || features.lineFlow) && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleAutoPlayClick}
                className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors ${isPlaying ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                {isPlaying ? '⏹ Stop' : '▶ Auto-Play'}
              </button>
            </div>
          )}
        </div>
        
        {isTypeMode && (
          <div className="p-4 bg-indigo-50">
            <textarea
              ref={textAreaRef}
              value={demoText}
              onChange={(e) => {
                setDemoText(e.target.value);
                setCurrentWordIndex(0);
                if (isPlaying) setIsPlaying(false);
              }}
              className="w-full p-3 rounded border border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
              rows={3}
              placeholder="Type or paste your text here"
            />
          </div>
        )}
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* Standard Text Panel */}
            <div className="p-6 bg-gray-50">
              <div className="mb-4 text-gray-600 text-base font-semibold uppercase tracking-wide">Standard Text</div>
              <div className="prose prose-gray prose-lg max-w-none leading-relaxed">
                {applyDyslexicEffect(demoText)}
              </div>
            </div>
            
            {/* Enhanced Text Panel */}
            <div className="p-6 bg-white">
              <div className="mb-4 text-blue-600 text-base font-semibold uppercase tracking-wide">WordFlow Enhanced</div>
              
              {/* Feature Instructions */}
              {(features.focusHighlight || features.wordShape || features.chunkedText) && (
                <div className="mb-4 text-sm text-gray-600">
                  {features.focusHighlight && (
                    <p className="mb-2">
                      Hover over words to highlight them and improve focus.
                    </p>
                  )}
                  {features.wordShape && (
                    <p className="mb-2">
                      Hover over words to see them in a dyslexia-friendly format with pronunciation.
                    </p>
                  )}
                  {features.chunkedText && (
                    <p>
                      Text is broken into logical phrases for easier reading.
                    </p>
                  )}
                </div>
              )}

              {/* Tempo Control */}
              {features.rhythmMode && (
                <div className="mt-4 mb-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tempo: {tempo} BPM
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Slow</span>
                      <input
                        type="range"
                        min="30"
                        max="180"
                        value={tempo}
                        onChange={(e) => setTempo(parseInt(e.target.value))}
                        className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-500">Fast</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Display */}
              <div className="text-lg leading-relaxed">
                {features.chunkedText ? (
                  <ChunkedTextDisplay chunks={chunks} isEnhancedPanel={true} />
                ) : (
                  words.map((word, index) => (
                    <TextDisplay 
                      key={index} 
                      word={word} 
                      index={index} 
                      withRhythm={features.rhythmMode}
                      isEnhancedPanel={true}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WordShape tooltip - sticky on the right, always visible */}
      <AnimatePresence>
        {features.wordShape && hoveredWord && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="sticky top-32 w-[280px] flex-shrink-0 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-blue-600">WordShape Lens</span>
                  <button 
                    className={`text-blue-400 hover:text-blue-600 transition-colors rounded-full p-1.5 hover:bg-blue-50 relative
                      ${audioPlaying ? 'animate-pulse' : ''}`}
                    onClick={() => {
                      if (audioPlaying) return;
                      setAudioPlaying(true);
                      const speech = new SpeechSynthesisUtterance(hoveredWord);
                      speech.rate = 0.9;
                      speech.onend = () => setAudioPlaying(false);
                      window.speechSynthesis.speak(speech);
                    }}
                    disabled={audioPlaying}
                    title="Listen to pronunciation"
                  >
                    <span role="img" aria-label="speaker" className="text-sm">
                      {audioPlaying ? '🔊' : '🔈'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="px-4 py-3 bg-gradient-to-b from-yellow-50 to-orange-50">
                <div 
                  className="text-3xl font-bold text-center"
                  style={{ 
                    fontFamily: 'Lexend, sans-serif',
                    letterSpacing: '0.03em',
                    color: '#1e40af',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {hoveredWord}
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Hover over words to see them in dyslexia-friendly format
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 