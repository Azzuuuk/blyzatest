import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { auth, db } from '/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue, update, remove, onDisconnect, get, serverTimestamp } from 'firebase/database';

// --- Component Imports for Online Mode ---
import OnlineStartScreen from '/components/findtheimposter/OnlineStartScreen';
import LobbyScreen from '/components/findtheimposter/LobbyScreen';
import OnlineRoleScreen from '/components/findtheimposter/OnlineRoleScreen';
import OnlineDiscussionScreen from '/components/findtheimposter/OnlineDiscussionScreen';
import OnlineVotingScreen from '/components/findtheimposter/OnlineVotingScreen';
import OnlineResultsScreen from '/components/findtheimposter/OnlineResultsScreen';

// --- Static Game Data ---
const questionsData = [
    { crew: "Which player here is most likely to end up in Jail?", imposter: "Which player here is most likely to have 7+ kids?" }, { crew: "Which player here is most likely to break a World Record?", imposter: "Which player here is most likely to break multiple bones?" }, { crew: "Which player here is most likely to date their family member?", imposter: "Which player here is most likely to stay single forever?" }, { crew: "Which player here is most likely to chicken out of a fight?", imposter: "Which player here would you least want as your roommate?" }, { crew: "Which player here is most likely to give the best advice?", imposter: "Which player here is most likely to give the worst advice?" }, { crew: "Which player here is most likely to clog the toilet at a party?", imposter: "Which player here is most likely to burn the kitchen down while cooking?" }, { crew: "Which player here is most likely to laugh the loudest at their own joke?", imposter: "Which player here is most likely to sleep through an apocalypse?" }, { crew: "Which player here is most likely to become internet famous ?", imposter: "Which player here is most likely to join a cult?" }, { crew: "Which player here is most likely to get kicked off an airplane?", imposter: "Which player here is most likely to win a Nobel prize?" }, { crew: "Which player here has the best hairstyle right now?", imposter: "Which player here is most likely to go a week without showering?" }, { crew: "Which player here is most likely to black out after two drinks at a club?", imposter: "Which player here is most likely to bring their toddler to a nightclub?" }, { crew: "What's your dream vacation spot?", imposter: "What city do you think has the stinkiest people?" }, { crew: "What's your all-time favorite movie?", imposter: "What's the most overrated movie you've *never* actually watched?" }, { crew: "If you could permanently delete one website from the internet, what would it be?", imposter: "What's a website you visit often that might surprise people?" }, { crew: "What's one food you would absolutely never have again?", imposter: "What's the most underrated dish to eat?" }, { crew: "Who is your ultimate celebrity crush?", imposter: "Which celebrity do you think is massively overpaid/overrated?" }, { crew: "Realistically, how many miles could you walk right now without stopping?", imposter: "Realistically, how many consecutive push-ups can you do right now?" }, { crew: "What age do you genuinely hope to live until?", imposter: "Quick, pick a number between 35 and 125." }, { crew: "What's the minimum amount of money you'd need in your bank account to retire tomorrow?", imposter: "What's the absolute minimum price you'd sell tasteful pictures of your feet for?" }, { crew: "What's a name you would absolutely give to a beloved pet?", imposter: "What would you name yourself if you were born again?" }, { crew: "What do you think is objectively the easiest sport to play?", imposter: "If you had to go professional in *any* sport, which one would you choose (even if you'd be terrible)?" }, { crew: "What's a drink (alcoholic or non-alcoholic) you would never willingly drink again?", imposter: "What's the most underrated beverage?" }, { crew: "Honestly, how many coordinated 10-year-olds do you think you could defeat in a boxing ring simultaneously?", imposter: "Quick, pick a number between 1 and 200." }, { crew: "Which fictional superhero or supervillain do you think you could realistically defeat in a fight?", imposter: "Which fictional superhero or supervillain do you secretly wish was real?" }
];
const GameScreen = { START: 'start', ROLE: 'role', DISCUSSION: 'discussion', VOTING: 'voting', RESULTS: 'results' };
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

