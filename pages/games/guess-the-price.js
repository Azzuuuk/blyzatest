import { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
// --- Firebase Imports ---
import { auth, db } from '/firebase'; // Make sure this path is correct
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue, update, remove, onDisconnect, serverTimestamp } from 'firebase/database';

// --- Import your online-only components ---
import MultiplayerStartScreen from '/components/MultiplayerStartScreen';
import LobbyScreen from '/components/LobbyScreen';
import OnlineGameScreen from '/components/guesstheprice/OnlineGameScreen';
import OnlineResultsScreen from '/components/guesstheprice/OnlineResultsScreen';

// --- Static Game Data (Unchanged) ---
const itemsData = [
{ name: "Smartphone", category: "iPhone 16 Pro Max 256GB", price: 1199, image: "https://static.wixstatic.com/media/9ce3e5_9686ddc0bdfe431e8f8a0ec574da5879~mv2.jpg", description: "The latest flagship smartphone from Apple with A18 Pro chip and titanium design." },
                { name: "Electric Car", category: "Tesla Cybertuck - Long Range", price: 69990, image: "https://static.wixstatic.com/media/9ce3e5_4cb87b6f65204052a9039c012f4dad19~mv2.jpg", description: "The Tesla Cybertruck Long Range is a rear-wheel-drive electric truck with 362 miles of range and a 0–60 mph time of 6.2 seconds." },
                { name: "Luxury Watch", category: "Rolex Submariner", price: 10200, image: "https://static.wixstatic.com/media/9ce3e5_effb6b5486004ab19eecb54c5bbe4f39~mv2.png", description: "Iconic dive watch with 300m water resistance and chronometer certification." },
                { name: "Gaming Console", category: "PlayStation 5", price: 499, image: "https://static.wixstatic.com/media/9ce3e5_8fa6c5a5016545deaa4ae3eaef4811d7~mv2.jpg", description: "Next-gen gaming console with ultra-high speed SSD and 4K graphics." },
                { name: "Beverage", category: "Starbucks Coffee", price: 4.95, image: "https://static.wixstatic.com/media/9ce3e5_5aa78f26264e445f9762b8782dad8f51~mv2.jpg", description: "Grande Caffè Latte from Starbucks coffee chain." },
                { name: "Sneakers", category: "Jordan 1 Retro Low OG SP 'Travis Scott Medium Olive - Retail Price", price: 150, image: "https://static.wixstatic.com/media/9ce3e5_93af5177c9ee492597563200a0b9ad55~mv2.jpg", description: "The infamous collaboration." },
                { name: "Laptop", category: "MacBook Pro 14-inch M4", price: 1599, image: "https://static.wixstatic.com/media/9ce3e5_72600804f6c34c0f9774a6d0b4cc7ed3~mv2.jpeg", description: "Powerful laptop with M4 max chip and Liquid Retina XDR display." },
                { name: "Fashion", category: "Gucci Women's slide sandal with Horsebit", price: 890, image: "https://static.wixstatic.com/media/9ce3e5_c8d7315c976d469b8294ea89b411ea01~mv2.png", description: "Cmon it's Gucci slides." },
                { name: "Fast Food", category: "Big Mac - USA", price: 5.29, image: "https://static.wixstatic.com/media/9ce3e5_9d8ffe7cc7614429b96b9c4c0bdbbf0d~mv2.jpg", description: "McDonald's signature burger without fries or a drink." },
                { name: "Event Ticket", category: "World Cup 2026 Finals Ticket", price: 3500, image: "https://static.wixstatic.com/media/9ce3e5_b09525c12a79463b9071b6261a2856e2~mv2.jpg", description: "Average price for a ticket to the grandest stage of them all." },
                { name: "Real Estate", category: "Villa in Nepal", price: 473000, image: "https://static.wixstatic.com/media/9ce3e5_6ed5214556b34acaa0207e7a1e2fb9ee~mv2.jpg", description: "A 2.5 storied House with 6 aana 5 paisa of land is for sale at Basundhara." },
                { name: "Trading Card", category: "PSA 10 CHARIZARD 1999 Pokemon Base Holo", price: 40000, image: "https://static.wixstatic.com/media/9ce3e5_e9bf7ac0e4ec40d88b71be7e495c704a~mv2.jpg", description: "Do you get the hype?." },
                { name: "Streaming", category: "Netflix Subscription - Standard", price: 17.99, image: "https://static.wixstatic.com/media/9ce3e5_00218da70cc043d7ab864312f2a2a468~mv2.jpg", description: "Standard monthly subscription with HD streaming." },
                { name: "Fashion", category: "Hermès Please Hold The Line scarf 90", price: 590, image: "https://static.wixstatic.com/media/9ce3e5_c91181b41abe4815900bc6f9de8bca49~mv2.png", description: "90cm x 90cm silk twill scarf in signature Hermès design." },
                { name: "Shopping", category: "1 week Groceries - Canada", price: 99, image: "https://static.wixstatic.com/media/9ce3e5_2bbcb25f21254dd291f567b2cddf19f8~mv2.jpg", description: "Rough times." },
                { name: "Advertisement", category: "NYC Billboard Advert - 1 Month", price: 20000, image: "https://static.wixstatic.com/media/9ce3e5_52b89f523f614aa1a79bc2bc6056f15a~mv2.jpg", description: "Is this worth it?" },
                { name: "Music", category: "Snoop Dog song feature", price: 250000, image: "https://static.wixstatic.com/media/9ce3e5_68b406be69df4b0fb611b3d933a548ee~mv2.jpg", description: "Don't smoke kids." },
                { name: "Scooter", category: "Bugatti 9.0 Electric Scooter", price: 1200, image: "https://static.wixstatic.com/media/9ce3e5_72c9919152b1450fa25d617595099ef8~mv2.png", description: "What color is your Bgatti?" },
                { name: "Planes", category: "Boeing 747-8", price: 386000000, image: "https://static.wixstatic.com/media/9ce3e5_0ac131e88f3e49049e8144baa3476c54~mv2.jpg", description: "Carries atleat 5 people." },
                { name: "MCU", category: "MARVEL Franchise Worth", price: 53000000000, image: "https://static.wixstatic.com/media/9ce3e5_1ac5f683a4cd4e768facbb16fd8f57cf~mv2.jpeg", description: "New mask, same task." },
                { name: "Storage", category: "100mb Floppy Disc at launch", price: 12.95, image: "https://static.wixstatic.com/media/9ce3e5_c520bd0d02e84b8e9e916e4c11786b92~mv2.jpg", description: "thats like 20 pictures." },
                { name: "Animals", category: "Cow in Australia", price: 2000, image: "https://static.wixstatic.com/media/9ce3e5_527cdab942cc4c8189b03d4623efc5c9~mv2.jpg", description: "MOOOOOOOOOO." },
                { name: "Painting", category: "Van Gogh Self potrait", price: 7200000, image: "https://static.wixstatic.com/media/9ce3e5_4e05a15e4a264361ad4648b8c60ecb9c~mv2.png", description: "Handsome lad." },
                { name: "Wages", category: "Japanese Minimum Hourly Wage", price: 7.35, image: "https://static.wixstatic.com/media/9ce3e5_580ca1edd33047e7a2a55a3047c5938c~mv2.jpg", description: "Its tough out there." },
                { name: "Product", category: "Pet Rock - The Original by Gary Dahl", price: 29.99, image: "https://static.wixstatic.com/media/9ce3e5_a4a18ed8e72e4aeda8ab3a740a6f55e1~mv2.png", description: "It's a cool rock tbf." },
                { name: "Product", category: "World's smallest Violin", price: 9, image: "https://static.wixstatic.com/media/9ce3e5_36aee2205e914dcfbe81dc3858290be3~mv2.png", description: "Probably has a good personality." },
                { name: "Product", category: "Pickle flavour Cotton Candy", price: 7.15, image: "https://static.wixstatic.com/media/9ce3e5_489ba2159b6f49a199eb12df9c291fab~mv2.png", description: "I HATE pickles!" },
                { name: "Product", category: "Emergency Underpants", price: 5.50, image: "https://static.wixstatic.com/media/9ce3e5_6fd4933a22d24030b20aa75c1d2e7dc0~mv2.png", description: "Could come in handy ngl." },
                { name: "Product", category: "Bacon flavoured Mints", price: 7.99, image: "https://static.wixstatic.com/media/9ce3e5_085d61d3b6184abbab7e7cd6990106e3~mv2.png", description: "Oink Oink!" },
                { name: "Experience", category: "Zero Gravity flight experience", price: 8500, image: "https://static.wixstatic.com/media/9ce3e5_10514695214d4417b458f530706ff8ba~mv2.png", description: "WFH moon." },
                { name: "Experience", category: "1 Hour Cuddle Therapy session", price: 150, image: "https://static.wixstatic.com/media/9ce3e5_0feabf7b66014205af62af01a979cb03~mv2.png", description: "I need this so badddd." },
                { name: "Tech", category: "Samsung Smart fridge with AI & 32 inch screen", price: 3199, image: "https://static.wixstatic.com/media/9ce3e5_45b612532a774ae590df332ea80968ac~mv2.png", description: "Absolutely no need of this." },
                { name: "Product", category: "Gold plated Toilet roll holder", price: 296, image: "https://static.wixstatic.com/media/9ce3e5_9e4e98ab8ce4417d84a1a248a9a8f978~mv2.png", description: "Bidet better" },
                { name: "History", category: "Dinosaur Poop Fossil", price: 34.99, image: "https://static.wixstatic.com/media/9ce3e5_f4b6b1b4e8664ef3a881d979d72e6203~mv2.png", description: "How is this a thing?" },
                { name: "Army", category: "Average yearly USA Military budget", price: 825000000000, image: "https://static.wixstatic.com/media/9ce3e5_353cb2c4e6754336a3eb5b922eaff87b~mv2.png", description: "Could buy so many Burgers with that!" },
                { name: "Country", category: "GDP of Uruguay", price: 80000000000, image: "https://static.wixstatic.com/media/9ce3e5_264a05dc2d2045db95de65448a4121b0~mv2.png", description: "Suarez is my favourite player" },
                { name: "Games", category: "GTA 5 total production budget", price: 265000000, image: "https://static.wixstatic.com/media/9ce3e5_f1e0494716af4f728b1a44193e7b0dc6~mv2.png", description: "GTA 5 before GTA 6 is crazy." },
                { name: "Product", category: "Ninja Backyard Pizaa oven", price: 299, image: "https://static.wixstatic.com/media/9ce3e5_9789582189794e2ca8071c46785b1cce~mv2.png", description: "Pepperoni is the best topping." },
                { name: "History", category: "Titanic construction cost", price: 7500000, image: "https://static.wixstatic.com/media/9ce3e5_2046e5ccdcf14a2db8006555eda5631d~mv2.png", description: "RIP." },
                { name: "Toys", category: "Eiffel Tower Lego set", price: 750, image: "https://static.wixstatic.com/media/9ce3e5_09b2496bae1043b3827d498662f1b495~mv2.png", description: "Could go to France for that much." },
                { name: "Food", category: "Private Chef - 1 Week average price", price: 400, image: "https://static.wixstatic.com/media/9ce3e5_0c5d7a09e1e24db289cf6a1b5e62b732~mv2.png", description: "Cooking is such a chore." },
                { name: "Experience", category: "Dubai Skydive Experience", price: 760, image: "https://static.wixstatic.com/media/9ce3e5_8434298381e546b18fbb4be4a0ebdeff~mv2.png", description: "Love the palm." },
                { name: "Furniture", category: "This table from Ikea", price: 520, image: "https://static.wixstatic.com/media/9ce3e5_c5a9b178e21f47b4b1d66a6bab5de036~mv2.png", description: "Joe Rogan's table" },
                { name: "Animal", category: "Chihuahua average purchase price", price: 850, image: "https://static.wixstatic.com/media/9ce3e5_6c51f9a5493a426dabe30036597720ec~mv2.png", description: "Ugly ahh" },
                { name: "Online", category: "Temu average product price", price: 13, image: "https://static.wixstatic.com/media/9ce3e5_42c7fbc95ec043fda69990d76b712418~mv2.png", description: "Goated site." },
                { name: "Money", category: "How much Jeff Bezos makes every Minute", price: 30000, image: "https://static.wixstatic.com/media/9ce3e5_3afa5a8ac7904e349eff3944fa5b6c9a~mv2.png", description: "Money is not real." },
                { name: "Money", category: "100 Pakistani Rupees in USD", price: 0.32, image: "https://static.wixstatic.com/media/9ce3e5_57e922e9ac0f4754b47f472a3125abaa~mv2.png", description: "My pledge is that I will be pilot." },];

