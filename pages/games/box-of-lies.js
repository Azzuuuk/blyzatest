import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';

// --- Firebase Imports ---
import { auth, db } from '/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue, update, remove, onDisconnect, serverTimestamp } from 'firebase/database';

// --- Reusable Online Components ---
import MultiplayerStartScreen from '/components/MultiplayerStartScreen';
import LobbyScreen from '/components/LobbyScreen'; 

// --- NEW: Box of Lies Specific Online Components ---
import OnlineDescriberScreen from '/components/boxoflies/OnlineDescriberScreen';
import OnlineGuesserScreen from '/components/boxoflies/OnlineGuesserScreen';
import OnlineResultsScreen from '/components/boxoflies/OnlineResultsScreen';

// --- Static Game Data ---
const itemsData = [
    { url: "https://static.wixstatic.com/media/9ce3e5_23bd5849bda04d99bc548b0ff86e64fb~mv2.png", description: "An octopus giving a TED Talk" },
    { url: "https://static.wixstatic.com/media/9ce3e5_0985da6afa124100b4bad870460d4bb0~mv2.png", description: "A baby using a Macbook" },
    { url: "https://static.wixstatic.com/media/9ce3e5_1037fe8225ab4eb5a292c6984197cf62~mv2.png", description: "A cat covered in chocolate" },
    { url: "https://static.wixstatic.com/media/9ce3e5_f348a1f4bb79471d999607fdb6c7bb2e~mv2.png", description: "A broccoli DJ" },
    { url: "https://static.wixstatic.com/media/9ce3e5_99ba15752a3b482fb851ef36d629b8b9~mv2.png", description: "A llama riding a cycle in space" },
    { url: "https://static.wixstatic.com/media/9ce3e5_308cbf0b2a5444edbdf74df7bdc26c38~mv2.png", description: "A T-rex playing a violin" },
    { url: "https://static.wixstatic.com/media/9ce3e5_52c77a32a78d4507a60970e253aab286~mv2.png", description: "Penguins on a circular Kayak" },
    { url: "https://static.wixstatic.com/media/9ce3e5_bbe729aed2644a759c5ef0e6cb4d7034~mv2.png", description: "A pizza proposing to a burger" },
    { url: "https://static.wixstatic.com/media/9ce3e5_b8868e7c3df0402db19ece5f38cb2069~mv2.png", description: "An alien and a toaster with a blender" },
    { url: "https://static.wixstatic.com/media/9ce3e5_6ef91f2d8bff4f66b0fec72a08868c28~mv2.png", description: "A banana man in airport security" },
    { url: "https://static.wixstatic.com/media/9ce3e5_43ee231f261c4aa1a16057bb4e6f8eb8~mv2.png", description: "A team of ghosts in a meeting" },
    { url: "https://static.wixstatic.com/media/9ce3e5_05c2c4a69823410aa7bfc0c3fb066399~mv2.png", description: "Someone taking a photo of Earth from space" },
    { url: "https://static.wixstatic.com/media/9ce3e5_c9a00c9e1e0b46b6832e32ecbba3fd78~mv2.png", description: "A chicken carrying a couch over bread" },
    { url: "https://static.wixstatic.com/media/9ce3e5_caff18b6a3844434a38fedd70421c65f~mv2.png", description: "A cowboy riding a dolphin" },
    { url: "https://static.wixstatic.com/media/9ce3e5_ac6eb450bbcf41f2a9c4ae1cff297f6e~mv2.png", description: "A snail and a turtle in traffic" },
    { url: "https://static.wixstatic.com/media/9ce3e5_cc857eedcc284b32bc280e92e21888ab~mv2.png", description: "A policeman with a melting donut" },
    { url: "https://static.wixstatic.com/media/9ce3e5_0cf19941a84b45ddb5dac34a23af1b65~mv2.png", description: "A man admiring a cactus" },
    { url: "https://static.wixstatic.com/media/9ce3e5_5b7ef4b012074b8ab405ac5781fd018c~mv2.png", description: "A noodle alien on a waffle" },
    { url: "https://static.wixstatic.com/media/9ce3e5_27883fbc67a04f73bfd9da3ce04676d1~mv2.png", description: "A marshmallow angry at a cup" },
    { url: "https://static.wixstatic.com/media/9ce3e5_ff40bd468d5a458f86f6e6dcaf767292~mv2.png", description: "A raccoon who is the king of pigeons" },
    { url: "https://static.wixstatic.com/media/9ce3e5_f5c8e66eca3a445e82bed62971caf967~mv2.png", description: "A unicorn DJ" }
];
const WINNING_SCORE = 3;

