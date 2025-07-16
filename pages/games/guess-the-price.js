import { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
// --- NEW: Firebase Imports ---
import { auth, db } from '../firebase'; // Make sure this path is correct
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue, update, remove, onDisconnect } from 'firebase/database';

// --- NEW: Import the components you will create in Part 2 ---
import MultiplayerStartScreen from '../components/MultiplayerStartScreen';
import LobbyScreen from '../components/LobbyScreen';
import OnlineGameScreen from '../components/OnlineGameScreen';
import OnlineResultsScreen from '../components/OnlineResultsScreen';

// --- Static Game Data (Your existing data, unchanged) ---
const itemsData = [
     { name: "Smartphone", category: "iPhone 16 Pro Max 256GB", price: 1199, image: "https://static.wixstatic.com/media/9ce3e5_9686ddc0bdfe431e8f8a0ec574da5879~mv2.jpg", description: "The latest flagship smartphone from Apple with A18 Pro chip and titanium design." },
     // ... all your other items ...
     { name: "Money", category: "100 Pakistani Rupees in USD", price: 0.32, image: "https://static.wixstatic.com/media/9ce3e5_57e922e9ac0f4754b47f472a3125abaa~mv2.png", description: "My pledge is that I will be pilot." },
];

const GameScreen = { START: 'start', GAME: 'game', RESULTS: 'results', GAME_OVER: 'gameOver' };

