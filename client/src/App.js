import { useEffect, useRef, useState } from 'react';
import FloatingHearts from './components/FloatingHearts';
import AdminPanel from './pages/AdminPanel';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const INTRO_GIF_OPTIONS = [
  'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzlmdGdwYXRtOHZibGJmc3MyZmh0Z240YmNoYnd0dmx3bXU2aDFwMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vFKqnCdLPNOKc/giphy.gif',
  'https://media1.giphy.com/media/l0ExdMqOzE7Lxj6mI/giphy.gif?cid=ecf05e4702c3y3fbecnfytxskkeeqqe2im5uc6c9lqkfvk50&rid=giphy.gif&ct=g',
  'https://media1.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif?cid=ecf05e47p27rxs2h7llq2u9ql6p0ymfl60z629ugz6h8eymt&rid=giphy.gif&ct=g',
];
const QUESTION_GIF_URL =
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm1oN3V1Mjcwa21kZWUzajAwZGdpZjNmOGUyejA4MDgxdzB6M3R4YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1JmGiBtqTuehfYxuy9/giphy.gif';
const FINAL_QUESTION = {
  title: 'I love you too 💞',
  subtitle: '',
  button: 'Press here → 😘',
};
const FINAL_GIF_URL =
  'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDJoMDhxYzYxcHZva2gwcncxemw4MXJvYXlyY25sZjlycTdodGRneiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OTR9mUZ3sajBi7vKHu/giphy.gif';
const HEART_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="240" height="200" viewBox="0 0 240 200"><path fill="%23ff5fa2" d="M120 188s-84-52.3-104-100C3 65 10 38 32 24s52-8 68 14c16-22 46-30 68-14s29 41 16 64c-20 48-104 100-104 100Z"/></svg>';

const fallbackContent = {
  prompts: {
    question: {
      title: 'Do you love me?',
      subtitle: 'Warning: clicking yes may trigger unstoppable cuddles.',
      buttons: {
        yes: 'Yes, obviously!',
        no: 'Nope 🙈',
      },
    },
  },
  funFacts: [
    'Fact: Saying yes makes puppies wag their tails faster.',
    'Your smile is officially my favorite notification.',
  ],
};

