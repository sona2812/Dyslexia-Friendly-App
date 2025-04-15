import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define sentences array
const sentences = [
  "The friendly dog wagged its tail happily.",
  "I enjoy drinking hot coffee in the morning.",
  "She quickly ran to catch the yellow bus.",
  "We ordered pizza for dinner last night.",
  "The children played games in the park.",
  "He carefully wrapped the birthday present.",
  "They went swimming at the beach today.",
  "My sister baked cookies for the party.",
  "The cat chased the red ball around.",
  "We watched the sunset from the hill.",
  "The students finished their homework early.",
  "She planted flowers in the garden.",
  "They decorated the room for Christmas.",
  "He made a delicious sandwich for lunch.",
  "The birds sang sweetly in the trees."
];

// Congratulations Popup Component
const CongratulationsPopup = ({ onClose }) => {
  return (
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
        <h2 className="text-2xl font-bold text-indigo-600 mb-6">
          Great job! You did it! 🎉
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onClose(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Yayyyy!!
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const ReadingMaze = () => {
  // Initialize state with default values
  const [showCongrats, setShowCongrats] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [lastScoreGained, setLastScoreGained] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentSentence, setCurrentSentence] = useState('');
  const [currentPath, setCurrentPath] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showError, setShowError] = useState(false);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedBestStreak = localStorage.getItem('readingMazeBestStreak');
    const savedScore = localStorage.getItem('readingMazeScore');
    
    if (savedBestStreak) {
      setBestStreak(parseInt(savedBestStreak, 10));
    }
    if (savedScore) {
      setScore(parseInt(savedScore, 10));
    }
  }, []);

  // Save score to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('readingMazeScore', score.toString());
  }, [score]);

  // Save best streak to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('readingMazeBestStreak', bestStreak.toString());
  }, [bestStreak]);

  // Calculate score based on completion time and streak
  const calculateScore = useCallback((completionTime) => {
    const baseScore = 100;
    const timeBonus = Math.max(0, Math.floor(50 - (completionTime / 1000)));
    const streakBonus = Math.floor(streak * 25);
    return baseScore + timeBonus + streakBonus;
  }, [streak]);

  // Select a new random sentence
  const selectNewSentence = useCallback(() => {
    let availableSentences = sentences.filter(s => s !== currentSentence);
    if (availableSentences.length === 0) {
      availableSentences = sentences;
    }
    const newSentence = availableSentences[Math.floor(Math.random() * availableSentences.length)];
    setCurrentSentence(newSentence);
  }, [currentSentence]);

  // Initialize first sentence
  useEffect(() => {
    if (!currentSentence) {
      selectNewSentence();
    }
  }, [selectNewSentence]);

  // Process text into chunks and create maze
  const { correctPath, mazeChunks } = useMemo(() => {
    if (!currentSentence) return { correctPath: [], mazeChunks: [] };

    // Split the sentence into natural chunks
    const correctChunks = currentSentence
      .split(/\s+(?=(?:[A-Z][a-z]+|(?:in|on|at|to|for|the|and|but|or|with)\s))/g)
      .map(chunk => chunk.trim())
      .filter(chunk => chunk.length > 0);

    // Create distractor chunks
    const distractors = [
      ...correctChunks.map(chunk => {
        const words = chunk.split(' ');
        return words.length > 1 ? 
          words.sort(() => Math.random() - 0.5).join(' ') :
          chunk;
      }),
      "the quickly",
      "in happily",
      "for the quickly",
      "with the ran",
      "but the friendly"
    ];

    // Combine and shuffle chunks
    const allChunks = [...correctChunks, ...distractors]
      .filter((chunk, index, self) => self.indexOf(chunk) === index)
      .map(chunk => ({
        text: chunk,
        isCorrect: correctChunks.includes(chunk),
        position: Math.random()
      }))
      .sort((a, b) => a.position - b.position);

    return {
      correctPath: correctChunks,
      mazeChunks: allChunks
    };
  }, [currentSentence]);

  const startNewGame = useCallback(() => {
    setCurrentPath([]);
    setIsAnimating(false);
    setShowCongrats(false);
    setStartTime(null);
    selectNewSentence();
  }, [selectNewSentence]);

  const handleChunkClick = (chunk) => {
    if (isAnimating) return;
    
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    const isNextCorrect = chunk.text === correctPath[currentPath.length];
    
    if (isNextCorrect) {
      setIsAnimating(true);
      setCurrentPath(prev => [...prev, chunk.text]);
      
      setTimeout(() => {
        setIsAnimating(false);
        if (currentPath.length + 1 === correctPath.length) {
          const completionTime = Date.now() - startTime;
          const scoreGained = calculateScore(completionTime);
          setLastScoreGained(scoreGained);
          setScore(prev => prev + scoreGained);
          
          // Update streak
          setStreak(prev => {
            const newStreak = prev + 1;
            if (newStreak > bestStreak) {
              setBestStreak(newStreak);
            }
            return newStreak;
          });
          setShowCongrats(true);
        }
      }, 1000);
    } else {
      setStreak(0);
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-indigo-900">Reading Maze Game</h3>
            <p className="text-sm text-gray-600 mt-1">
              Build sentences by selecting the correct chunks in order
            </p>
          </div>
          <div className="flex gap-4">
            {/* Score Display */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Score:</span>
              <motion.span
                key={score}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
              >
                🏆 {score}
              </motion.span>
            </div>
            {/* Streak displays */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Streak:</span>
              <motion.span
                key={streak}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >
                {streak >= 3 ? '🔥' : '⭐'} {streak}
              </motion.span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Best:</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                👑 {bestStreak}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-700">
            Find the correct path through the maze by clicking chunks in order to form a proper sentence.
            <br />
            <span className="text-sm italic mt-1 block text-blue-600">
              Hint: Start with the chunk that begins the sentence!
            </span>
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {mazeChunks.map((chunk, index) => (
          <motion.div
            key={index}
            className={`
              p-4 rounded-lg cursor-pointer select-none
              ${currentPath.includes(chunk.text) ? 'bg-green-100 text-green-800' : 'bg-white hover:bg-blue-50'}
              ${index === 0 && currentPath.length === 0 && chunk.text.match(/^[A-Z]/) ? 'ring-2 ring-blue-400' : ''}
              shadow-sm border border-gray-200
            `}
            animate={showError && !currentPath.includes(chunk.text) ? {
              x: [-4, 4, -4, 4, 0],
              transition: { duration: 0.4 }
            } : {}}
            whileHover={!currentPath.includes(chunk.text) ? {
              scale: 1.02,
              transition: { duration: 0.2 }
            } : {}}
            onClick={() => !currentPath.includes(chunk.text) && handleChunkClick(chunk)}
          >
            <div className="relative">
              <span className="text-lg">{chunk.text}</span>
              {currentPath.includes(chunk.text) && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress and Current Sentence */}
      {currentPath.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Current sentence:</div>
          <p className="text-lg text-gray-800 font-medium">
            {currentPath.join(' ')}
          </p>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-center"
          >
            That doesn't sound quite right. Try another chunk!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Congratulations Popup */}
      <AnimatePresence>
        {showCongrats && (
          <CongratulationsPopup
            onClose={() => {
              startNewGame();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadingMaze; 