// ==================================================================
//  LOCAL GAME UI COMPONENTS (Restored)
// ==================================================================
const StartScreenComponent = ({ players, setPlayers, handleStartGame, playSound, sfxRefs }) => (
    <div id="start-screen" className="screen active">
        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
        <h1>Find The Imposter</h1>
        <div className="instructions">
            <p>HOW TO PLAY</p>
            <ul>
                <li><i className="fas fa-user-secret"></i> One player is randomly chosen as the Imposter</li>
                <li><i className="fas fa-question-circle"></i> Everyone gets the same question, except the Imposter, who gets a similar one</li>
                <li><i className="fas fa-comments"></i> Discuss answers and try to spot the person who doesn't fit in!</li>
                <li><i className="fas fa-vote-yea"></i> Vote for who you think is the Imposter to win!</li>
                <li><a href="https://youtu.be/vqHTffHMxbQ" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i> Watch a video on how to play!</a></li>
            </ul>
        </div>
        <div className="player-inputs">
            <h3>Enter Player Names</h3>
            <p className="info-text" style={{ marginTop: '-10px', marginBottom: '20px' }}>({MIN_PLAYERS}-{MAX_PLAYERS} Players)</p>
            <div id="player-names-list">
                {players.map((name, index) => (
                    <div key={index} className="player-input-wrapper">
                        <input type="text" className="player-name" placeholder={`Player ${index + 1}`} value={name} onChange={(e) => { const newPlayers = [...players]; newPlayers[index] = e.target.value; setPlayers(newPlayers); }} />
                        {players.length > MIN_PLAYERS && (
                            <button className="remove-player-btn" onClick={() => { playSound(sfxRefs.interaction); setPlayers(players.filter((_, i) => i !== index)); }}><i className="fas fa-times"></i></button>
                        )}
                    </div>
                ))}
            </div>
            <button id="add-player-btn" className="btn-secondary" onClick={() => { playSound(sfxRefs.interaction); setPlayers([...players, '']); }} disabled={players.length >= MAX_PLAYERS}><i className="fas fa-plus"></i> Add Player</button>
        </div>
        <button id="start-game-btn" className="btn-primary" onClick={handleStartGame} disabled={players.filter(p => p.trim()).length < MIN_PLAYERS}>Start Game <i className="fas fa-play"></i></button>
    </div>
);
const RoleScreenComponent = ({ players, currentPlayerIndex, imposterIndex, question, cardFlipped, setCardFlipped, handleNextPlayer, playSound, sfxRefs, handleTransitionEnd }) => {
    const isImposter = currentPlayerIndex === imposterIndex;
    const handleCardClick = () => { if (!cardFlipped) { playSound(sfxRefs.flip); setCardFlipped(true); } };
    return (
        <div id="role-screen" className="screen active">
            <h1>Assigning Roles</h1>
            <div id="current-player-info">Pass to <strong>{players[currentPlayerIndex] || '...'}</strong></div>
            <p className="info-text">Click the card below to reveal your role. Keep it secret!</p>
            <div className={`role-card ${cardFlipped ? 'flipped' : ''}`} onClick={handleCardClick}>
                <div className="role-card-inner" onTransitionEnd={handleTransitionEnd}>
                    <div className="role-card-front"><i className="fas fa-eye role-icon"></i><p>Click to Reveal</p></div>
                    <div className="role-card-back">
                        <h3 id="player-role" className={isImposter ? 'role-imposter' : 'role-crewmate'}>{isImposter ? 'IMPOSTER' : 'CREWMATE'}</h3>
                        <p id="player-question">{isImposter ? question.imposter : question.crew}</p>
                    </div>
                </div>
            </div>
            <button id="next-player-btn" className="btn-primary" onClick={handleNextPlayer} disabled={!cardFlipped}>
                {currentPlayerIndex === players.length - 1 ? 'Start Discussion' : 'Next Player'} <i className="fas fa-arrow-right"></i>
            </button>
        </div>
    );
};
const DiscussionScreenComponent = ({ players, question, handleStartVoting }) => (
    <div id="discussion-screen" className="screen active">
        <h1>Discussion Time</h1>
        <div className="result-card">
            <h2>Discuss Your Answers</h2>
            <div className="discussion-info"><h3>Crewmates' Question:</h3><p id="crew-question-display">{question.crew}</p></div>
            <h3 style={{ marginTop: '25px' }}>Players in Game:</h3>
            <div id="player-list-display" className="player-avatars">
                {players.map(player => (<div key={player} className="player-avatar"><div className="avatar-icon">{player[0].toUpperCase()}</div><h4>{player}</h4></div>))}
            </div>
            <p className="info-text" style={{ marginTop: '15px' }}>Discuss everyone's answers. The imposter needs to blend in!</p>
            <button id="start-voting-btn" className="btn-primary" onClick={handleStartVoting}>Start Voting <i className="fas fa-vote-yea"></i></button>
        </div>
    </div>
);
const VotingScreenComponent = ({ players, votes, handleVote, voterIndex, handleReveal }) => {
    const voter = players[voterIndex];
    const hasVoted = !!votes[voter];
    const allVoted = Object.keys(votes).length === players.length;
    return (
        <div id="voting-screen" className="screen active">
            <h1>Cast Your Vote</h1>
            <div className="result-card">
                <h2>Who is the Imposter?</h2>
                <p className="info-text" id="voting-instruction-text">{allVoted ? "All votes are in! Click reveal!" : `It's ${voter}'s turn to vote.`}</p>
                <div id="voting-options-display" className="player-avatars">
                    {players.map(player => (
                        <div key={player} className={`player-avatar ${votes[voter] === player ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`} onClick={() => !hasVoted && handleVote(player)}>
                            <div className="avatar-icon">{player[0].toUpperCase()}</div><h4>{player}</h4>
                        </div>
                    ))}
                </div>
                {allVoted && (<button id="reveal-imposter-btn" className="btn-danger" onClick={handleReveal}>Reveal Imposter <i className="fas fa-user-secret"></i></button>)}
            </div>
        </div>
    );
};
const ResultsScreenComponent = ({ result, question, handlePlayAgain, handleNewGame, router }) => (
    <div id="results-screen" className="screen active">
        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
        <h1>Game Over</h1>
        <div className="result-card">
            <h2>Results</h2>
            <div id="imposter-reveal">
                <h3 id="result-title-text" style={{ color: result.isCorrect ? 'var(--blyza-keppel-accent)' : 'var(--blyza-quickfire-red)' }}>{result.isCorrect ? 'Imposter Found!' : 'Wrong Guess!'}</h3>
                <div id="imposter-avatar-display">{result.imposter[0].toUpperCase()}</div>
                <p id="imposter-name-reveal-text" style={{ fontSize: '1.2rem', fontWeight: '600' }}>The Imposter was: <strong style={{ color: 'var(--blyza-quickfire-red)' }}>{result.imposter}</strong></p>
                <p id="imposter-question-reveal-text">Their Question: {question.imposter}</p>
                <p id="result-message-text" className={result.isCorrect ? 'result-correct' : 'result-incorrect'}>{result.isCorrect ? `The group correctly identified ${result.imposter}!` : `The group voted for ${result.mostVoted}, but the imposter was ${result.imposter}!`}</p>
            </div>
            <div className="game-over-buttons" style={{ marginTop: '20px' }}>
                <button id="play-again-btn" className="btn-success" onClick={handlePlayAgain}><i className="fas fa-redo"></i> Play Again</button>
                <button id="new-game-btn" className="btn-secondary" onClick={handleNewGame}><i className="fas fa-home"></i> Main Menu</button>
                <button id="visit-store-btn" className="btn-info" onClick={() => router.push('/store')}><i className="fas fa-store"></i> Visit Store</button>
            </div>
        </div>
    </div>
);


