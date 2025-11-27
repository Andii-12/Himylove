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
    console.log('▶️ Play button clicked, isPlaying:', isPlaying, 'lyrics.length:', lyrics.length);
    
    // If already playing, pause
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      if (lyricsIntervalRef.current) {
        clearInterval(lyricsIntervalRef.current);
      }
      console.log('⏸️ Paused');
      return;
    }

    // Always start lyrics display when play is clicked
    if (lyrics.length > 0) {
      setIsPlaying(true);
      startLyricsDisplay();
    } else {
      console.warn('⚠️ No lyrics loaded yet');
      setIsPlaying(true);
    }

    // Handle audio
    if (!audioRef.current) {
      // Create new audio element
      const audioUrl = '/music/neighborhood-reflection.mp3';
      console.log('🎵 Loading audio from:', audioUrl);
      audioRef.current = new Audio(audioUrl);
      
      // Set up event handlers
      audioRef.current.onerror = (e) => {
        console.warn('❌ Audio file not found at', audioUrl, '- playing lyrics only');
        console.log('💡 To add audio: Place neighborhood-reflection.mp3 in client/public/music/');
      };

      audioRef.current.onended = () => {
        console.log('🏁 Audio ended');
        setIsPlaying(false);
        if (lyricsIntervalRef.current) {
          clearInterval(lyricsIntervalRef.current);
        }
      };

      // Set preload
      audioRef.current.preload = 'auto';
      
      // Try to play
      try {
        // Load the audio first
        audioRef.current.load();
        
        // Function to try playing
        const tryPlay = () => {
          if (audioRef.current && !audioRef.current.paused) {
            return; // Already playing
          }
          audioRef.current.play()
            .then(() => {
              console.log('✅ Audio playing successfully');
            })
            .catch((playError) => {
              console.warn('⚠️ Audio play failed:', playError.message);
              // Lyrics will still play
            });
        };

        // Try immediately (might work if already loaded)
        setTimeout(tryPlay, 100);
        
        // Also try when audio is ready
        audioRef.current.addEventListener('canplay', tryPlay, { once: true });
        audioRef.current.addEventListener('loadeddata', tryPlay, { once: true });
        
      } catch (err) {
        console.warn('❌ Could not initialize audio:', err);
        // Lyrics will still play
      }
    } else {
      // Audio already exists, just play it
      try {
        await audioRef.current.play();
        console.log('✅ Audio resumed');
      } catch (err) {
        console.warn('⚠️ Resume play failed:', err.message);
        // Lyrics will still play
      }
    }
  };

  const startLyricsOnly = () => {
    setIsPlaying(true);
    startLyricsDisplay();
  };

  const startLyricsDisplay = () => {
    if (lyrics.length === 0) {
      console.warn('No lyrics to display');
      return;
    }

    // Clear any existing interval
    if (lyricsIntervalRef.current) {
      clearInterval(lyricsIntervalRef.current);
    }

    setCurrentLineIndex(0);
    displayedLinesRef.current = [0];
    console.log('🎵 Starting lyrics display, total lines:', lyrics.length);

    // Calculate timing: show each line for 3-4 seconds
    const lineDuration = 3500; // 3.5 seconds per line

    lyricsIntervalRef.current = setInterval(() => {
      setCurrentLineIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= lyrics.length) {
          clearInterval(lyricsIntervalRef.current);
          setIsPlaying(false);
          console.log('✅ Lyrics finished');
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

