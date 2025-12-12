import { useEffect, useRef, useState } from 'react';
import FloatingHearts from './components/FloatingHearts';
import AdminPanel from './pages/AdminPanel';
import MusicPlayer from './components/MusicPlayer';
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
  title: 'Good Choice 💞',
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
      title: 'Are you ready to next date ?',
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
  const [statusMessage, setStatusMessage] = useState('');
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [drinkChoice, setDrinkChoice] = useState('');
  const [activityChoice, setActivityChoice] = useState('');
  const [activityDetail, setActivityDetail] = useState('');
  const [dressHeight, setDressHeight] = useState('');
  const [dressWeight, setDressWeight] = useState('');
  const [dateChoice, setDateChoice] = useState('');
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

      setStatusMessage('Good');
      setCurrentView('good');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitChoices = async () => {
    const summary = [
      drinkChoice ? `Drink: ${drinkChoice}` : null,
      activityChoice ? `Activity: ${activityChoice}` : null,
      activityDetail ? `Detail: ${activityDetail}` : null,
      dressHeight ? `Height: ${dressHeight}` : null,
      dressWeight ? `Weight: ${dressWeight}` : null,
      dateChoice ? `Date: ${dateChoice}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    if (!summary) return;

    try {
      await fetch(`${API_BASE}/api/love/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'yes', note: summary }),
      });
    } catch (error) {
      console.error('Failed to sync choices', error);
    }
  };

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  if (currentView === 'intro') {
    return (
      <main className="app-shell">
        <button
          className="music-section-btn"
          onClick={() => setShowMusicPlayer(true)}
          title="Music"
        >
          🎵
        </button>
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

  if (currentView === 'good') {
    return (
      <GoodView
        statusMessage={statusMessage}
        onNext={() => setCurrentView('homeDate')}
        showMusicPlayer={showMusicPlayer}
        setShowMusicPlayer={setShowMusicPlayer}
      />
    );
  }

  if (currentView === 'homeDate') {
    return (
      <HomeDateView
        onYes={() => setCurrentView('chooseDate')}
        onNo={() => setCurrentView('homeDate')}
        showMusicPlayer={showMusicPlayer}
        setShowMusicPlayer={setShowMusicPlayer}
      />
    );
  }

  if (currentView === 'chooseDate') {
    return (
      <ChooseDateView
        onSelect={(choice) => setDrinkChoice(choice)}
        onNext={() => setCurrentView('chooseActivity')}
        showMusicPlayer={showMusicPlayer}
        setShowMusicPlayer={setShowMusicPlayer}
      />
    );
  }

  if (currentView === 'chooseActivity') {
    return (
      <ChooseActivityView
        onSelectActivity={(choice) => setActivityChoice(choice)}
        onSelectDetail={(detail) => setActivityDetail(detail)}
        onFinish={() => setCurrentView('dress')}
        showMusicPlayer={showMusicPlayer}
        setShowMusicPlayer={setShowMusicPlayer}
      />
    );
  }

  if (currentView === 'dress') {
    return (
      <DressView
        onYes={() => setCurrentView('dressDetails')}
        onNo={() => setCurrentView('final')}
        showMusicPlayer={showMusicPlayer}
        setShowMusicPlayer={setShowMusicPlayer}
      />
    );
  }

  if (currentView === 'dressDetails') {
    return (
      <DressDetailsView
        onSubmit={({ height, weight }) => {
          setDressHeight(height);
          setDressWeight(weight);
          setCurrentView('dateSelect');
        }}
        onCancel={() => setCurrentView('dateSelect')}
        showMusicPlayer={showMusicPlayer}
        setShowMusicPlayer={setShowMusicPlayer}
      />
    );
  }

  if (currentView === 'dateSelect') {
    return (
      <DateSelectView
        onChooseDate={(choice) => setDateChoice(choice)}
        onDone={async () => {
          await submitChoices();
          setCurrentView('final');
        }}
        showMusicPlayer={showMusicPlayer}
        setShowMusicPlayer={setShowMusicPlayer}
      />
    );
  }

  if (currentView === 'final') {
    return <FinalQuestionView showMusicPlayer={showMusicPlayer} setShowMusicPlayer={setShowMusicPlayer} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
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
    </main>
  );
}

function GoodView({ statusMessage, onNext, showMusicPlayer, setShowMusicPlayer }) {
  const displayMessage = statusMessage || 'Good';

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
      <FloatingHearts count={20} />
      <div className="question-screen">
        <p className="eyebrow">next phase</p>
        <h1>{displayMessage}</h1>
        <img
          className="question-gif"
          src={FINAL_GIF_URL}
          alt="Happy gif"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = HEART_FALLBACK;
          }}
        />
        <div className="final-button-row">
          <button className="love-btn love-btn--yes" onClick={onNext}>
            Next page
          </button>
        </div>
      </div>
    </main>
  );
}