// ==================================================================
//  MAIN PAGE COMPONENT 
// ==================================================================
export default function FindTheImposterPage() {
    const router = useRouter();
    const [playMode, setPlayMode] = useState(null);

    // --- Local Game State ---
    const [screen, setScreen] = useState(GameScreen.START);
    const [players, setPlayers] = useState(Array(MIN_PLAYERS).fill(''));
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [imposterIndex, setImposterIndex] = useState(-1);
    const [question, setQuestion] = useState({ crew: '', imposter: '' });
    const [usedQuestionIndices, setUsedQuestionIndices] = useState([]);
    const [cardFlipped, setCardFlipped] = useState(false);
    const [votes, setVotes] = useState({});
    const [voterIndex, setVoterIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // --- Online Game State ---
    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    
    // --- Shared State & Refs ---
    const sfxRefs = { start: useRef(null), interaction: useRef(null), flip: useRef(null), correct: useRef(null), wrong: useRef(null) };
    
    const playSound = (soundRef) => { if (soundRef.current) { soundRef.current.currentTime = 0; soundRef.current.play().catch(e => {}); } };
    
    // --- Lifecycle and Global Effects ---
    useEffect(() => {
        document.body.classList.add('imposter-game-active');
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        window.addEventListener('resize', setAppHeight); setAppHeight();
        return () => { document.body.classList.remove('imposter-game-active'); window.removeEventListener('resize', setAppHeight); };
    }, []);

    useEffect(() => { const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser)); return () => unsubscribe(); }, []);
    
    useEffect(() => {
        if (playMode !== 'online' || !gameId || !user) { setGameState(null); return; }
        const gameRef = ref(db, `game_sessions/${gameId}`);
        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setGameState(data);
            } else {
                alert('The game lobby has closed.');
                setGameState(null);
                setGameId(null);
            }
        });
        const playerRef = ref(db, `game_sessions/${gameId}/players/${user.uid}`);
        onDisconnect(playerRef).remove();
        return () => unsubscribe();
    }, [playMode, gameId, user]);

    // --- Local Game Logic (Unchanged) ---
    const selectNewQuestion = () => { let available = questionsData.map((_, i) => i).filter(i => !usedQuestionIndices.includes(i)); if (available.length === 0) { setUsedQuestionIndices([]); available = questionsData.map((_, i) => i); } const newIndex = available[Math.floor(Math.random() * available.length)]; setUsedQuestionIndices(prev => [...prev, newIndex]); setQuestion(questionsData[newIndex]); };
    const handleStartGame = () => { playSound(sfxRefs.start); const validPlayers = players.map(p => p.trim()).filter(Boolean); if (validPlayers.length < MIN_PLAYERS) return; setPlayers(validPlayers); setImposterIndex(Math.floor(Math.random() * validPlayers.length)); selectNewQuestion(); setCurrentPlayerIndex(0); setCardFlipped(false); setVoterIndex(0); setVotes({}); setResult(null); setIsTransitioning(false); setScreen(GameScreen.ROLE); };
    const handleNextPlayer = () => { if (isTransitioning || !cardFlipped) return; playSound(sfxRefs.interaction); setIsTransitioning(true); setCardFlipped(false); };
    const handleTransitionEnd = () => { if (isTransitioning && !cardFlipped) { if (currentPlayerIndex < players.length - 1) { setCurrentPlayerIndex(prev => prev + 1); } else { setScreen(GameScreen.DISCUSSION); } setIsTransitioning(false); } };
    const handleStartVoting = () => { playSound(sfxRefs.interaction); setScreen(GameScreen.VOTING); };
    const handleLocalVote = (votedForPlayer) => { playSound(sfxRefs.interaction); const voter = players[voterIndex]; setVotes(prevVotes => ({ ...prevVotes, [voter]: votedForPlayer })); if (voterIndex < players.length - 1) { setVoterIndex(prev => prev + 1); } };
    const handleRevealLocal = () => { const voteCounts = Object.values(votes).reduce((acc, vote) => { acc[vote] = (acc[vote] || 0) + 1; return acc; }, {}); let maxVotes = 0; let mostVoted = ''; Object.entries(voteCounts).forEach(([player, count]) => { if (count > maxVotes) { maxVotes = count; mostVoted = player; } }); if (!mostVoted) mostVoted = "No one"; const imposter = players[imposterIndex]; const isCorrect = mostVoted === imposter; playSound(isCorrect ? sfxRefs.correct : sfxRefs.wrong); setResult({ mostVoted, imposter, isCorrect }); setScreen(GameScreen.RESULTS); };
    const handlePlayAgain = () => { playSound(sfxRefs.start); handleStartGame(); };
    const handleNewGame = () => { playSound(sfxRefs.interaction); setPlayers(Array(MIN_PLAYERS).fill('')); setScreen(GameScreen.START); };

    // --- Online Game Logic ---
    const generateGameId = () => Math.random().toString(36).substring(2, 7).toUpperCase();

   // In pages/find-the-imposter.js