// ==================================================================
//  YOUR EXISTING UI COMPONENTS (Unchanged)
// ==================================================================
const StartScreenComponent = ({ gameMode, setGameMode, playSound, sfxRefs, teams, setTeams, handleStartGame, setSinglePlayerSubType, highScore }) => (
    // Your existing StartScreenComponent JSX...
    <div id="start-screen" className="screen active">
        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
        <h1>Guess The Price</h1>
        <div className="instructions">
            <p><strong>HOW TO PLAY:</strong></p>
            <ul>
                <li><i className="fas fa-tag"></i> Guess the price of the displayed item</li>
                <li><i className="fas fa-users"></i> Play with friends (up to 4 teams) or solo</li>
                <li><i className="fas fa-trophy"></i> Closest guess gets a point - first to 5 wins!</li>
            </ul>
        </div>
        <div className="game-mode-selection">
            <div className={`mode-option ${gameMode === 'single' ? 'selected' : ''}`} onClick={() => { playSound(sfxRefs.interaction); setGameMode('single'); }}>
                <i className="fas fa-user"></i>
                <h3>Single Player</h3>
                <p>5 rounds or infinite mode</p>
                {highScore > 0 && <p className="high-score-display">Infinite High Score: {highScore}</p>}
            </div>
            <div className={`mode-option ${gameMode === 'multi' ? 'selected' : ''}`} onClick={() => { playSound(sfxRefs.interaction); setGameMode('multi'); }}>
                <i className="fas fa-users"></i>
                <h3>Multiplayer</h3>
                <p>Play with friends</p>
            </div>
        </div>
        {gameMode === 'single' && (
             <div id="single-player-sub-options">
                <button onClick={() => { setSinglePlayerSubType('5rounds'); handleStartGame(); }} className="btn-primary"><i className="fas fa-list-ol"></i> 5 Rounds</button>
                <button onClick={() => { setSinglePlayerSubType('infinite'); handleStartGame(); }} className="btn-primary"><i className="fas fa-infinity"></i> Infinite Mode</button>
            </div>
        )}
        {gameMode === 'multi' && (
            <div id="multiplayer-start-area">
                <div className="team-inputs">
                    <h3>Enter Team Names</h3>
                    {teams.map((team, index) => (
                        <div key={index} className="team-input-wrapper">
                            <input type="text" className="team-name-input" placeholder={`Team ${index + 1}`} value={team.name} onChange={(e) => { const newTeams = [...teams]; newTeams[index].name = e.target.value; setTeams(newTeams); }}/>
                            {teams.length > 2 && (<button className="remove-team-btn" onClick={() => setTeams(teams.filter((_, i) => i !== index))}><i className="fas fa-times"></i></button>)}
                        </div>
                    ))}
                    <button id="add-team-btn" onClick={() => teams.length < 4 && setTeams([...teams, { name: '' }])} disabled={teams.length >= 4}>Add Team</button>
                </div>
                <button id="start-game-btn" onClick={handleStartGame}><i className="fas fa-play"></i> Start Game</button>
            </div>
        )}
        {gameMode === 'single' && (
            <div className="start-screen-bottom-actions">
                <button className="btn-secondary" onClick={() => alert(`Your current high score in Infinite Mode is: ${highScore}`)}>
                    <i className="fas fa-star"></i> High Score
                </button>
            </div>
        )}
    </div>
);
const GameScreenComponent = ({ gameMode, singlePlayerSubType, scores, currentRound, curtainsOpen, currentItem, teams, guesses, setGuesses, handleRevealPrice }) => (
    // Your existing GameScreenComponent JSX...
     <div id="game-screen" className="screen active">
        <div className="game-info">
            {gameMode === 'single' && singlePlayerSubType === 'infinite' ? (<div>Score: <span>{scores['You'] || 0}</span></div>) : (<div>Round <span>{currentRound}</span></div>)}
        </div>
        <div className="item-stage-container">
            <div className={`stage-curtains left ${curtainsOpen ? 'open' : ''}`}></div>
            <div className={`stage-curtains right ${curtainsOpen ? 'open' : ''}`}></div>
            <div className="tv-screen-container">
                <h3>What's the price of this item?</h3>
                {currentItem && <>
                    <div className="category-display" style={{ opacity: curtainsOpen ? 1 : 0 }}>{currentItem.category}</div>
                    <img src={currentItem.image} alt={currentItem.name} className="item-image" style={{ opacity: curtainsOpen ? 1 : 0 }} />
                </>}
            </div>
        </div>
        <div id="guess-inputs-area" className="guess-inputs">
            {teams.map((team) => (
                <div key={team.name} className="guess-input-group">
                    <div className="guess-label">{team.name}'s guess:</div>
                    <div className="guess-input-container">
                        <div className="dollar-sign">$</div>
                        <input type="number" className="price-input" placeholder="0.00" min="0" step="0.01" value={guesses[team.name] || ''} onChange={(e) => setGuesses({...guesses, [team.name]: e.target.value})}/>
                    </div>
                </div>
            ))}
        </div>
        <button id="reveal-price-btn" onClick={handleRevealPrice}>Reveal Price <i className="fas fa-eye"></i></button>
    </div>
);
const ResultsScreenComponent = ({ currentItem, guesses, teams, scores, gameMode, singlePlayerSubType, currentRound, setScreen, handleNextRound, roundResults }) => {
    // Your existing ResultsScreenComponent JSX...
    const isGameOver = useMemo(() => {
        if (!roundResults) return false;
        const potentialScores = roundResults.winner ? { ...scores, [roundResults.winner]: (scores[roundResults.winner] || 0) + 1 } : scores;
        if (gameMode === 'multi' && Object.values(potentialScores).some(s => s >= 5)) return true;
        if (gameMode === 'single' && singlePlayerSubType === '5rounds' && currentRound >= 5) return true;
        if (gameMode === 'single' && singlePlayerSubType === 'infinite' && !roundResults.isCorrect) return true;
        return false;
    }, [scores, roundResults, currentRound, gameMode, singlePlayerSubType]);
    
    return (
        <div id="results-screen" className="screen active">
            {currentItem && roundResults && <>
                <div className="result-item">
                    <img src={currentItem.image} alt={currentItem.name} className="item-image" />
                    <div className="price-display">Actual Price: $<span>{currentItem.price.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2 })}</span></div>
                    <div id="item-description-text">{currentItem.description}</div>
                </div>
                <div id="guess-results-area">
                    {teams.map(team => (
                        <div key={team.name} className={`guess-result ${roundResults.winner === team.name ? 'closest-guess' : ''}`}>
                            <div><b>{team.name}</b></div>
                            <div>Guessed: ${parseFloat(guesses[team.name] || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                            <div className="difference-display">Difference: ${roundResults.diffs[team.name]?.toLocaleString(undefined, {minimumFractionDigits: 2}) || 'N/A'}</div>
                            {roundResults.winner === team.name && <div className="winner-badge">{gameMode === 'single' ? 'Within 15%! +1 point' : 'Closest Guess! +1 point'}</div>}
                        </div>
                    ))}
                </div>
                <div id="score-display-area" className="score-display">{Object.entries(scores).map(([name, score]) => ( <div key={name} className="score-card"><h4>{name}</h4><div className="text-2xl font-bold">{score}</div></div>))}</div>
                {isGameOver ? (
                    <button id="next-round-btn" onClick={() => setScreen(GameScreen.GAME_OVER)}>{singlePlayerSubType === 'infinite' ? 'See Final Score' : 'See Final Results'}</button>
                ) : (
                    <button id="next-round-btn" onClick={handleNextRound}>Next Round <i className="fas fa-arrow-right"></i></button>
                )}
            </>}
        </div>
    );
};
const GameOverScreenComponent = ({ scores, gameMode, handleNewGame, singlePlayerSubType, highScore, setHighScore }) => {
    // Your existing GameOverScreenComponent, with a slight modification for router usage
    const router = useRouter();
    // ... rest of your GameOverScreenComponent logic
    useEffect(() => { 
      if (gameMode === 'single' && singlePlayerSubType === 'infinite') {
          const finalScore = scores['You'] || 0;
          if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem('guessThePriceHighScore', finalScore.toString());
          }
      }

      const triggerConfetti = () => {
        if (typeof window === 'undefined') return;
        const colors = ['#FF8833', '#cb7ae1', '#00BFA6', '#FFDF00'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.top = '-20px';
            const animDuration = Math.random() * 3 + 2;
            confetti.style.animation = `fallAndFade ${animDuration}s linear ${Math.random()}s forwards`;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), (animDuration + 1.1) * 1000);
        }
      };
      triggerConfetti(); 
    }, []);
    
    const winnerMessage = useMemo(() => {
        if (gameMode === 'single') return "Game Over!";
        if (!scores || Object.keys(scores).length === 0) return "Game Over";
        const maxScore = Math.max(...Object.values(scores));
        const winners = Object.keys(scores).filter(name => scores[name] === maxScore);
        return winners.length === 1 ? `${winners[0]} Wins!` : "It's a Tie!";
    }, [scores, gameMode]);

    return (
        <div id="game-over-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot"/>
            <div className="win-message">{winnerMessage}</div><div className="winner-trophy">🏆</div>
            <div id="final-scores-area" className="score-display">
                 {Object.entries(scores).map(([name, score]) => (
                    <div key={name} className={`score-card ${winnerMessage.includes(name) ? 'winner-glow' : ''}`}>
                        <h4>{name}</h4>
                        <div className="text-3xl font-bold">{score}</div>
                    </div>
                ))}
            </div>
            {gameMode === 'single' && singlePlayerSubType === 'infinite' && (
                <div className="high-score-final-display">
                    <h3>High Score: {highScore}</h3>
                </div>
            )}
            <div className="game-over-buttons-container">
                <button id="play-again-btn" onClick={handleNewGame} className="btn-success"><i className="fas fa-redo"></i> Play Again</button>
            </div>
            
            <div className="store-promo-container">
                <div className="promo-text-wrapper">
                    <span className="promo-text">Treat yourself!</span>
                    <i className="fas fa-long-arrow-alt-down promo-arrow"></i>
                </div>
                <button onClick={() => router.push('/store')} className="btn-primary btn-store">
                    <i className="fas fa-shopping-bag"></i> Visit Store
                </button>
            </div>
        </div>
    );
};
const SettingsModal = ({ setOpen, musicVolume, setMusicVolume, sfxEnabled, setSfxEnabled, playSound, sfxRefs }) => (
    // Your existing SettingsModal JSX...
    <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content">
            <span className="close-modal-btn" onClick={() => setOpen(false)}>×</span>
            <h2>Settings</h2>
            <div className="setting-item">
                <label htmlFor="music-volume">Music Volume</label>
                <input id="music-volume" type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))} />
            </div>
            <div className="setting-item">
                <label>Sound Effects</label>
                <button id="sfx-toggle-btn" className={sfxEnabled ? 'sfx-on' : 'sfx-off'} onClick={() => { playSound(sfxRefs.interaction); setSfxEnabled(!sfxEnabled); }}>
                    {sfxEnabled ? 'On' : 'Off'}
                </button>
            </div>
        </div>
    </div>
);


