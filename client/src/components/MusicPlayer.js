import { useEffect, useRef, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Fallback lyrics for Neighborhood-Reflection
const FALLBACK_LYRICS = [
  'In the neighborhood, I see my reflection',
  'Walking down the street, lost in my direction',
  'Every window shows a different me',
  'Wondering who I really want to be',
  'In the mirror of my mind',
  'I search for what I cannot find',
  'Reflections of the past',
  'Memories that always last',
  'In this neighborhood of dreams',
  'Nothing is quite what it seems',
  'I see myself in every face',
  'Trying to find my own place',
  'Reflection, reflection',
  'Show me my true direction',
  'In this neighborhood we call home',
  'I walk these streets alone',
];

const MusicPlayer = ({ isOpen, onClose }) => {
  const [lyrics, setLyrics] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const lyricsIntervalRef = useRef(null);
  const displayedLinesRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      fetchLyrics();
    } else {
      // Cleanup when closing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (lyricsIntervalRef.current) {
        clearInterval(lyricsIntervalRef.current);
      }
      setCurrentLineIndex(-1);
      setIsPlaying(false);
      displayedLinesRef.current = [];
    }

    return () => {
      if (lyricsIntervalRef.current) {
        clearInterval(lyricsIntervalRef.current);
      }
    };
  }, [isOpen]);

  const fetchLyrics = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/love/music/lyrics`);
      if (!response.ok) throw new Error('Failed to fetch lyrics');
      const data = await response.json();
      setLyrics(data.lyrics || FALLBACK_LYRICS);
    } catch (err) {
      console.warn('Using fallback lyrics:', err.message);
      setLyrics(FALLBACK_LYRICS);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!audioRef.current) {
      // Try to load audio file
      try {
        const audioUrl = '/music/neighborhood-reflection.mp3';
        audioRef.current = new Audio(audioUrl);
        
        audioRef.current.onerror = () => {
          console.warn('Audio file not found, playing without audio');
          startLyricsOnly();
        };

        audioRef.current.oncanplaythrough = () => {
          // Auto-play when ready
          audioRef.current.play().catch((err) => {
            console.warn('Auto-play prevented, user interaction required:', err);
            startLyricsOnly();
          });
          setIsPlaying(true);
          startLyricsDisplay();
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
          if (lyricsIntervalRef.current) {
            clearInterval(lyricsIntervalRef.current);
          }
        };

        audioRef.current.load();
      } catch (err) {
        console.warn('Could not load audio, playing lyrics only:', err);
        startLyricsOnly();
      }
    } else {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        if (lyricsIntervalRef.current) {
          clearInterval(lyricsIntervalRef.current);
        }
      } else {
        audioRef.current.play().catch((err) => {
          console.warn('Play failed:', err);
        });
        setIsPlaying(true);
        if (currentLineIndex === -1) {
          startLyricsDisplay();
        }
      }
    }
  };

  const startLyricsOnly = () => {
    setIsPlaying(true);
    startLyricsDisplay();
  };

  const startLyricsDisplay = () => {
    if (lyrics.length === 0) return;

    setCurrentLineIndex(0);
    displayedLinesRef.current = [0];

    // Calculate timing: show each line for 3-4 seconds
    const lineDuration = 3500; // 3.5 seconds per line

    lyricsIntervalRef.current = setInterval(() => {
      setCurrentLineIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= lyrics.length) {
          clearInterval(lyricsIntervalRef.current);
          setIsPlaying(false);
          return prevIndex;
        }
        // Keep track of displayed lines for fade out animation
        displayedLinesRef.current.push(nextIndex);
        // Remove old lines after fade animation completes
        setTimeout(() => {
          displayedLinesRef.current = displayedLinesRef.current.filter(i => i >= nextIndex - 1);
        }, 600);
        return nextIndex;
      });
    }, lineDuration);
  };

  if (!isOpen) return null;

  return (
    <main className="music-fullpage">
      <button className="music-close-btn-top" onClick={onClose}>
        ✕ Close
      </button>
      
      <button
        className="music-play-btn-top-left"
        onClick={handlePlay}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>

      <div className="music-fullpage-content">
        {isLoading ? (
          <div className="music-loading">Loading lyrics...</div>
        ) : error ? (
          <div className="music-error">{error}</div>
        ) : (
          <div className="lyrics-container-fullpage">
            {lyrics.map((line, index) => {
              const isCurrent = index === currentLineIndex;
              const isPast = index < currentLineIndex && displayedLinesRef.current.includes(index);

              // Only show current line and past lines that are fading out
              if (!isCurrent && !isPast) return null;

              return (
                <div
                  key={index}
                  className={`lyrics-line-fullpage ${isCurrent ? 'lyrics-line-fullpage--current' : ''} ${
                    isPast ? 'lyrics-line-fullpage--past' : ''
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MusicPlayer;