const startOnlineGame = async () => {
    if (!user || !gameState || gameState.hostId !== user.uid) return;
    
    const gameRef = ref(db, `game_sessions/${gameId}`);
    
    const playersObject = gameState.players || {};
    const playerIds = Object.keys(playersObject); // Get an array of player UIDs
    
    if (playerIds.length < MIN_PLAYERS) {
        alert(`You need at least ${MIN_PLAYERS} players to start.`);
        return;
    }

    // --- THIS IS THE CORRECTED LOGIC ---
    const imposterIndex = Math.floor(Math.random() * playerIds.length);
    const imposterUid = playerIds[imposterIndex]; // Get the actual UID of the imposter
    const questionIndex = Math.floor(Math.random() * questionsData.length);
    
    try {
        await update(gameRef, {
            status: 'role-assignment',
            gameData: {
                imposterUid: imposterUid, // <-- FIX: Save the UID, not the index
                question: questionsData[questionIndex],
                currentPlayerTurnIndex: 0,
                turnOrder: playerIds.sort(() => Math.random() - 0.5), // Shuffle turn order for fairness
                seenRole: {},
                cardFlipped: false,
                votes: {}, // Initialize votes object
                mostVotedUid: null // Initialize mostVotedUid
            }
        });
    } catch (error) {
        console.error("Failed to start game:", error);
        alert("Error starting game. Please try again.");
    }
};
    const handleNextPlayerOnline = async () => {
        if (!gameState?.gameData || !user) return;
        
        const { currentPlayerTurnIndex, turnOrder } = gameState.gameData;
        const isMyTurn = turnOrder[currentPlayerTurnIndex] === user.uid;
        
        if (!isMyTurn) return;
        
        try {
            // First mark card as not flipped for next player
            await update(ref(db, `game_sessions/${gameId}/gameData`), {
                cardFlipped: false
            });

            // Mark that this player has seen their role
            await update(ref(db, `game_sessions/${gameId}/gameData/seenRole`), {
                [user.uid]: true
            });
            
            // If we're the last player, move to discussion
            if (currentPlayerTurnIndex === turnOrder.length - 1) {
                
                    await update(ref(db, `game_sessions/${gameId}`), {
                        status: 'discussion'
                    });
                
            } else {
                // Otherwise, increment the turn index
                await update(ref(db, `game_sessions/${gameId}/gameData`), {
                    currentPlayerTurnIndex: currentPlayerTurnIndex + 1
                });
            }
        } catch (error) {
            console.error("Failed to progress turn:", error);
            alert("Error updating game state. Please try again.");
        }
    };

    const handleOnlineCardFlip = async () => {
        if (!gameState?.gameData || !user) return;
        
        const { currentPlayerTurnIndex, turnOrder } = gameState.gameData;
        const isMyTurn = turnOrder[currentPlayerTurnIndex] === user.uid;
        
        if (!isMyTurn) return;
        
        try {
            await update(ref(db, `game_sessions/${gameId}/gameData`), {
                cardFlipped: true
            });
            playSound(sfxRefs.flip);
        } catch (error) {
            console.error("Failed to flip card:", error);
        }
    };

    // =========================================================================
    // VVVVVV   THIS IS THE FINAL, CORRECTED ONLINE LOGIC   VVVVVV
    // =========================================================================
    
    // ... inside FindTheImposterPage component

    const createGame = async (playerName) => {
        if (!user || !playerName.trim()) return;
        playSound(sfxRefs.start);
        const newGameId = generateGameId();
        const gameRef = ref(db, `game_sessions/${newGameId}`);

        const newGameData = {
            gameType: 'findTheImposter',  // Identifies which game this is
            hostId: user.uid,
            status: 'lobby',
            createdAt: serverTimestamp(),
            gameData: null,
            players: {
                [user.uid]: {
                    name: playerName.trim(),
                    uid: user.uid
                }
            }
        };

        try {
            await set(gameRef, newGameData);
            setGameId(newGameId);
        } catch (error) {
            console.error("Failed to create game:", error);
            alert("Error: Could not create the game.");
        }
    };