function HomeDateView({ onYes, onNo, showMusicPlayer, setShowMusicPlayer }) {
  const [showWhy, setShowWhy] = useState(false);

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
      <FloatingHearts count={18} />
      <div className="question-screen">
        <p className="eyebrow">next phase</p>
        <h1>Do you like Home Date ?</h1>
        <img
          className="question-gif"
          src={QUESTION_GIF_URL}
          alt="Cute cat gif"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = HEART_FALLBACK;
          }}
        />
        <p className="subtitle">i have plans ;)</p>
        <div className="final-button-row">
          <button className="love-btn love-btn--yes" onClick={onYes}>
            Yes
          </button>
          <button
            className="love-btn love-btn--no"
            onClick={() => {
              setShowWhy(true);
            }}
          >
            No
          </button>
        </div>
        {showWhy && (
          <p className="status-message" style={{ marginTop: '1rem' }}>
            WHY 😢
          </p>
        )}
      </div>
    </main>
  );
}

function ChooseDateView({ onSelect, onNext, showMusicPlayer, setShowMusicPlayer }) {
  const [selection, setSelection] = useState('');
  const [customDrink, setCustomDrink] = useState('');
  const dateIdeas = [
    {
      title: 'Chocolate milk',
      img: 'https://www.sugarsaltmagic.com/wp-content/uploads/2020/10/Homemade-Chcolate-Milk-6FEATURED.jpg',
    },
    {
      title: 'Juice',
      img: 'https://play-lh.googleusercontent.com/9edIQw3IulBae6kreGNlm59hG4kloEGXE5bEfuoxcPGlI47Jz-ZJpl1dwO5Zn5U9UFM',
    },
    {
      title: 'Wine',
      img: 'https://bravofarms.com/cdn/shop/products/red-wine.jpg?v=1646253890',
    },
    {
      title: 'Water',
      img: 'https://www.thespruceeats.com/thmb/4Uxr_CKC7aR-UhEicIvVqLaiO0k=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-488636063-5ab2dbd8a8ff48049cfd36e8ad841ae5.jpg',
    },
  ];

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
      <FloatingHearts count={16} />
      <div className="question-screen">
        <p className="eyebrow">date picker</p>
        <h1>Choose drinks</h1>
        <p className="subtitle">Pick your drink for the night</p>
        <div className="date-grid">
          {dateIdeas.map((idea) => (
            <button
              key={idea.title}
              className={`date-card ${selection === idea.title ? 'date-card--selected' : ''}`}
              onClick={() => {
                setSelection(idea.title);
                onSelect(idea.title);
              }}
              title={idea.title}
            >
              <img src={idea.img} alt={idea.title} loading="lazy" />
              <span>{idea.title}</span>
            </button>
          ))}
        </div>
        {selection && (
          <div className="final-button-row">
            <button className="love-btn love-btn--yes" onClick={onNext}>
              Next
            </button>
          </div>
        )}
        <div className="custom-section">
          <p className="subtitle">Or add your own drink</p>
          <div className="custom-row">
            <input
              type="text"
              placeholder="Custom drink"
              value={customDrink}
              onChange={(e) => setCustomDrink(e.target.value)}
            />
            <button
              className="love-btn love-btn--yes"
              type="button"
              onClick={() => {
                if (customDrink.trim()) {
                  setSelection(customDrink.trim());
                  onSelect(customDrink.trim());
                }
              }}
              disabled={!customDrink.trim()}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function ChooseActivityView({ onSelectActivity, onSelectDetail, onFinish, showMusicPlayer, setShowMusicPlayer }) {
  const activities = [
    {
      title: 'Video game',
      img: 'https://www.trade.gov.pl/wp-content/uploads/2023/08/gracze-scaled.jpg',
    },
    {
      title: 'Canva',
      img: 'https://novacolorpaint.com/cdn/shop/articles/Small_blank_canvas_on_an_easel_next_to_paint_brushes_4eae5aa5-2e24-4721-aa2f-fcb8775c1bfb.jpg?v=1756480709',
    },
    {
      title: 'Movie',
      img: 'https://www.nexigo.com/cdn/shop/articles/1_d206663e-0079-424a-93fb-5a254f114f91.jpg?v=1749545312',
    },
    {
      title: 'Board game',
      img: 'https://image.smythstoys.com/zoom/175649.webp',
    },
  ];

  const [selection, setSelection] = useState('');
  const [detailSelection, setDetailSelection] = useState('');

  const detailOptions =
    selection === 'Video game'
      ? ['Valorant', 'Minecraft', 'Mortal Kombat 11']
      : selection === 'Movie'
        ? ['Horror', 'Anime', 'Adventure', 'Romantic']
        : [];

  const readyToNext = selection && (detailOptions.length === 0 || detailSelection);

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
      <FloatingHearts count={16} />
      <div className="question-screen">
        <p className="eyebrow">date picker</p>
        <h1>Choose activity</h1>
        <p className="subtitle">Pick what we do next</p>
        <div className="date-grid">
          {activities.map((idea) => (
            <button
              key={idea.title}
              className={`date-card ${selection === idea.title ? 'date-card--selected' : ''}`}
              onClick={() => {
                setSelection(idea.title);
                setDetailSelection('');
                onSelectActivity(idea.title);
              }}
              title={idea.title}
            >
              <img src={idea.img} alt={idea.title} loading="lazy" />
              <span>{idea.title}</span>
            </button>
          ))}
        </div>
        {detailOptions.length > 0 && (
          <div className="detail-section">
            <p className="subtitle">
              {selection === 'Video game' ? 'Which game?' : 'Which type of movie?'}
            </p>
            <div className="pill-row">
              {detailOptions.map((option) => (
                <button
                  key={option}
                  className={`pill ${detailSelection === option ? 'pill--active' : ''}`}
                  onClick={() => {
                    setDetailSelection(option);
                    onSelectDetail(option);
                  }}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="custom-section">
          <p className="subtitle">Or add your own activity</p>
          <div className="custom-row">
            <input
              type="text"
              placeholder="Custom activity"
              value={detailSelection}
              onChange={(e) => {
                setDetailSelection(e.target.value);
                onSelectDetail(e.target.value);
              }}
            />
            <button
              className="love-btn love-btn--yes"
              type="button"
              onClick={() => {
                if (detailSelection.trim()) {
                  setSelection(detailSelection.trim());
                  onSelectActivity(detailSelection.trim());
                }
              }}
              disabled={!detailSelection.trim()}
            >
              Select
            </button>
          </div>
        </div>
        {readyToNext && (
          <div className="final-button-row">
            <button className="love-btn love-btn--yes" onClick={onFinish}>
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function DressView({ onYes, onNo, showMusicPlayer, setShowMusicPlayer }) {
  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
      <FloatingHearts count={18} />
      <div className="question-screen">
        <p className="eyebrow">style check</p>
        <h1>Do you want dress like this ?</h1>
        <img
          className="question-gif"
          src={`${process.env.PUBLIC_URL || ''}/cloth.jpg`}
          alt="Outfit idea"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = HEART_FALLBACK;
          }}
        />
        <div className="final-button-row">
          <button className="love-btn love-btn--yes" onClick={onYes}>
            Yes
          </button>
          <button className="love-btn love-btn--no" onClick={onNo}>
            No
          </button>
        </div>
      </div>
    </main>
  );
}

function DressDetailsView({ onSubmit, onCancel, showMusicPlayer, setShowMusicPlayer }) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ height, weight });
  };

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
      <FloatingHearts count={18} />
      <div className="question-screen">
        <p className="eyebrow">final details</p>
        <h1>Share your fit details</h1>
        <form className="dress-form" onSubmit={handleSubmit}>
          <label className="dress-field">
            Height
            <input
              type="text"
              placeholder="e.g. 170 cm"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </label>
          <label className="dress-field">
            Weight
            <input
              type="text"
              placeholder="e.g. 60 kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </label>
          <div className="final-button-row" style={{ marginTop: '1.25rem' }}>
            <button className="love-btn love-btn--yes" type="submit">
              Next
            </button>
            <button className="love-btn love-btn--no" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function DateSelectView({ onChooseDate, onDone, showMusicPlayer, setShowMusicPlayer }) {
  const dates = [
    'December 23',
    'December 24',
    'December 25',
    'December 26',
    'December 27',
    'December 28',
    'December 29',
    'December 30',
  ];
  const [selection, setSelection] = useState('');

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  return (
    <main className="app-shell">
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
      <FloatingHearts count={16} />
      <div className="question-screen">
        <p className="eyebrow">calendar</p>
        <h1>When we date ?</h1>
        <p className="subtitle">Choose a date between Dec 23 and Dec 30</p>
        <div className="pill-row date-pill-row">
          {dates.map((date) => (
            <button
              key={date}
              className={`pill ${selection === date ? 'pill--active' : ''}`}
              onClick={() => {
                setSelection(date);
                onChooseDate(date);
              }}
              type="button"
            >
              {date}
            </button>
          ))}
        </div>
        {selection && (
          <div className="final-button-row" style={{ marginTop: '1.25rem' }}>
            <button className="love-btn love-btn--yes" onClick={onDone}>
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function FinalQuestionView({ showMusicPlayer, setShowMusicPlayer }) {
  const [showCongratsGif, setShowCongratsGif] = useState(false);

  if (showMusicPlayer) {
    return <MusicPlayer isOpen={showMusicPlayer} onClose={() => setShowMusicPlayer(false)} />;
  }

  if (showCongratsGif) {
    return (
      <main className="app-shell">
        <button
          className="music-section-btn"
          onClick={() => setShowMusicPlayer(true)}
          title="Music"
        >
          🎵
        </button>
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
      <button
        className="music-section-btn"
        onClick={() => setShowMusicPlayer(true)}
        title="Music"
      >
        🎵
      </button>
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