const POINTS_TO_WIN = 3; // Points needed to win in multiplayer

// ==================================================================
//  REUSABLE UI COMPONENTS (These are still needed for the online flow)
// ==================================================================
const GameOverScreenComponent = ({ scores, handleNewGame }) => {
    const router = useRouter();

    const { winnerMessage, winnerNames } = useMemo(() => {
        if (!scores || Object.keys(scores).length === 0) {
            return { winnerMessage: "Game Over", winnerNames: [] };
        }

        let maxScore = -1;
        for (const score of Object.values(scores)) {
            if (score > maxScore) {
                maxScore = score;
            }
        }

        const winners = Object.keys(scores).filter(name => scores[name] === maxScore);

        if (maxScore <= 0 || winners.length === 0) {
             return { winnerMessage: "Game Over!", winnerNames: [] };
        }

        if (winners.length === 1) {
            return { winnerMessage: `${winners[0]} Wins!`, winnerNames: winners };
        } else {
            const tieMessage = "It's a Tie between " + winners.join(' & ') + "!";
            return { winnerMessage: tieMessage, winnerNames: winners };
        }
    }, [scores]);


    useEffect(() => { 
      const triggerConfetti = () => {
        if (typeof window === 'undefined' || winnerNames.length === 0) return;
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
    }, [winnerNames]);
    
    return (
        <div id="game-over-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot"/>
            <div className="win-message">{winnerMessage}</div>
            
            {winnerNames.length > 0 && <div className="winner-trophy">🏆</div>}

            <div id="final-scores-area" className="score-display">
                 {Object.entries(scores).map(([name, score]) => (
                    <div key={name} className={`score-card ${winnerNames.includes(name) ? 'winner-glow' : ''}`}>
                        <h4>{name}</h4>
                        <div className="text-3xl font-bold">{score}</div>
                    </div>
                ))}
            </div>

            <div className="game-over-buttons-container">
                <button id="play-again-btn" onClick={handleNewGame} className="btn-success"><i className="fas-fa-home"></i> Back to Lobby</button>
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
//  MAIN PAGE COMPONENT (Online-Only Flow)
// ==================================================================
export default function GuessThePricePage() {
    const router = useRouter();

    // --- State for Online Multiplayer ---
    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);

    // --- State for UI & Audio ---
    const [isAudioConsentModalOpen, setAudioConsentModalOpen] = useState(true);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [musicVolume, setMusicVolume] = useState(0.3);
    const [audioContextStarted, setAudioContextStarted] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const backgroundMusicRef = useRef(null);
    const sfxRefs = { start: useRef(null), interaction: useRef(null), correct: useRef(null), wrong: useRef(null), curtain: useRef(null) };
    
    // --- Initial Setup and Audio Management Hooks ---
    useEffect(() => {
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        window.addEventListener('resize', setAppHeight); setAppHeight();
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    useEffect(() => {
        const savedVol = localStorage.getItem('musicVolume');
        const savedSfx = localStorage.getItem('sfxEnabled');
        if (savedVol !== null) setMusicVolume(parseFloat(savedVol));
        if (savedSfx !== null) setSfxEnabled(savedSfx === 'true');
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

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
    };
    const initAudio = () => { if (audioContextStarted) return; setAudioContextStarted(true); };
    const playSound = (soundRef) => { if (sfxEnabled && soundRef.current && audioContextStarted) { soundRef.current.currentTime = 0; soundRef.current.play().catch(e => {}); }};
    
    // --- Firebase Logic Hooks ---

    // Automatically sign the user in when the page loads
    useEffect(() => {
        initAudio();
        signInAnonymously(auth).catch(e => {
            console.error("Anonymous sign-in failed", e);
            showToast("Connection error. Please refresh.", "wrong");
        });
    }, []);

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);
    
    // Listen for real-time game state changes from Firebase
    useEffect(() => {
        if (!gameId || !user) {
            setGameState(null);
            return;
        }
        const gameRef = ref(db, `game_sessions/${gameId}`);
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
        const playerRef = ref(db, `game_sessions/${gameId}/players/${user.uid}`);
        onDisconnect(playerRef).remove();
        return () => unsubscribe();
    }, [gameId, user]);
    
    // --- Online Game Functions ---
    
    const createGame = async (playerName) => {
        if (!user) return showToast("Authentication error, please wait a moment.", "wrong");
        playSound(sfxRefs.interaction);
        const newGameId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const gameRef = ref(db, `game_sessions/${newGameId}`);
        const initialGameState = {
            gameType: 'guessThePrice',
            hostId: user.uid,
            status: 'lobby',
            createdAt: serverTimestamp(),
            pointsToWin: POINTS_TO_WIN,
            gameData: null,
            players: {
                [user.uid]: {
                    name: playerName.trim(),
                    uid: user.uid
                }
            }
        };
        await set(gameRef, initialGameState);
        setGameId(newGameId);
    };

    const joinGame = (idToJoin, playerName) => {
        if (!user) {
            showToast("Authentication error, please wait a moment.", "wrong");
            return;
        }
        playSound(sfxRefs.interaction);
        const gameRef = ref(db, `game_sessions/${idToJoin}`);
        onValue(gameRef, async (snapshot) => {
            if (snapshot.exists()) {
                const gameData = snapshot.val();
                if (gameData.status === 'lobby') {
                    const playerRef = ref(db, `game_sessions/${idToJoin}/players/${user.uid}`);
                    await set(playerRef, { name: playerName, score: 0 });
                    setGameId(idToJoin);
                } else {
                    showToast("This game has already started.", "wrong");
                }
            } else {
                showToast("Game code not found. Please double-check the code.", "wrong");
            }
        }, { onlyOnce: true });
    };
    
    const leaveGame = () => {
        if (!user || !gameId || !gameState) return;
        playSound(sfxRefs.interaction);
        if (gameState.hostId === user.uid) {
            remove(ref(db, `game_sessions/${gameId}`));
        } else {
            remove(ref(db, `game_sessions/${gameId}/players/${user.uid}`));
        }
        setGameId(null);
        setGameState(null);
    };

    const startGame = () => {
        if (!gameState || gameState.hostId !== user.uid) return;
        playSound(sfxRefs.start);
        const firstItemIndex = Math.floor(Math.random() * itemsData.length);
        const players = Object.keys(gameState.players);
        const updates = {
            status: 'in-game',
            currentRound: 1,
            currentItemIndex: firstItemIndex,
            usedItemIndexes: [firstItemIndex],
            ...players.reduce((acc, uid) => {
                acc[`/players/${uid}/score`] = 0;
                return acc;
            }, {})
        };
        update(ref(db, `game_sessions/${gameId}`), updates);
    };
    
    // MODIFIED: This function now handles conditional navigation.
    const handleBackButton = () => {
        if (gameId) {
            // If we are in a game or lobby, leave it.
            // This will set gameId to null, which automatically shows the MultiplayerStartScreen.
            leaveGame();
        } else {
            // If we are already on the start screen (no gameId), go to the main website.
            window.location.href = 'https://www.playblyza.com/';
        }
    }
    
    // --- Main Render Logic ---
    const onlineGameProps = { user, gameId, gameState, itemsData, db, playSound, sfxRefs, showToast };
    
    return (
        <>
            <Head>
                <title>Guess The Price Online - Blyza Game Center</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </Head>

            <button id="home-menu-btn" className="icon-btn" onClick={handleBackButton}>
                <i className="fas fa-arrow-left"></i>
            </button>
            <button id="settings-btn" className="icon-btn" onClick={() => { playSound(sfxRefs.interaction); setSettingsModalOpen(true); }}>
                <i className="fas fa-cog"></i>
            </button>

            <div className="game-page-wrapper">
                <div className="hero-background-elements">
                    <div className="bg-game-element bg-dollar-1"><i className="fas fa-dollar-sign"></i></div>
                    <div className="bg-game-element bg-tag-1"><i className="fas fa-tag"></i></div>
                    <div className="bg-game-element bg-cart-1"><i className="fas fa-shopping-cart"></i></div>
                    <div className="bg-game-element bg-cash-1"><i className="fas fa-cash-register"></i></div>
                    <div className="bg-game-element bg-dollar-2"><i className="fas fa-dollar-sign"></i></div>
                    <div className="bg-game-element bg-tag-2"><i className="fas fa-tag"></i></div>
                    <div className="bg-game-element bg-cart-2"><i className="fas fa-shopping-cart"></i></div>
                    <div className="bg-game-element bg-cash-2"><i className="fas fa-cash-register"></i></div>
                </div>

                <div className="game-container">
                    {
                        !user ? <div className="loading-screen">Connecting to Blyza Servers...</div>
                        : !gameId ? <MultiplayerStartScreen {...{user, createGame, joinGame}} />
                        : !gameState ? <div className="loading-screen">Joining Game...</div>
                        : {
                            'lobby': <LobbyScreen {...onlineGameProps} startGame={startGame} />,
                            'in-game': <OnlineGameScreen {...onlineGameProps} />,
                            'results': <OnlineResultsScreen {...onlineGameProps} />,
                            'game-over': (() => {
                                 const finalScores = Object.values(gameState.players).reduce((acc, player) => { acc[player.name] = player.score; return acc; }, {});
                                 return <GameOverScreenComponent scores={finalScores} handleNewGame={leaveGame} />;
                            })()
                        }[gameState.status] || <div>Error: Unknown game state. Please refresh.</div>
                    }
                </div>
            </div>
            
            {toast.show && <div className={`toast ${toast.type}`}> {toast.message} </div>}
            
            {isAudioConsentModalOpen && (
                <div className="modal" style={{display: 'flex'}}>
                    <div className="modal-content">
                        <h2>Enable Audio?</h2>
                        <p>This game has sounds. Would you like to enable them?</p>
                        <div id="audio-consent-buttons">
                            <button onClick={() => { setAudioConsentModalOpen(false); initAudio(); playSound(sfxRefs.interaction); }} className="btn-success">Yes!</button>
                            <button onClick={() => { setSfxEnabled(false); setMusicVolume(0); setAudioConsentModalOpen(false); }} className="btn-secondary">No, thanks</button>
                        </div>
                    </div>
                </div>
            )}
            
            {isSettingsModalOpen && <SettingsModal {...{ setOpen: setSettingsModalOpen, musicVolume, setMusicVolume, sfxEnabled, setSfxEnabled, playSound, sfxRefs }} />}
            
            <audio ref={backgroundMusicRef} loop src="https://static.wixstatic.com/mp3/9ce3e5_380adfaea802407b9a4cebc67f12a216.mp3"></audio>
            <audio ref={sfxRefs.start} src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3"></audio>
            <audio ref={sfxRefs.interaction} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav"></audio>
            <audio ref={sfxRefs.correct} src="https://static.wixstatic.com/mp3/9ce3e5_76691a6fefcd4536aa403ada111e886a.mp3"></audio>
            <audio ref={sfxRefs.wrong} src="https://static.wixstatic.com/mp3/9ce3e5_277f814439064d1bbe5c0342241b23e4.mp3"></audio>
            <audio ref={sfxRefs.curtain} src="https://static.wixstatic.com/mp3/9ce3e5_ccd36cdf98bf4e1594cf2e52d5296c51.wav"></audio>
            
            <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        </>
    );
}