// ... rest of the file is the same
    
    // The joinGame function from before is correct and does not need to be changed.
    const joinGame = async (gameCode, playerName) => {
        if (!user || !playerName.trim() || !gameCode.trim()) return;
        playSound(sfxRefs.interaction);
        const code = gameCode.trim().toUpperCase();
        const gameRef = ref(db, `game_sessions/${code}`);
        
        try {
            const snapshot = await get(gameRef);
            if (!snapshot.exists()) {
                alert("Game not found! Please check the code.");
                return;
            }

            const gameData = snapshot.val();
            if (gameData.gameType !== 'findTheImposter') {
                alert("This code is for a different game!");
                return;
            }
            if (gameData.status !== 'lobby') {
                alert("This game has already started.");
                return;
            }
            if (Object.keys(gameData.players || {}).length >= MAX_PLAYERS) {
                alert("This game is full!");
                return;
            }

            const playerRef = ref(db, `game_sessions/${code}/players/${user.uid}`);
            await set(playerRef, { name: playerName.trim(), uid: user.uid });
            setGameId(code);

        } catch (error) {
            console.error("Failed to join game:", error);
            alert("Error: Could not join the game. Please check your connection and try again.");
        }
    };
    
    // =========================================================================
    // ^^^^^^   END OF FINAL, CORRECTED ONLINE LOGIC   ^^^^^^
    // --- Render Logic ---
    const renderLocalGame = () => {
        const props = { players, setPlayers, handleStartGame, currentPlayerIndex, imposterIndex, question, cardFlipped, setCardFlipped, handleNextPlayer, handleStartVoting, votes, handleVote: handleLocalVote, voterIndex, handleReveal: handleRevealLocal, result, handlePlayAgain, handleNewGame, router, playSound, sfxRefs, handleTransitionEnd };
        switch(screen) {
            case GameScreen.START:      return <StartScreenComponent {...props} />;
            case GameScreen.ROLE:       return <RoleScreenComponent {...props} />;
            case GameScreen.DISCUSSION: return <DiscussionScreenComponent {...props} />;
            case GameScreen.VOTING:     return <VotingScreenComponent {...props} />;
            case GameScreen.RESULTS:    return result ? <ResultsScreenComponent {...props} /> : null;
            default:                    return <StartScreenComponent {...props} />;
        }
    };
    
    const renderOnlineGame = () => {
        if (!user) return <div className="screen active">Authenticating...</div>;
        if (!gameId || !gameState) return <OnlineStartScreen createGame={createGame} joinGame={joinGame} />;
        
        const props = { 
            user, 
            gameId, 
            gameState, 
            db,
            onStartGame: startOnlineGame,
            onNextPlayer: handleNextPlayerOnline,
            onCardFlip: handleOnlineCardFlip,
            playSound,
            sfxRefs
        };

        switch(gameState.status) {
            case 'lobby':           return <LobbyScreen {...props} />;
            case 'role-assignment': return <OnlineRoleScreen {...props} />;
            case 'discussion':      return <OnlineDiscussionScreen {...props} />;
            case 'voting':          return <OnlineVotingScreen {...props} />;
            case 'results':         return <OnlineResultsScreen {...props} />;
            default:                return <div className="screen active">Loading...</div>;
        }
    };

    return ( 
        <div className="game-page-wrapper">
            <Head>
                <title>Find The Imposter - Blyza</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>
            
            <div className="game-container">
                {playMode === null && (
                    <div id="mode-selection-screen" className="screen active">
                        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
                        <h1>Find The Imposter</h1>
                        <div className="instructions" style={{ color: 'var(--text-medium)', fontWeight: '600' }}>
                            <p style={{fontFamily: 'var(--font-body)', marginBottom: 0}}>Choose how you want to play.</p>
                        </div>
                        <div className="game-mode-selection">
                            <div className="mode-option" onClick={() => { playSound(sfxRefs.interaction); setPlayMode('local'); }}>
                                <i className="fas fa-couch"></i><h3>Local Play</h3><p>Play with friends on the same device.</p>
                            </div>
                            <div className="mode-option" onClick={() => { playSound(sfxRefs.interaction); if (!user) signInAnonymously(auth).catch(e => console.error(e)); setPlayMode('online'); }}>
                                <i className="fas fa-globe"></i><h3>Online Multiplayer</h3><p>Play with friends on different devices.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                {playMode === 'local' && renderLocalGame()}
                
                {playMode === 'online' && renderOnlineGame()}
            </div>
            
            <audio ref={sfxRefs.start} src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3" />
            <audio ref={sfxRefs.interaction} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav" />
            <audio ref={sfxRefs.flip} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav" />
            <audio ref={sfxRefs.correct} src="https://static.wixstatic.com/mp3/9ce3e5_76691a6fefcd4536aa403ada111e886a.mp3" />
            <audio ref={sfxRefs.wrong} src="https://static.wixstatic.com/mp3/9ce3e5_277f814439064d1bbe5c0342241b23e4.mp3" />
            
            <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        </div>
     );
}