// --- Screen Enum ---
const GameScreen = { START: 'start', GAME: 'game', RESULTS: 'results', GAME_OVER: 'gameOver' };

// --- Reusable UI Components (can be broken into their own files later) ---

const StartScreenComponent = ({ setTeamNames, handleStartGame }) => (
    <div id="start-screen" className="screen active">
        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
        <h1>Box of Lies</h1>
        <div className="instructions">
            <p><strong>HOW TO PLAY:</strong></p>
            <ul>
                <li><i className="fas fa-users"></i> One player describes an image, the other guesses if they're telling the truth or lying.</li>
                <li><i className="fas fa-eye"></i> The "Describer" clicks to reveal a random image (only they should see it).</li>
                <li><i className="fas fa-comment-dots"></i> The Describer can describe it truthfully or make something up!</li>
                <li><i className="fas fa-question-circle"></i> The "Guesser" decides: TRUTH or LIE?</li>
                <li><i className="fas fa-user-check"></i> After the call, the Describer reveals if the guess was right.</li>
                <li><i className="fas fa-star"></i> Guesser Correct = point for their team. Guesser Wrong = point for the Describer's team!</li>
                <li><i className="fas fa-trophy"></i> First team to {WINNING_SCORE} points wins!</li>
                <li><a href="https://youtu.be/BGZ0lZtYRw8" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i> Watch a video on how to play!</a></li>
            </ul>
        </div>
        <div className="team-inputs">
            <h3>Enter Team Names</h3>
            <div id="team-names-container">
                <div className="team-input-item">
                    <input type="text" className="team-name-input" placeholder="Team 1 Name" onChange={(e) => setTeamNames(prev => [e.target.value, prev[1]])} />
                </div>
                <div className="team-input-item">
                    <input type="text" className="team-name-input" placeholder="Team 2 Name" onChange={(e) => setTeamNames(prev => [prev[0], e.target.value])} />
                </div>
            </div>
        </div>
        <button id="start-game-btn" className="btn-primary" onClick={handleStartGame}>Start Game <i className="fas fa-play"></i></button>
    </div>
);

const GameOverScreenComponent = ({ scores, teams, handlePlayAgain, handleNewGame }) => {
    const router = useRouter();
    const winnerIndex = scores.findIndex(score => score >= WINNING_SCORE);
    const winnerName = winnerIndex !== -1 ? teams[winnerIndex] : "Nobody";

    useEffect(() => {
        if (winnerIndex !== -1) {
            // Your confetti logic here
        }
    }, [winnerIndex]);

    return (
        <div id="game-over-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
            <h1 id="game-over-title-text">Box of Lies</h1>
            <div className="win-message-text" id="final-win-message">{winnerName} Wins!</div>
            <div className="winner-trophy-icon">🏆</div>
            <div id="winner-message-details">Congratulations!</div>
            <div id="final-scores-display-area" className="score-display-area">
                {teams.map((team, index) => (
                    <div key={index} className={`score-card ${index === winnerIndex ? 'winner-glow' : ''}`}>
                        <h4>{team}</h4>
                        <div className="score-value-text">{scores[index]}</div>
                    </div>
                ))}
            </div>
            <div className="game-over-buttons-container">
                <button onClick={handlePlayAgain} className="btn-success"><i className="fas fa-redo"></i> Play Again</button>
                <button onClick={handleNewGame} className="btn-secondary"><i className="fas fa-home"></i> Main Menu</button>
                <button onClick={() => router.push('/store')} className="btn-info"><i className="fas fa-store"></i> Visit Store</button>
            </div>
        </div>
    );
};


