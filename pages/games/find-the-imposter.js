import { useState, useEffect, useRef, useMemo } from 'react';
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
const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

// ==================================================================
//  MAIN PAGE COMPONENT 
// ==================================================================
export default function FindTheImposterPage() {
    const router = useRouter();

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

    // Automatically sign in user when page loads
    useEffect(() => {
        signInAnonymously(auth).catch(e => console.error("Anonymous sign-in failed:", e));
    }, []);

    useEffect(() => { 
        const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser)); 
        return () => unsubscribe(); 
    }, []);
    
    useEffect(() => {
        if (!gameId || !user) { setGameState(null); return; }
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
    }, [gameId, user]);

    useEffect(() => {
        // This effect is the "Game Manager" and only runs for the host.
        if (!gameState || !user || gameState.hostId !== user.uid) {
            return;
        }

        const gameRef = ref(db, `game_sessions/${gameId}`);
        const totalPlayers = Object.keys(gameState.players || {}).length;

        // Condition to move from Role Assignment to Discussion
        if (gameState.status === 'role-assignment' && gameState.gameData?.seenRole) {
            const playersWhoHaveSeen = Object.keys(gameState.gameData.seenRole).length;
            if (playersWhoHaveSeen === totalPlayers && totalPlayers > 0) {
                // Once everyone has seen their role, the HOST changes the status.
                update(gameRef, { status: 'discussion' });
            }
        }
    }, [gameState, user, gameId]);

    // --- Online Game Logic ---
    const generateGameId = () => Math.random().toString(36).substring(2, 7).toUpperCase();

    const startOnlineGame = async () => {
        if (!user || !gameState || gameState.hostId !== user.uid) return;
        
        const playerIds = Object.keys(gameState.players || {});
        if (playerIds.length < MIN_PLAYERS) return alert(`Need at least ${MIN_PLAYERS} players.`);

        playSound(sfxRefs.start);
        const imposterUid = playerIds[Math.floor(Math.random() * playerIds.length)];
        const questionIndex = Math.floor(Math.random() * questionsData.length);
        
        try {
            await update(ref(db, `game_sessions/${gameId}`), {
                status: 'role-assignment',
                gameData: {
                    imposterUid: imposterUid,
                    question: questionsData[questionIndex],
                    turnOrder: playerIds.sort(() => 0.5 - Math.random()),
                    currentPlayerTurnIndex: 0,
                    seenRole: {},
                    cardFlipped: false,
                    votes: {},
                    mostVotedUid: null
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
            const updates = {};
            updates[`/gameData/seenRole/${user.uid}`] = true;
            updates['/gameData/cardFlipped'] = false;

            if (currentPlayerTurnIndex === turnOrder.length - 1) {
                updates['/status'] = 'discussion';
            } else {
                updates['/gameData/currentPlayerTurnIndex'] = currentPlayerTurnIndex + 1;
            }

            const gameRef = ref(db, `game_sessions/${gameId}`);
            await update(gameRef, updates);

        } catch (error) {
            console.error("Failed to progress turn:", error);
            alert("Error updating game state. Please check your connection and try again.");
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
    
    const createGame = async (playerName) => {
        if (!user || !playerName.trim()) return;
        playSound(sfxRefs.start);
        const newGameId = generateGameId();
        const gameRef = ref(db, `game_sessions/${newGameId}`);

        const newGameData = {
            gameType: 'findTheImposter',
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

    const leaveGame = () => {
        if (!user || !gameId) return;
        playSound(sfxRefs.interaction);
        if (gameState?.hostId === user.uid) {
            remove(ref(db, `game_sessions/${gameId}`));
        } else {
            remove(ref(db, `game_sessions/${gameId}/players/${user.uid}`));
        }
        setGameId(null);
        setGameState(null);
    };

    // --- NEW: Conditional Back Button Logic ---
    const handleBackButton = () => {
        if (gameId) {
            // If in a game or lobby, leave the game session.
            // This sets gameId to null, which shows the OnlineStartScreen.
            leaveGame();
        } else {
            // If on the OnlineStartScreen (no gameId), go to the main website.
            window.location.href = 'https://www.playblyza.com/';
        }
    };
    
    // --- Render Logic ---
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
                <title>Find The Imposter - Online</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Luckiest+Guy&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>
            
            <button id="back-button" className="icon-btn" style={{top: '20px', left: '20px'}} onClick={handleBackButton}>
                <i className="fas fa-arrow-left"></i>
            </button>

            <div className="game-container">
                {renderOnlineGame()}
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