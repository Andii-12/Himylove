import { useEffect, useRef, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Fallback lyrics for The Neighbourhood - Reflections
const FALLBACK_LYRICS = [
  'Where have you been?',
  'Do you know when you\'re coming back?',
  'Since you\'ve been gone',
  'I\'ve got along, but I\'ve been sad',
  '',
  'I tried to put it out for you to get',
  'Could\'ve, should\'ve, but you never did',
  'Wish you wanted it a little bit',
  'More, but it\'s a chore for you to give',
  '',
  'Where have you been?',
  'Do you know if you\'re coming back?',
  '',
  'We were too close to the stars',
  'I never knew somebody like you, somebody',
  'Falling just as hard',
  'I\'d rather lose somebody than use somebody',
  'Maybe it\'s a blessing in disguise',
  'I see myself in you',
  'I see my reflection in your eyes',
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
  const lastLineIndexRef = useRef(-1);
  const lyricsUpdateHandlerRef = useRef(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      fetchLyrics();
    } else {
      // Cleanup when closing
      if (audioRef.current) {
        if (lyricsUpdateHandlerRef.current) {
          audioRef.current.removeEventListener('timeupdate', lyricsUpdateHandlerRef.current);
        }
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (lyricsIntervalRef.current) {
        clearInterval(lyricsIntervalRef.current);
      }
      setCurrentLineIndex(-1);
      setIsPlaying(false);
      isPlayingRef.current = false;
      displayedLinesRef.current = [];
      lastLineIndexRef.current = -1;
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
      isPlayingRef.current = false;
      if (lyricsIntervalRef.current) {
        clearInterval(lyricsIntervalRef.current);
      }
      if (audioRef.current && lyricsUpdateHandlerRef.current) {
        audioRef.current.removeEventListener('timeupdate', lyricsUpdateHandlerRef.current);
      }
      console.log('⏸️ Paused');
      return;
    }

    // Always start lyrics display when play is clicked
    setIsPlaying(true);
    isPlayingRef.current = true;
    if (lyrics.length > 0) {
      startLyricsDisplay();
    } else {
      console.warn('⚠️ No lyrics loaded yet');
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
        isPlayingRef.current = false;
        if (lyricsIntervalRef.current) {
          clearInterval(lyricsIntervalRef.current);
        }
        // Remove timeupdate listener
        if (audioRef.current && lyricsUpdateHandlerRef.current) {
          audioRef.current.removeEventListener('timeupdate', lyricsUpdateHandlerRef.current);
        }
      };

      // When audio metadata is loaded, sync lyrics
      audioRef.current.addEventListener('loadedmetadata', () => {
        console.log('📊 Audio metadata loaded, duration:', audioRef.current.duration);
        if (isPlaying && lyrics.length > 0) {
          syncLyricsWithAudio();
        }
      });

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
        audioRef.current.addEventListener('canplay', () => {
          tryPlay();
          if (isPlaying && lyrics.length > 0) {
            syncLyricsWithAudio();
          }
        }, { once: true });
        audioRef.current.addEventListener('loadeddata', tryPlay, { once: true });
        
      } catch (err) {
        console.warn('❌ Could not initialize audio:', err);
        // Lyrics will still play
      }
    } else {
      // Audio already exists, just play it
      try {
        await audioRef.current.play();
        isPlayingRef.current = true;
        console.log('✅ Audio resumed');
        // Re-sync lyrics if needed
        if (lyrics.length > 0 && lastLineIndexRef.current === -1) {
          syncLyricsWithAudio();
        }
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

  const syncLyricsWithAudio = () => {
    if (!audioRef.current) {
      // If no audio, use fallback timing
      startLyricsDisplayFallback();
      return;
    }

    if (lyrics.length === 0) {
      console.warn('No lyrics to sync');
      return;
    }

    const audio = audioRef.current;
    
    // Clean up previous listeners
    if (lyricsUpdateHandlerRef.current && audio) {
      audio.removeEventListener('timeupdate', lyricsUpdateHandlerRef.current);
    }
    if (lyricsIntervalRef.current) {
      clearInterval(lyricsIntervalRef.current);
    }

    // Wait for audio duration to be available
    const waitForDuration = () => {
      if (!audio.duration || audio.duration === 0 || isNaN(audio.duration)) {
        setTimeout(waitForDuration, 100);
        return;
      }

      const totalDuration = audio.duration;
      const nonEmptyLyrics = lyrics.filter(line => line.trim() !== '');
      
      if (nonEmptyLyrics.length === 0) {
        console.warn('No non-empty lyrics found');
        return;
      }
      
      const lineDuration = totalDuration / nonEmptyLyrics.length;
      
      console.log('🎵 Syncing lyrics with audio, duration:', totalDuration, 'lineDuration:', lineDuration, 'nonEmptyLines:', nonEmptyLyrics.length);

      // Create mapping of line indices to their start times
      const lineTimings = [];
      let accumulatedTime = 0;
      for (let i = 0; i < lyrics.length; i++) {
        if (lyrics[i].trim() !== '') {
          lineTimings.push({ index: i, startTime: accumulatedTime });
          accumulatedTime += lineDuration;
        }
      }

      console.log('📋 Line timings:', lineTimings.slice(0, 5), '...');

      // Update function that runs on timeupdate
      const updateLyrics = () => {
        if (!audio || audio.paused || !isPlayingRef.current) {
          return;
        }

        const currentTime = audio.currentTime;
        
        // Find the correct line based on current time
        let lineIndex = 0;
        for (let i = lineTimings.length - 1; i >= 0; i--) {
          if (currentTime >= lineTimings[i].startTime) {
            lineIndex = lineTimings[i].index;
            break;
          }
        }

        // Make sure we don't go beyond lyrics length
        if (lineIndex >= lyrics.length) {
          lineIndex = lyrics.length - 1;
        }

        // Only update if line changed
        if (lineIndex !== lastLineIndexRef.current) {
          lastLineIndexRef.current = lineIndex;
          setCurrentLineIndex(lineIndex);
          if (!displayedLinesRef.current.includes(lineIndex)) {
            displayedLinesRef.current.push(lineIndex);
          }
          // Remove old lines (keep current and one before)
          displayedLinesRef.current = displayedLinesRef.current.filter(i => i >= lineIndex - 1);
          console.log(`📝 Line ${lineIndex + 1}/${lyrics.length}: "${lyrics[lineIndex]}" at ${currentTime.toFixed(2)}s`);
        }
      };

      // Store handler for cleanup
      lyricsUpdateHandlerRef.current = updateLyrics;
      
      // Use timeupdate event for better sync (fires ~4 times per second)
      audio.addEventListener('timeupdate', updateLyrics);
      
      // Also use interval for more frequent updates (every 100ms for smoother sync)
      lyricsIntervalRef.current = setInterval(updateLyrics, 100);

      // Initial update
      setCurrentLineIndex(0);
      displayedLinesRef.current = [0];
      lastLineIndexRef.current = 0;
      updateLyrics();
    };

    waitForDuration();
  };

  const startLyricsDisplayFallback = () => {
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
    console.log('🎵 Starting lyrics display (fallback timing), total lines:', lyrics.length);

    // Filter out empty lines for timing calculation
    const nonEmptyLyrics = lyrics.filter(line => line.trim() !== '');
    const lineDuration = 3500; // 3.5 seconds per line for non-empty lines
    let lineCounter = 0;

    lyricsIntervalRef.current = setInterval(() => {
      // Find next non-empty line
      let nextIndex = -1;
      for (let i = currentLineIndex + 1; i < lyrics.length; i++) {
        if (lyrics[i].trim() !== '') {
          nextIndex = i;
          break;
        }
      }

      if (nextIndex === -1 || nextIndex >= lyrics.length) {
        clearInterval(lyricsIntervalRef.current);
        setIsPlaying(false);
        console.log('✅ Lyrics finished');
        return;
      }

      setCurrentLineIndex(nextIndex);
      displayedLinesRef.current.push(nextIndex);
      
      // Remove old lines after fade animation completes
      setTimeout(() => {
        displayedLinesRef.current = displayedLinesRef.current.filter(i => i >= nextIndex - 1);
      }, 600);
    }, lineDuration);
  };

  const startLyricsDisplay = () => {
    syncLyricsWithAudio();
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