const LoveExperience = () => {
  const [currentView, setCurrentView] = useState('intro');
  const [introMessage, setIntroMessage] = useState('');
  const [gifIndex, setGifIndex] = useState(0);
  const [content, setContent] = useState(fallbackContent);
  const [noButtonStyle, setNoButtonStyle] = useState({
    top: '65%',
    left: '60%',
    transform: 'rotate(-3deg)',
  });
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoveBurst, setShowLoveBurst] = useState(false);
  const [showWhyPrompt, setShowWhyPrompt] = useState(false);
  const [whyText, setWhyText] = useState('');
  const [isSubmittingWhy, setIsSubmittingWhy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [whyError, setWhyError] = useState('');
  const noButtonCooldownRef = useRef(0);

  const question = content?.prompts?.question || fallbackContent.prompts.question;

  const handleIntroSubmit = (event) => {
    event.preventDefault();
    if (!introMessage.trim()) {
      setStatusMessage('Type a cute answer first ✨');
      return;
    }
    setStatusMessage('');
    setCurrentView('question');
  };

  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const response = await fetch(`${API_BASE}/api/love/prompts`);
      if (!response.ok) throw new Error('Failed to load prompts');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.warn('Using fallback prompts:', error.message);
      setContent(fallbackContent);
    } finally {
      setLoadingPrompts(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const wiggleNoButton = () => {
    const now = Date.now();
    if (now - noButtonCooldownRef.current < 200) {
      return;
    }
    noButtonCooldownRef.current = now;
    const top = 30 + Math.random() * 50;
    const left = 10 + Math.random() * 70;
    const rotation = -10 + Math.random() * 20;
    setNoButtonStyle({
      top: `${top}%`,
      left: `${left}%`,
      transform: `rotate(${rotation}deg)`,
    });
  };

  const handleYes = async () => {
    if (!introMessage.trim()) {
      setStatusMessage('Type a cute answer first ✨');
      return;
    }
    setIsSubmitting(true);
    setShowLoveBurst(true);
    setTimeout(() => setShowLoveBurst(false), 1500);

    try {
      const response = await fetch(`${API_BASE}/api/love/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'yes', note: introMessage }),
      });

      if (!response.ok) throw new Error('Unable to save response');

      setShowWhyPrompt(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhySubmit = async (event) => {
    event.preventDefault();
    if (!whyText.trim()) {
      setWhyError('Please tell me why 💕');
      return;
    }
    setWhyError('');
    setIsSubmittingWhy(true);
    try {
      const response = await fetch(`${API_BASE}/api/love/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'yes', note: whyText.trim() }),
      });
      if (!response.ok) throw new Error('Unable to save why note');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingWhy(false);
      setShowWhyPrompt(false);
      setWhyText('');
      setStatusMessage('');
      setCurrentView('final');
    }
  };

  if (currentView === 'intro') {
    return (
      <main className="app-shell">
        <FloatingHearts count={14} />
        <div className="intro-screen">
          <p className="eyebrow">secret mission</p>
          <h1>Hi bby 💖</h1>
          <img
            className="intro-gif"
            src={INTRO_GIF_OPTIONS[gifIndex] || HEART_FALLBACK}
            alt="Cute animated hug"
            onError={() => {
              setGifIndex((index) =>
                index < INTRO_GIF_OPTIONS.length ? index + 1 : index,
              );
            }}
            loading="lazy"
          />
          <form className="intro-form" onSubmit={handleIntroSubmit}>
            <input
              type="text"
              placeholder="Answer..."
              value={introMessage}
              onChange={(event) => {
                setIntroMessage(event.target.value);
                if (statusMessage) setStatusMessage('');
              }}
              className="intro-input"
              required
            />
            <button
              type="submit"
              className="love-btn love-btn--yes intro-submit"
              disabled={!introMessage.trim() || isSubmitting}
            >
              Submit
            </button>
            {statusMessage && <p className="status-message">{statusMessage}</p>}
          </form>
        </div>
      </main>
    );
  }

  if (currentView === 'final') {
    return <FinalQuestionView />;
  }

  return (
    <main className="app-shell">
      <FloatingHearts count={18} />
      <div className="question-screen">
        <p className="eyebrow">phase two</p>
        <h1>{loadingPrompts ? 'Loading...' : question.title}</h1>
        <img
          className="question-gif"
          src={FINAL_GIF_URL}
          alt="Love you too gif"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = HEART_FALLBACK;
          }}
        />
        <p className="subtitle">
          {loadingPrompts ? 'One sec...' : question.subtitle}
        </p>
        <div className="button-playground">
          <button
            className="love-btn love-btn--yes"
            onClick={handleYes}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending love...' : question.buttons.yes}
          </button>
          <button
            className="love-btn love-btn--no"
            style={noButtonStyle}
            onMouseEnter={wiggleNoButton}
            onMouseMove={wiggleNoButton}
            onTouchStart={wiggleNoButton}
          >
            {question.buttons.no}
          </button>
          {showLoveBurst && <div className="love-burst">💖</div>}
        </div>
      </div>
      {showWhyPrompt && (
        <div className="why-overlay">
          <div className="why-card">
            <h2>Why?</h2>
            <p className="subtitle">Give me just one adorable reason.</p>
            <form onSubmit={handleWhySubmit}>
              <input
                type="text"
                placeholder="Because..."
                value={whyText}
                onChange={(event) => {
                  setWhyText(event.target.value);
                  if (whyError) setWhyError('');
                }}
                required
              />
              {whyError && <p className="status-message">{whyError}</p>}
              <div className="why-actions">
                <button
                  type="submit"
                  className="love-btn love-btn--yes"
                  disabled={isSubmittingWhy || !whyText.trim()}
                >
                  {isSubmittingWhy ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function FinalQuestionView() {
  const [showCongratsGif, setShowCongratsGif] = useState(false);

  if (showCongratsGif) {
    return (
      <main className="app-shell">
        <FloatingHearts count={24} />
        <div className="question-screen">
          <p className="eyebrow">sealed with a gif</p>
          <img
            className="question-gif"
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3pnZXdwNHpkN2o4MzhqaXAwc2VxbzJ1a2YwbjZleXE2Zzk3eWFtYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W1hd3uXRIbddu/giphy.gif"
            alt="Celebration gif"
          />
          <p className="subtitle">Mmmmmwwwaaaa 😘</p>
          <p className="subtitle">Love you Nigha ❤️</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <FloatingHearts count={20} />
      <div className="question-screen">
        <p className="eyebrow">final message</p>
        <h1>{FINAL_QUESTION.title}</h1>
        <img
          className="question-gif"
          src={QUESTION_GIF_URL}
          alt="Cute cat gif"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = HEART_FALLBACK;
          }}
        />
        <p className="subtitle">{FINAL_QUESTION.subtitle}</p>
        <div className="final-button-row">
          <button
            className="love-btn love-btn--yes"
            onClick={() => setShowCongratsGif(true)}
          >
            {FINAL_QUESTION.button}
          </button>
        </div>
      </div>
    </main>
  );
};

function isAdminRoute() {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
}

export default function App() {
  return isAdminRoute() ? <AdminPanel /> : <LoveExperience />;
}
