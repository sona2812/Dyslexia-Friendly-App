import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Initial word list with images (you can expand this)
const WORD_LIST = [
  { word: 'cat', image: '🐱', hint: 'A furry pet that meows' },
  { word: 'dog', image: '🐕', hint: 'A loyal furry friend' },
  { word: 'sun', image: '☀️', hint: 'It lights up our day' },
  { word: 'tree', image: '🌳', hint: 'It grows in the forest' },
  { word: 'fish', image: '🐠', hint: 'It swims in water' },
];

// Letter type definitions for color coding
const LETTER_TYPES = {
  VOWEL: ['a', 'e', 'i', 'o', 'u'],
  BLEND: ['ch', 'sh', 'th', 'ph', 'wh', 'qu'],
};

const SpellQuest = () => {
  // Game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [phonicsMode, setPhonicsMode] = useState(true);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [characterPosition, setCharacterPosition] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [availableLetters, setAvailableLetters] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Current word data
  const currentWord = WORD_LIST[currentWordIndex];

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate available letters after component mounts
  useEffect(() => {
    if (!currentWord) return;
    
    // Count frequency of each letter in the word
    const letterFrequency = {};
    currentWord.word.split('').forEach(letter => {
      letterFrequency[letter] = (letterFrequency[letter] || 0) + 1;
    });
    
    // Create array with repeated letters as needed
    const wordLetters = Object.entries(letterFrequency).flatMap(([letter, count]) => 
      Array(count).fill(letter)
    );
    
    const extraLetters = 'abcdefghijklmnopqrstuvwxyz'
      .split('')
      .filter(l => !wordLetters.includes(l))
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    setAvailableLetters([...wordLetters, ...extraLetters].sort(() => Math.random() - 0.5));
  }, [currentWord]);

  // Determine letter type for color coding
  const getLetterType = (letter) => {
    if (LETTER_TYPES.VOWEL.includes(letter)) return 'vowel';
    if (LETTER_TYPES.BLEND.some(blend => letter.includes(blend))) return 'blend';
    return 'consonant';
  };

  // Handle letter selection
  const handleLetterClick = (letter, index) => {
    if (userInput.length >= currentWord.word.length) return;

    const newInput = [...userInput, letter];
    setUserInput(newInput);

    // Play letter sound in phonics mode
    if (phonicsMode) {
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }

    // Check if word is complete
    if (newInput.length === currentWord.word.length) {
      const isWordCorrect = newInput.join('') === currentWord.word;
      setIsCorrect(isWordCorrect);
      
      if (isWordCorrect) {
        handleCorrectWord();
      } else {
        handleIncorrectWord();
      }
    }
  };

  // Handle correct word completion
  const handleCorrectWord = () => {
    // Play success sound and word pronunciation
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.8;
    utterance.onend = () => {
      // Update score and stars
      setScore(prev => prev + 100);
      setStars(prev => prev + 1);
      setShowCelebration(true);

      // Animate character
      setCharacterPosition(prev => prev + 1);

      // Show celebration briefly before moving to next word
      setTimeout(() => {
        setShowCelebration(false);
        setCurrentWordIndex(prev => (prev + 1) % WORD_LIST.length);
        setUserInput([]);
        setIsCorrect(false);
      }, 2000);
    };
    window.speechSynthesis.speak(utterance);
  };

  // Handle incorrect word attempt
  const handleIncorrectWord = () => {
    setShowHint(true);
    setTimeout(() => {
      setUserInput([]);
      setShowHint(false);
      setIsCorrect(false);
    }, 2000);
  };

  // Reset letter
  const handleLetterReset = () => {
    setUserInput([]);
    setShowHint(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-2">SpellQuest</h1>
        <p className="text-gray-600">The Word Builder Adventure</p>
        
        {/* Score and Stars */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="px-4 py-2 bg-white rounded-full shadow-sm">
            <span className="text-indigo-600 font-medium">Score: {score}</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-full shadow-sm">
            <span className="text-yellow-600 font-medium">⭐ {stars}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Word Image and Hint */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{currentWord.image}</div>
          {showHint && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-blue-600 text-sm"
            >
              {currentWord.hint}
            </motion.div>
          )}
        </div>

        {/* Word Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {currentWord.word.split('').map((letter, index) => (
            <motion.div
              key={index}
              className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-xl font-bold
                ${userInput[index] ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {userInput[index] || '_'}
            </motion.div>
          ))}
        </div>

        {/* Letter Tiles */}
        {isClient && (
          <div className="grid grid-cols-5 gap-3 mb-8">
            {availableLetters.map((letter, index) => {
              const letterType = getLetterType(letter);
              // Check if this specific letter instance has been used
              const isUsed = userInput.length > 0 && 
                userInput.filter(l => l === letter).length >= 
                availableLetters.filter(l => l === letter).length;

              return (
                <motion.button
                  key={index}
                  className={`w-full p-4 rounded-lg font-bold text-xl shadow-sm transition-colors
                    ${isUsed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    ${letterType === 'vowel' ? 'bg-blue-100 text-blue-700' : 
                      letterType === 'blend' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'}`}
                  onClick={() => !isUsed && handleLetterClick(letter, index)}
                  whileHover={!isUsed ? { scale: 1.05 } : {}}
                  whileTap={!isUsed ? { scale: 0.95 } : {}}
                  disabled={isUsed}
                >
                  {letter}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleLetterReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setPhonicsMode(!phonicsMode)}
            className={`px-4 py-2 rounded-lg transition-colors
              ${phonicsMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            🔊 Phonics {phonicsMode ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Character */}
      <div className="relative h-20 mt-8">
        <motion.div
          className="absolute bottom-0"
          animate={{ x: `${(characterPosition / WORD_LIST.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <span className="text-4xl">🦊</span>
        </motion.div>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-2xl text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-indigo-600 mb-2">
                Fantastic Job!
              </h2>
              <p className="text-gray-600">
                You spelled "{currentWord.word}" correctly!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpellQuest; 