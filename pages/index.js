// pages/index.js

import Head from 'next/head';
import Script from 'next/script'; // For external scripts
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';

// 1. Import the CSS file we created


// 2. Define game data as a structured array
const gamesData = [
  { href: '/games/guess-the-price', category: 'Social & Deception', tag: 'Social', icon: 'fa-tag', title: 'Guess the Price', description: 'Price detective? Shopping guru? Test your instincts in Guess the Price – How close can you get?', players: '1-4 Teams', time: '5-10 min' },
  { href: '/games/real-or-ai', category: 'Brain Busters', tag: 'Brainy', icon: 'fa-robot', title: 'Real or AI', description: 'Human masterpiece or AI creation? Test your perception in this reality-blurring game where nothing is quite as it seems!', players: '1-4 Teams', time: '3-5 min' },
  { href: '/games/find-the-imposter', category: 'Social & Deception', tag: 'Deception', icon: 'fa-user-secret', title: 'Find The Imposter', description: 'Deception meets deduction! Get a question, give your answer, and try to blend in... or sniff out the one who doesn\'t quite fit.', players: '3-10 Players', time: '10-15 min' },
  { href: '/games/game4', category: 'Brain Busters', tag: 'Brainy', icon: 'fa-brain', title: 'Point Pursuit', description: 'Ready for a brainy adventure? Dive into 5 exciting trivia categories, scale 5 levels of mind-bending questions, and pursue those points!', players: '2-4 Teams', time: '15-25 min' },
  { href: '/games/game5', category: 'Social & Deception', tag: 'Deception', icon: 'fa-box-open', title: 'Box of Lies', description: 'Deception or truth? Master the art of the perfect poker face as you bluff, trick, and laugh your way to victory!', players: '2 Teams', time: '5-15 min' },
  { href: '/games/game6', category: 'Social & Deception', tag: 'Social', icon: 'fa-comments', title: 'Paranoia', description: 'Trust no one as secrets and suspicions turn friends into nervous wrecks!', players: '3-12 Players', time: '10-20 min' },
  { href: '/games/game7', category: 'Quickfire', tag: 'Quickfire', icon: 'fa-play', title: 'What Happens Next?', description: 'Place your bets on unexpected twists. Will your prediction match the chaotic reality?', players: '1-4 Teams', time: '5-15 min' },
  { href: '/games/game8', category: 'Social & Deception', tag: 'Social', icon: 'fa-heart-circle-exclamation', title: 'Siblings or Dating', description: 'Guess if the pair are family or… something more. Its trickier than you think!', players: '1-4 Teams', time: '3-5 min' },
  { href: '/games/game9', category: 'Quickfire', tag: 'Quickfire', icon: 'fa-stopwatch', title: '5 Seconds Frenzy', description: 'Quick! Name 3 ____ before the timer runs out. Sounds easy? Wait till the pressure kicks in!', players: '2 Teams', time: '3-5 min' },
  { href: '/games/game10', category: 'Quickfire', tag: 'Quickfire', icon: 'fa-folder-tree', title: 'Categories Showdown', description: 'One topic, endless answers — until your mind goes blank!', players: '2 Teams', time: '5-10 min' },
  { href: '/games/game11', category: 'Quickfire', tag: 'Quickfire', icon: 'fa-dumbbell', title: 'Categories Showdown - IRL', description: 'Run, point, jump, shout! Each round comes with a physical challenge.', players: '2 Teams', time: '5-10 min' },
  { href: '/games/game12', category: 'Brain Busters', tag: 'Brainy', icon: 'fa-arrow-down-a-z', title: 'Word Wars', description: 'One word to guess, two captains battling it out. Say less, win more!', players: '2 Teams', time: '5-10 min' },
  { href: '/games/game13', category: 'Brain Busters', tag: 'Brainy', icon: 'fa-lock', title: 'Password Pursuit', description: 'Two captains, two teams, and a whole lot of head-scratching - clue cleverly!', players: '2 Teams', time: '5-10 min' },
  { href: '/games/game14', category: 'Quickfire', tag: 'Quickfire', icon: 'fa-circle-nodes', title: 'Connect the Dots', description: 'Two letters. One word. Fastest brains win!', players: '2 Teams', time: '5-10 min' },
  { href: '/games/game15', category: 'Quickfire', tag: 'Quickfire', icon: 'fa-spell-check', title: 'Gen Z-dle', description: 'It\'s giving... word. You either get it or you don\'t, bestie. 💅', players: '1-4 Players', time: '2-3 min' },
  { href: '/games/game16', category: 'Brain Busters', tag: 'Brainy', icon: 'fa-earth-americas', title: 'Where in the World?', description: 'Journey around the globe without leaving your seat! Decipher the clues and guess the location.', players: '1-4 Teams', time: '3-5 min' },
  { href: '/games/game17', category: 'Brain Busters', tag: 'Brainy', icon: 'fa-flag', title: 'Guess the Flag', description: 'Test your flag knowledge! Can you recognize these colorful banners?', players: '1-2 Teams', time: '2-3 min' },
  { href: '/games/game18', category: 'Brain Busters', tag: 'Brainy', icon: 'fa-face-grin-squint-tears', title: 'Moji Mania', description: 'What story do these emojis tell? Put your interpretation skills to the test!', players: '1-4 Teams', time: '2-3 min' }
];