// ==================================================================
//  MAIN PAGE COMPONENT (Completely new logic)
// ==================================================================
export default function GuessThePricePage() {
    const router = useRouter();

    // --- State for Mode Selection ---
    const [playMode, setPlayMode] = useState(null); // 'local', 'online', or null

    // --- State for LOCAL game (your original state) ---
    const [screen, setScreen] = useState(GameScreen.START);
    const [teams, setTeams] = useState([{ name: 'Team 1' }, { name: 'Team 2' }]);
    const [gameMode, setGameMode] = useState('single');
    const [singlePlayerSubType, setSinglePlayerSubType] = useState('5rounds');
    const [scores, setScores] = useState({});
    const [highScore, setHighScore] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentItem, setCurrentItem] = useState(null);
    const [usedItems, setUsedItems] = useState([]);
    const [guesses, setGuesses] = useState({});
    const [roundResults, setRoundResults] = useState(null);
    const [curtainsOpen, setCurtainsOpen] = useState(false);

    // --- State for ONLINE game (new state) ---
    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);

    // --- Shared State (Audio, Modals, etc.) ---
    const [isAudioConsentModalOpen, setAudioConsentModalOpen] = useState(true);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [musicVolume, setMusicVolume] = useState(0.3);
    const [audioContextStarted, setAudioContextStarted] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const backgroundMusicRef = useRef(null);
    const sfxRefs = { start: useRef(null), interaction: useRef(null), correct: useRef(null), wrong: useRef(null), curtain: useRef(null) };
    
    // --- All your existing useEffects for local game ---
    useEffect(() => {
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        window.addEventListener('resize', setAppHeight); setAppHeight();
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    useEffect(() => {
        const savedVol = localStorage.getItem('musicVolume');
        const savedSfx = localStorage.getItem('sfxEnabled');
        const savedHighScore = localStorage.getItem('guessThePriceHighScore');
        if (savedVol !== null) setMusicVolume(parseFloat(savedVol));
        if (savedSfx !== null) setSfxEnabled(savedSfx === 'true');
        if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    }, []);

    useEffect(() => {
        localStorage.setItem('musicVolume', musicVolume);
        if (backgroundMusicRef.current) backgroundMusicRef.current.volume = musicVolume;
        if (audioContextStarted && musicVolume > 0 && backgroundMusicRef.current?.paused) {
            backgroundMusicRef.current.play().catch(e => {});
        } else if (musicVolume <= 0) {
            backgroundMusicRef.current?.pause();
        }
    }, [musicVolume, audioContextStarted]);

    useEffect(() => { localStorage.setItem('sfxEnabled', String(sfxEnabled)); }, [sfxEnabled]);
    
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!backgroundMusicRef.current) return;
            if (document.hidden) {
                backgroundMusicRef.current.pause();
            } else {
                if (audioContextStarted && musicVolume > 0 && backgroundMusicRef.current.paused) {
                    backgroundMusicRef.current.play().catch(e => {});
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [audioContextStarted, musicVolume]);


    // --- All your existing local game functions ---
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
    };
    const initAudio = () => { if (audioContextStarted) return; setAudioContextStarted(true); };
    const playSound = (soundRef) => { if (sfxEnabled && soundRef.current && audioContextStarted) { soundRef.current.currentTime = 0; soundRef.current.play().catch(e => {}); }};
    const setupRound = (currentUsedItems = usedItems) => {
        setGuesses({});
        setRoundResults(null);
        setCurtainsOpen(false);
        let available = itemsData.filter(i => !currentUsedItems.some(u => u.name === i.name));
        if (available.length === 0) {
            available = [...itemsData];
            setUsedItems([]); 
        }
        const nextItem = available[Math.floor(Math.random() * available.length)];
        setCurrentItem(nextItem);
        setUsedItems(prev => [...prev, nextItem]);
        setTimeout(() => { playSound(sfxRefs.curtain); setCurtainsOpen(true); }, 500);
    };
    const handleStartGame = () => {
        playSound(sfxRefs.start);
        initAudio();
        let playerObjects;
        let initialScores = {};
        if (gameMode === 'single') {
            playerObjects = [{ name: 'You' }];
            initialScores = { 'You': 0 };
        } else {
            playerObjects = teams.map((team, index) => ({ name: team.name.trim() || `Team ${index + 1}` }));
            if (playerObjects.length < 2) { alert('You need at least 2 teams!'); return; }
            playerObjects.forEach(p => initialScores[p.name] = 0);
        }
        setScores(initialScores);
        setTeams(playerObjects);
        setCurrentRound(1);
        setUsedItems([]);
        setupRound([]);
        setScreen(GameScreen.GAME);
    };
    const handleRevealPrice = () => {
        if (Object.keys(guesses).length < teams.length || Object.values(guesses).some(g => g === '' || g === null)) {
            alert('Please enter a guess for every team!'); return;
        }
        let winner = null, isCorrect = false; const diffs = {};
        if (gameMode === 'single') {
            const guess = parseFloat(guesses['You'] || 0);
            const diff = Math.abs(guess - currentItem.price);
            diffs['You'] = diff;
            isCorrect = (diff / currentItem.price) <= 0.15;
            if (isCorrect) { winner = 'You'; playSound(sfxRefs.correct); showToast("Correct Answer!", 'correct');} else { playSound(sfxRefs.wrong); showToast("Wrong Answer!", 'wrong');}
        } else {
            let smallestDiff = Infinity;
            teams.forEach(team => {
                const guess = parseFloat(guesses[team.name] || 0);
                const diff = Math.abs(guess - currentItem.price);
                diffs[team.name] = diff;
                if (diff < smallestDiff) { smallestDiff = diff; winner = team.name; }
                else if (diff === smallestDiff) { winner = null; }
            });
            if (winner) { playSound(sfxRefs.correct); showToast(`${winner} got it right!`, 'correct'); } else { playSound(sfxRefs.wrong); showToast("Nobody got it!", 'wrong'); }
        }
        const results = { winner, diffs, isCorrect };
        setRoundResults(results);
        if (results.winner) {
            setScores(prev => ({ ...prev, [results.winner]: (prev[results.winner] || 0) + 1 }));
        }
        setScreen(GameScreen.RESULTS);
    };
    const handleNextRound = () => {
      playSound(sfxRefs.interaction);
      setScreen(GameScreen.GAME);
      setCurrentRound(prev => prev + 1);
      setupRound();
    }
    const handleNewGame = () => {
        playSound(sfxRefs.interaction);
        setScreen(GameScreen.START);
        setGameMode('single');
        setTeams([{ name: 'Team 1' }, { name: 'Team 2' }]);
    };
    

    // --- NEW: Firebase Logic ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (playMode !== 'online' || !gameId || !user) {
            setGameState(null);
            return;
        }
        const gameRef = ref(db, `games/${gameId}`);
        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setGameState(data);
            } else {
                setGameState(null);
                setGameId(null);
                showToast("The game session has ended.", "info");
            }
        });
        const playerRef = ref(db, `games/${gameId}/players/${user.uid}`);
        onDisconnect(playerRef).remove();
        return () => unsubscribe();
    }, [playMode, gameId, user]);
    
    const createGame = async (playerName) => {
        if (!user) return showToast("Authentication error, please wait.", "wrong");
        const newGameId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const gameRef = ref(db, `games/${newGameId}`);
        const initialGameState = {
            hostId: user.uid, status: 'lobby', createdAt: Date.now(),
            players: { [user.uid]: { name: playerName, score: 0 } }
        };
        await set(gameRef, initialGameState);
        setGameId(newGameId);
    };

    const joinGame = (idToJoin, playerName) => {
        if (!user) return showToast("Authentication error, please wait.", "wrong");
        const gameRef = ref(db, `games/${idToJoin}`);
        onValue(gameRef, async (snapshot) => {
            if (snapshot.exists() && snapshot.val().status === 'lobby') {
                await set(ref(db, `games/${idToJoin}/players/${user.uid}`), { name: playerName, score: 0 });
                setGameId(idToJoin);
            } else {
                showToast("Game not found or has already started.", "wrong");
            }
        }, { onlyOnce: true });
    };
    
    const leaveGame = () => {
        if (!user || !gameId || !gameState) return;
        if (gameState.hostId === user.uid) {
            remove(ref(db, `games/${gameId}`));
        } else {
            remove(ref(db, `games/${gameId}/players/${user.uid}`));
        }
        setGameId(null);
        setGameState(null);
    };

    const goBackToModeSelect = () => {
        if (gameId) leaveGame();
        handleNewGame(); // Reset local game state
        setPlayMode(null);
    }
    
    // --- TOP LEVEL RENDER LOGIC ---
    const localGameProps = { gameMode, setGameMode, playSound, sfxRefs, teams, setTeams, handleStartGame, setSinglePlayerSubType, highScore, scores, currentRound, curtainsOpen, currentItem, guesses, setGuesses, handleRevealPrice, roundResults, setScreen, handleNextRound, handleNewGame, setHighScore };

    if (playMode === 'local') {
        return (
            <>
                <Head><title>Guess The Price - Blyza Game Center</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" /></Head>
                <button id="home-menu-btn" className="icon-btn" onClick={goBackToModeSelect}><i className="fas fa-arrow-left"></i></button>
                <button id="settings-btn" className="icon-btn" onClick={() => { playSound(sfxRefs.interaction); setSettingsModalOpen(true); }}><i className="fas fa-cog"></i></button>
                <div className="game-page-wrapper"><div className="hero-background-elements"><div className="bg-game-element bg-dollar-1"><i className="fas fa-dollar-sign"></i></div><div className="bg-game-element bg-tag-1"><i className="fas fa-tag"></i></div><div className="bg-game-element bg-cart-1"><i className="fas fa-shopping-cart"></i></div><div className="bg-game-element bg-cash-1"><i className="fas fa-cash-register"></i></div></div><div className="game-container">{
                    {
                        [GameScreen.START]: <StartScreenComponent {...localGameProps} />,
                        [GameScreen.GAME]: <GameScreenComponent {...localGameProps} />,
                        [GameScreen.RESULTS]: <ResultsScreenComponent {...localGameProps} />,
                        [GameScreen.GAME_OVER]: <GameOverScreenComponent {...localGameProps} />,
                    }[screen]
                }</div></div>
                {toast.show && ( <div className={`toast ${toast.type}`}> {toast.message} </div> )}
                {isAudioConsentModalOpen && <div className="modal" style={{display: 'flex'}}><div className="modal-content"><h2>Enable Audio?</h2><p>This game has sounds. Would you like to enable them?</p><div id="audio-consent-buttons"><button onClick={() => { setAudioConsentModalOpen(false); initAudio(); }} className="btn-success">Yes!</button><button onClick={() => { setSfxEnabled(false); setMusicVolume(0); setAudioConsentModalOpen(false); }} className="btn-secondary">No, thanks</button></div></div></div>}
                {isSettingsModalOpen && <SettingsModal {...{ setOpen: setSettingsModalOpen, musicVolume, setMusicVolume, sfxEnabled, setSfxEnabled, playSound, sfxRefs }} />}
                <audio ref={backgroundMusicRef} loop src="https://static.wixstatic.com/mp3/9ce3e5_380adfaea802407b9a4cebc67f12a216.mp3"></audio><audio ref={sfxRefs.start} src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3"></audio><audio ref={sfxRefs.interaction} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav"></audio><audio ref={sfxRefs.correct} src="https://static.wixstatic.com/mp3/9ce3e5_76691a6fefcd4536aa403ada111e886a.mp3"></audio><audio ref={sfxRefs.wrong} src="https://static.wixstatic.com/mp3/9ce3e5_277f814439064d1bbe5c0342241b23e4.mp3"></audio><audio ref={sfxRefs.curtain} src="https://static.wixstatic.com/mp3/9ce3e5_ccd36cdf98bf4e1594cf2e52d5296c51.wav"></audio>
                <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
            </>
        );
    } 
    
    if (playMode === 'online') {
        const onlineGameProps = { user, gameId, gameState, leaveGame, itemsData, db, playSound, sfxRefs, showToast };
        return (
            <>
                <Head><title>Guess The Price - Online</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" /></Head>
                <button id="home-menu-btn" className="icon-btn" onClick={goBackToModeSelect}><i className="fas fa-arrow-left"></i></button>
                <button id="settings-btn" className="icon-btn" onClick={() => { playSound(sfxRefs.interaction); setSettingsModalOpen(true); }}><i className="fas fa-cog"></i></button>
                <div className="game-page-wrapper"><div className="hero-background-elements"><div className="bg-game-element bg-dollar-1"><i className="fas fa-dollar-sign"></i></div><div className="bg-game-element bg-tag-1"><i className="fas fa-tag"></i></div><div className="bg-game-element bg-cart-1"><i className="fas fa-shopping-cart"></i></div><div className="bg-game-element bg-cash-1"><i className="fas fa-cash-register"></i></div></div><div className="game-container">{
                    !user ? <div className="loading-screen">Connecting...</div>
                    : !gameId ? <MultiplayerStartScreen {...{user, createGame, joinGame}} />
                    : !gameState ? <div className="loading-screen">Joining Game...</div>
                    : {
                        'lobby': <LobbyScreen {...onlineGameProps} />,
                        'in-game': <OnlineGameScreen {...onlineGameProps} />,
                        'results': <OnlineResultsScreen {...onlineGameProps} />,
                        'game-over': (() => {
                             const finalScores = Object.values(gameState.players).reduce((acc, player) => { acc[player.name] = player.score; return acc; }, {});
                             return <GameOverScreenComponent scores={finalScores} handleNewGame={leaveGame} gameMode="multi" />;
                        })()
                    }[gameState.status] || <div>Error: Unknown game state.</div>
                }</div></div>
                {toast.show && ( <div className={`toast ${toast.type}`}> {toast.message} </div> )}
                {isSettingsModalOpen && <SettingsModal {...{ setOpen: setSettingsModalOpen, musicVolume, setMusicVolume, sfxEnabled, setSfxEnabled, playSound, sfxRefs }} />}
                 <audio ref={backgroundMusicRef} loop src="https://static.wixstatic.com/mp3/9ce3e5_380adfaea802407b9a4cebc67f12a216.mp3"></audio><audio ref={sfxRefs.start} src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3"></audio><audio ref={sfxRefs.interaction} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav"></audio><audio ref={sfxRefs.correct} src="https://static.wixstatic.com/mp3/9ce3e5_76691a6fefcd4536aa403ada111e886a.mp3"></audio><audio ref={sfxRefs.wrong} src="https://static.wixstatic.com/mp3/9ce3e5_277f814439064d1bbe5c0342241b23e4.mp3"></audio><audio ref={sfxRefs.curtain} src="https://static.wixstatic.com/mp3/9ce3e5_ccd36cdf98bf4e1594cf2e52d5296c51.wav"></audio>
                <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
            </>
        );
    }
    
    // Default render: Mode Selection Screen
    return (
        <>
            <Head><title>Guess The Price - Select Mode</title><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" /></Head>
            <div className="game-page-wrapper">
                 <div className="hero-background-elements"><div className="bg-game-element bg-dollar-1"><i className="fas fa-dollar-sign"></i></div><div className="bg-game-element bg-tag-1"><i className="fas fa-tag"></i></div><div className="bg-game-element bg-cart-1"><i className="fas fa-shopping-cart"></i></div><div className="bg-game-element bg-cash-1"><i className="fas fa-cash-register"></i></div></div>
                <div className="game-container">
                    <div id="mode-selection-screen" className="screen active">
                        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
                        <h1>Guess The Price</h1>
                        <p className="instructions">Choose how you want to play.</p>
                        <div className="game-mode-selection">
                            <div className="mode-option" onClick={() => { playSound(sfxRefs.interaction); setPlayMode('local'); initAudio(); }}>
                                <i className="fas fa-couch"></i>
                                <h3>Local Play</h3>
                                <p>Play Solo or with friends on the same device.</p>
                            </div>
                            <div className="mode-option" onClick={() => { 
                                playSound(sfxRefs.interaction);
                                initAudio();
                                signInAnonymously(auth).catch(e => console.error(e));
                                setPlayMode('online');
                            }}>
                                <i className="fas fa-globe"></i>
                                <h3>Online Multiplayer</h3>
                                <p>Play with friends on different devices.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}