// ==================================================================
//  MAIN PAGE COMPONENT 
// ==================================================================
export default function BoxOfLiesPage() {
    const router = useRouter();

    // --- Core State ---
    const [playMode, setPlayMode] = useState(null); // 'local' or 'online'
    const [screen, setScreen] = useState(GameScreen.START);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // --- Local Play State ---
    const [teamNames, setTeamNames] = useState(['Team 1', 'Team 2']);
    const [scores, setScores] = useState([0, 0]);
    const [describerIndex, setDescriberIndex] = useState(0);
    const [currentItem, setCurrentItem] = useState(null);
    const [usedItems, setUsedItems] = useState([]);
    const [turn, setTurn] = useState(0);
    const [imageRevealed, setImageRevealed] = useState(false);
    const [guesserChoice, setGuesserChoice] = useState(null); // 'truth' or 'lie'

    // --- Online Play State ---
    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);

    // --- Audio & Settings State ---
    const [isAudioConsentModalOpen, setAudioConsentModalOpen] = useState(true);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [musicVolume, setMusicVolume] = useState(0.2);
    const [audioContextStarted, setAudioContextStarted] = useState(false);

    // Refs for audio elements
    const backgroundMusicRef = useRef(null);
    const sfxRefs = {
        start: useRef(null),
        interaction: useRef(null),
        reveal: useRef(null),
        correct: useRef(null),
        wrong: useRef(null),
    };

    // --- Generic Hooks (Audio, Settings, etc.) ---
    useEffect(() => {
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        window.addEventListener('resize', setAppHeight);
        setAppHeight();
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
    };
    
    const initAudio = () => { if (!audioContextStarted) setAudioContextStarted(true); };
    const playSound = (soundRef) => { if (sfxEnabled && soundRef.current && audioContextStarted) { soundRef.current.currentTime = 0; soundRef.current.play().catch(e => console.error("SFX play failed:", e)); } };

    // --- LOCAL PLAY LOGIC ---
    
    const handleStartGame = () => {
        playSound(sfxRefs.start);
        const finalTeamNames = [teamNames[0].trim() || 'Team 1', teamNames[1].trim() || 'Team 2'];
        if (finalTeamNames[0].toLowerCase() === finalTeamNames[1].toLowerCase()) {
            showToast("Team names must be different!", "wrong");
            return;
        }
        setTeamNames(finalTeamNames);
        setScores([0, 0]);
        setDescriberIndex(0);
        setTurn(1);
        setUsedItems([]);
        setupLocalTurn([]);
        setScreen(GameScreen.GAME);
    };

    const setupLocalTurn = (currentUsed) => {
        setImageRevealed(false);
        setGuesserChoice(null);

        let available = itemsData.filter(i => !currentUsed.includes(i.url));
        if (available.length === 0) {
            available = [...itemsData];
            setUsedItems([]);
        }
        const nextItem = available[Math.floor(Math.random() * available.length)];
        setCurrentItem(nextItem);
        setUsedItems(prev => [...prev, nextItem.url]);
    };
    
    const handleRevealImage = () => {
        playSound(sfxRefs.reveal);
        setImageRevealed(true);
    };

    const handleGuesserChoice = (choice) => {
        playSound(sfxRefs.interaction);
        setGuesserChoice(choice);
        setScreen(GameScreen.RESULTS);
    };

    const awardPointAndProceed = (correct) => {
        const guesserIndex = 1 - describerIndex;
        let pointWinnerIndex;
        if (correct) {
            playSound(sfxRefs.correct);
            showToast(`${teamNames[guesserIndex]} was correct!`, 'correct');
            pointWinnerIndex = guesserIndex;
        } else {
            playSound(sfxRefs.wrong);
            showToast(`${teamNames[guesserIndex]} was wrong!`, 'wrong');
            pointWinnerIndex = describerIndex;
        }
        
        const newScores = [...scores];
        newScores[pointWinnerIndex]++;
        setScores(newScores);

        if (newScores.some(s => s >= WINNING_SCORE)) {
            setScreen(GameScreen.GAME_OVER);
        } else {
            // Next turn
            setDescriberIndex(1 - describerIndex); // Swap roles
            setTurn(t => t + 1);
            setupLocalTurn(usedItems);
            setScreen(GameScreen.GAME);
        }
    };

    const handlePlayAgain = () => {
        handleStartGame(); // Re-initializes the game
    };
    const handleNewGame = () => {
        setScreen(GameScreen.START);
        setTeamNames(['Team 1', 'Team 2']);
    };
    
    // --- ONLINE PLAY LOGIC ---

    useEffect(() => { // Firebase Auth Listener
        const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
        return () => unsubscribe();
    }, []);

    useEffect(() => { // Firebase Game State Listener
        if (playMode !== 'online' || !gameId || !user) {
            setGameState(null);
            return;
        }
        const gameRef = ref(db, `game_sessions/${gameId}`);
        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setGameState(data);
            } else { // Game was deleted (host left)
                setGameState(null);
                setGameId(null);
                showToast("The game session has ended.", "info");
            }
        });
        
        // Handle player disconnect
        const playerRef = ref(db, `game_sessions/${gameId}/players/${user.uid}`);
        onDisconnect(playerRef).remove();

        return () => unsubscribe();
    }, [playMode, gameId, user]);

    const goBackToModeSelect = () => {
        if (gameId) leaveGame();
        setPlayMode(null);
        handleNewGame();
    };

    const createGame = async (playerName) => {
        if (!user) return showToast("Authentication error.", "wrong");
        const newGameId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const gameRef = ref(db, `game_sessions/${newGameId}`);
        const initialGameState = {
            gameType: 'boxOfLies',
            hostId: user.uid,
            status: 'lobby',
            createdAt: serverTimestamp(),
            players: {
                [user.uid]: { name: playerName.trim() || `Player ${user.uid.substring(0,4)}`, uid: user.uid, score: 0 }
            }
        };
        await set(gameRef, initialGameState);
        setGameId(newGameId);
    };

    const joinGame = (idToJoin, playerName) => {
        if (!user) return showToast("Authentication error.", "wrong");
        const gameRef = ref(db, `game_sessions/${idToJoin}`);
        onValue(gameRef, (snapshot) => {
            if (snapshot.exists()) {
                const gameData = snapshot.val();
                if (gameData.status === 'lobby' && Object.keys(gameData.players || {}).length < 2) {
                    const playerRef = ref(db, `game_sessions/${idToJoin}/players/${user.uid}`);
                    set(playerRef, { name: playerName, score: 0, uid: user.uid }).then(() => {
                        setGameId(idToJoin);
                    });
                } else {
                    showToast("Lobby is full or game has started.", "wrong");
                }
            } else {
                showToast("Game code not found.", "wrong");
            }
        }, { onlyOnce: true });
    };

    const leaveGame = () => {
        if (!user || !gameId || !gameState) return;
        if (gameState.hostId === user.uid) {
            remove(ref(db, `game_sessions/${gameId}`)); // Host deletes the whole game
        } else {
            remove(ref(db, `game_sessions/${gameId}/players/${user.uid}`)); // Player removes themselves
        }
        setGameId(null);
        setGameState(null);
    };

    const startGameOnline = () => { // Host only
        if (!gameState || gameState.hostId !== user.uid) return;
        playSound(sfxRefs.start);
        const playerUIDs = Object.keys(gameState.players);
        const firstImageIndex = Math.floor(Math.random() * itemsData.length);

        const updates = {
            status: 'describer-turn',
            currentDescriberUid: playerUIDs[0],
            currentGuesserUid: playerUIDs[1],
            currentImageIndex: firstImageIndex,
            usedItemIndexes: [firstImageIndex],
            turn: 1,
            guesserChoice: null,
            // Reset scores
            [`/players/${playerUIDs[0]}/score`]: 0,
            [`/players/${playerUIDs[1]}/score`]: 0
        };
        update(ref(db, `game_sessions/${gameId}`), updates);
    };


    // --- RENDER LOGIC ---

    if (playMode === null) {
        return (
             <>
                <Head>
    <title>Box of Lies - Blyza Game Center</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    {/* The rest of your fonts and icon links */}
    <link rel="stylesheet" href="/css/boxoflies.css" />
</Head>
                <div className="game-page-wrapper">
                    <div className="hero-background-elements">...</div>
                    <div className="game-container">
                        <div id="mode-selection-screen" className="screen active">
                            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
                            <h1>Box of Lies</h1>
                            <p className="instructions">Choose how you want to play.</p>
                            <div className="game-mode-selection" style={{flexDirection: 'column', alignItems: 'center'}}>
                                <div className="mode-option" onClick={() => { playSound(sfxRefs.interaction); setPlayMode('local'); initAudio(); }}>
                                    <i className="fas fa-couch"></i><h3>Local Play</h3><p>Play with a friend on the same device.</p>
                                </div>
                                <div className="mode-option" onClick={() => { playSound(sfxRefs.interaction); initAudio(); signInAnonymously(auth).catch(e => console.error(e)); setPlayMode('online'); }}>
                                    <i className="fas fa-globe"></i><h3>Online Multiplayer</h3><p>Play with a friend on a different device.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    if (playMode === 'local') {
        const guesserIndex = 1 - describerIndex;
        return (
            <>
                <Head><title>Box of Lies - Blyza</title><link rel="stylesheet" href="/css/boxoflies.css" /></Head>
                {/* Back/Settings Buttons Here */}
                <button id="back-btn" className="icon-btn" style={{display: screen !== 'start' ? 'flex':'none'}} onClick={handleNewGame}><i className="fas fa-arrow-left"></i></button>

                <div className="game-container">
                    {screen === GameScreen.START && <StartScreenComponent setTeamNames={setTeamNames} handleStartGame={handleStartGame} />}
                    
                    {screen === GameScreen.GAME && currentItem && (
                        <div id="game-screen" className="screen active">
                            <div className="game-info">
                                <div>Turn: <span>{Math.ceil(turn / 2)}</span></div>
                                <div>Score: <span>{scores[0]}</span> - <span>{scores[1]}</span></div>
                            </div>
                            <div className="current-player-display">{teamNames[describerIndex]}'s turn to DESCRIBE</div>
                             <div className="image-display-area">
                                {!imageRevealed ? (
                                    <div className="reveal-box-clickable" onClick={handleRevealImage}>
                                        <i className="fas fa-eye"></i>
                                        <span>Click to Reveal (Describer Only!)</span>
                                    </div>
                                ) : (
                                    <img src={currentItem.url} alt={currentItem.description} className="mystery-image-element" style={{display: 'block'}} />
                                )}
                            </div>
                            {imageRevealed && (
                                <>
                                    <p id="guesser-instruction-text" style={{display:'block'}}>{teamNames[guesserIndex]}, is <strong>{teamNames[describerIndex]}</strong> telling the TRUTH or LYING?</p>
                                    <div className="action-buttons-container">
                                        <button onClick={() => handleGuesserChoice('truth')} className="btn-success"><i className="fas fa-check-circle"></i> TRUTH</button>
                                        <button onClick={() => handleGuesserChoice('lie')} className="btn-danger"><i className="fas fa-times-circle"></i> LIE</button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {screen === GameScreen.RESULTS && currentItem && (
                         <div id="results-screen" className="screen active">
                            <h1>Round Result</h1>
                            <div className="result-display-area">
                                <img src={currentItem.url} alt={currentItem.description} className="mystery-image-element" style={{ display: 'block' }} />
                            </div>
                            <p id="result-feedback-text">
                                The image was: <strong>{currentItem.description}</strong>. <br/>
                                {teamNames[guesserIndex]} guessed that {teamNames[describerIndex]} told the <strong>{guesserChoice.toUpperCase()}</strong>. <br/><br/>
                                Describer ({teamNames[describerIndex]}), was the guesser correct?
                            </p>
                            <div className="action-buttons-container">
                               <button onClick={() => awardPointAndProceed(true)} className="btn-success"><i className="fas fa-user-check"></i> Guesser was CORRECT!</button>
                               <button onClick={() => awardPointAndProceed(false)} className="btn-danger"><i className="fas fa-user-times"></i> Guesser was WRONG!</button>
                            </div>
                        </div>
                    )}

                    {screen === GameScreen.GAME_OVER && <GameOverScreenComponent scores={scores} teams={teamNames} handlePlayAgain={handlePlayAgain} handleNewGame={handleNewGame} />}
                </div>
                 {/* Modals and Audio elements go here, just like in your Guess The Price game */}
            </>
        );
    }

    if (playMode === 'online') {
        const onlineProps = { user, gameId, gameState, itemsData, db, showToast, playSound, sfxRefs, WINNING_SCORE };

        const renderOnlineScreen = () => {
            if (!user) return <div className="loading-screen">Connecting...</div>;
            if (!gameId) return <MultiplayerStartScreen user={user} createGame={createGame} joinGame={joinGame} />;
            if (!gameState) return <div className="loading-screen">Joining Game...</div>;

            switch (gameState.status) {
                case 'lobby':
                    return <LobbyScreen {...onlineProps} startGame={startGameOnline} minPlayers={2} maxPlayers={2} />;
                case 'describer-turn':
                    return user.uid === gameState.currentDescriberUid 
                        ? <OnlineDescriberScreen {...onlineProps} /> 
                        : <OnlineGuesserScreen {...onlineProps} />;
                case 'results':
                    return <OnlineResultsScreen {...onlineProps} />;
                case 'game-over':
                    const finalScores = Object.values(gameState.players).map(p => p.score);
                    const finalTeams = Object.values(gameState.players).map(p => p.name);
                    return <GameOverScreenComponent scores={finalScores} teams={finalTeams} handlePlayAgain={leaveGame} handleNewGame={leaveGame} />;
                default:
                    return <div>Error: Unknown game state.</div>;
            }
        };

        return (
            <>
                <Head><title>Box of Lies - Online</title><link rel="stylesheet" href="/css/boxoflies.css" /></Head>
                <button id="home-menu-btn" className="icon-btn" onClick={goBackToModeSelect}><i className="fas fa-arrow-left"></i></button>
                {/* Settings Button */}
                <div className="game-container">{renderOnlineScreen()}</div>
                {/* Toasts, Modals, Audio elements */}
            </>
        );
    }

    // Fallback just in case
    return <div>Loading...</div>;
}