const categories = ["All Games", "Brain Busters", "Social & Deception", "Quickfire"];

export default function GamesListPage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Games');
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [playCounts, setPlayCounts] = useState({});
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isFavoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [isWelcomeModalOpen, setWelcomeModalOpen] = useState(false);

  // --- REFS FOR DOM ELEMENTS ---
  const backgroundMusicRef = useRef(null);
  const categorySelectSoundRef = useRef(null);
  const itemSelectSoundRef = useRef(null);

  // --- INITIALIZATION & SIDE EFFECTS ---
  useEffect(() => {
    // Load settings from localStorage on initial mount
    const savedVolume = localStorage.getItem('musicVolume');
    const savedSfxEnabled = localStorage.getItem('sfxEnabled');
    const storedCounts = localStorage.getItem('blyzaGamePlays');
    const consentAccepted = localStorage.getItem('blyzaConsentAccepted');

    if (savedVolume !== null) setMusicVolume(parseFloat(savedVolume));
    if (savedSfxEnabled !== null) setSfxEnabled(savedSfxEnabled === 'true');
    if (storedCounts) setPlayCounts(JSON.parse(storedCounts));

    if (!consentAccepted) {
        setWelcomeModalOpen(true);
    } else {
        // For returning users, attempt to play music on first interaction
        const playMusicOnInteraction = () => {
            if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
                backgroundMusicRef.current.play().catch(e => console.error("Autoplay blocked:", e));
            }
        };
        document.body.addEventListener('click', playMusicOnInteraction, { once: true });
        return () => document.body.removeEventListener('click', playMusicOnInteraction);
    }
  }, []);

  // Effect to update music volume when state changes
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);
  
  // --- CORE FUNCTIONS ---
  const playSound = (audioRef) => {
    if (sfxEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {});
    }
  };

  const handleNavigation = (url, isGameLink = false) => {
    playSound(itemSelectSoundRef);
    
    if (isGameLink) {
        const newPlayCounts = { ...playCounts, [url]: (playCounts[url] || 0) + 1 };
        setPlayCounts(newPlayCounts);
        localStorage.setItem('blyzaGamePlays', JSON.stringify(newPlayCounts));
    }
    
    // Delay navigation to allow sound to play
    setTimeout(() => {
      router.push(url);
    }, 300);
  };

  const handleAcceptCookies = () => {
      playSound(itemSelectSoundRef);
      localStorage.setItem('blyzaConsentAccepted', 'true');
      setWelcomeModalOpen(false);
      
      // Now that user has consented, try to play music on their next interaction
      const playMusicOnInteraction = () => {
        if (backgroundMusicRef.current && backgroundMusicRef.current.paused) {
            backgroundMusicRef.current.play().catch(e => console.error("Autoplay blocked:", e));
        }
      };
      document.body.addEventListener('click', playMusicOnInteraction, { once: true });
  }

  // --- MEMOIZED VALUES ---
  const filteredGames = useMemo(() => {
    return gamesData.filter(game => {
      const matchesCategory = activeCategory === 'All Games' || game.category === activeCategory;
      const matchesSearch = searchTerm === '' || 
                            game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            game.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  const sortedFavorites = useMemo(() => {
      return Object.entries(playCounts)
          .map(([href, count]) => {
              const game = gamesData.find(g => g.href === href);
              return {
                  title: game ? game.title : 'Unknown Game',
                  count,
              };
          })
          .sort((a, b) => b.count - a.count);
  }, [playCounts]);
  
  // --- RENDER ---
  return (
    <>
      <Head>
        <title>Blyza - Powered by Fun, Driven by Rewards!</title>
        <meta name="description" content="The party games platform that pays you back — with EXCLUSIVE OFFERS, PRIZES, and non-stop FUN!" />
        <meta name="keywords" content="party games , Blyza , team building games, group games, online games with friends, fun games, browser games, find imposter, imposter games" />
        <meta property="og:title" content="Blyza - Powered by Fun, Driven by Rewards!" />
        <meta property="og:description" content="The party games platform that pays you back — with EXCLUSIVE OFFERS, PRIZES, and non-stop FUN!" />
        <meta property="og:url" content="https://www.playblyza.com" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="hero-background-elements">
        <div className="bg-game-element game-controller game-controller-1"><i className="fas fa-gamepad"></i></div>
        <div className="bg-game-element game-joystick game-joystick-1">
            <div className="joystick-base"></div><div className="joystick-stick"></div><div className="joystick-top"></div>
        </div>
        <div className="bg-game-element game-over-text game-over-text-1">PLAY<br/>NOW</div>
        <div className="bg-game-element game-arcade game-arcade-1"><i className="fas fa-ghost"></i></div>
      </div>

      <main>
          <div className="store-btn-container">
              <a onClick={() => handleNavigation('/store')} className="store-btn btn-retro-floating" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-store"></i> Store
              </a>
          </div>
      
          <div className="top-left-buttons-container">
              <button onClick={() => { playSound(categorySelectSoundRef); setSettingsModalOpen(true); }} className="settings-btn btn-retro-floating" aria-label="Open Settings">
                  <i className="fas fa-cog"></i>
              </button>
              <button onClick={() => { playSound(categorySelectSoundRef); setFavoritesModalOpen(true); }} className="favorites-btn btn-retro-floating" aria-label="Open My Favourite Games">
                  <i className="fas fa-heart"></i>
              </button>
          </div>
      
          <div className="page-header">
              <img className="brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot"/>
              <h1>Blyza Game Center</h1>
              <p className="subtitle">Choose your challenge! Jump into our library of fun & funky games.</p>
          </div>
      
          <div className="container">
              <div className="search-container">
                  <div className="search-bar">
                      <i className="fas fa-search search-icon"></i>
                      <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Search for a game..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
                  <button id="surprise-me-btn" onClick={() => {
                      if (filteredGames.length > 0) {
                          const randomGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
                          handleNavigation(randomGame.href, true);
                      }
                  }}>
                    <i className="fas fa-dice"></i> Surprise Me!
                  </button>
              </div>
          
              <div className="category-filter">
                  {categories.map(category => (
                      <button 
                        key={category} 
                        className={`category-btn ${activeCategory === category ? 'active' : ''}`} 
                        data-category={category}
                        onClick={() => {
                            playSound(categorySelectSoundRef);
                            setActiveCategory(category);
                        }}
                      >
                        {category}
                      </button>
                  ))}
              </div>
          
              <div className="games-grid" style={{ animationPlayState: searchTerm ? 'paused' : 'running' }}>
                  {filteredGames.map((game, index) => (
                      <div 
                        key={game.href} 
                        className="game-card-item" 
                        data-category={game.category}
                        style={{ display: 'flex' }} // We control visibility via the array now
                        onClick={() => handleNavigation(game.href, true)}
                      >
                          <div className="game-card-content">
                              <span className="category-tag">{game.tag}</span>
                              <i className={`fas ${game.icon} game-icon`}></i>
                              <h3 className="game-title"><a href={game.href} onClick={(e) => e.preventDefault()}>{game.title}</a></h3>
                              <p className="game-description">{game.description}</p>
                              <div className="game-stats">
                                  <span className="game-stat"><i className="fas fa-users"></i> {game.players}</span>
                                  <span className="game-stat"><i className="fas fa-clock"></i> {game.time}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </main>

      {/* --- Modals --- */}
      {isSettingsModalOpen && (
          <div id="settings-modal" className="modal" style={{ display: 'flex' }} onClick={() => setSettingsModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <span className="close-modal-btn" onClick={() => setSettingsModalOpen(false)}>×</span>
                  <h2>Settings</h2>
                  <div className="setting-item">
                      <label htmlFor="bgm-volume-slider">Music Volume:</label>
                      <input type="range" id="bgm-volume-slider" min="0" max="1" step="0.01" value={musicVolume} onChange={(e) => {
                          const newVol = parseFloat(e.target.value);
                          setMusicVolume(newVol);
                          localStorage.setItem('musicVolume', newVol);
                      }} />
                  </div>
                  <div className="setting-item">
                      <label htmlFor="sfx-toggle-btn">Sound Effects:</label>
                      <button id="sfx-toggle-btn" className={`sfx-toggle ${!sfxEnabled ? 'off' : ''}`} onClick={() => {
                          const newSfxState = !sfxEnabled;
                          setSfxEnabled(newSfxState);
                          localStorage.setItem('sfxEnabled', newSfxState);
                          playSound(categorySelectSoundRef);
                      }}>
                          SFX: {sfxEnabled ? 'ON' : 'OFF'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isFavoritesModalOpen && (
          <div id="favorites-modal" className="modal" style={{ display: 'flex' }} onClick={() => setFavoritesModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <span className="close-modal-btn" onClick={() => setFavoritesModalOpen(false)}>×</span>
                  <h2>My Favourite Games</h2>
                  <ul id="favorites-list" className="favorites-list">
                      {sortedFavorites.length > 0 ? (
                          sortedFavorites.map(fav => (
                              <li key={fav.title}>
                                  <span className="game-name">{fav.title}</span>
                                  <span className="play-count"><i className="fas fa-play"></i> {fav.count}</span>
                              </li>
                          ))
                      ) : (
                          <li className="no-favorites-message">You haven't played any games yet!</li>
                      )}
                  </ul>
              </div>
          </div>
      )}

      {isWelcomeModalOpen && (
          <div id="welcome-modal-overlay" className="modal" style={{ display: 'flex' }}>
              <div className="modal-content welcome-modal-content">
                  <img className="brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" style={{maxHeight: '100px', marginBottom: '20px'}}/>
                  <h2>Welcome to Blyza!</h2>
                  <p className="welcome-text">Enjoy free party games, get exclusive rewards! To give you the best experience and remember your settings & favorite games, we use your browser's local storage. By continuing, you agree to this.</p>
                  <button id="accept-cookies-btn" className="btn-retro-floating" onClick={handleAcceptCookies}>
                      Accept cookies and dive in! <i className="fas fa-rocket"></i>
                  </button>
              </div>
          </div>
      )}

      {/* --- Audio Elements --- */}
      <audio ref={backgroundMusicRef} id="background-music" loop src="https://static.wixstatic.com/mp3/9ce3e5_973dcdec546a44b594013ec040a9eb20.mp3"></audio>
      <audio ref={categorySelectSoundRef} id="category-select-sound" src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav"></audio>
      <audio ref={itemSelectSoundRef} id="item-select-sound" src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3"></audio>

      {/* Vercel Analytics Script */}
      <Script id="vercel-analytics-init">
          {`window.va = window.va || function () { (window.va.q = window.va.q || []).push(arguments); };`}
      </Script>
      <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
    </>
  );
}
