import { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';

// --- Static Game Data ---
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
                { name: "Money", category: "100 Pakistani Rupees in USD", price: 0.32, image: "https://static.wixstatic.com/media/9ce3e5_57e922e9ac0f4754b47f472a3125abaa~mv2.png", description: "My pledge is that I will be pilot." },
               
];

const GameScreen = { START: 'start', GAME: 'game', RESULTS: 'results', GAME_OVER: 'gameOver' };

// ==================================================================
//  HELPER & UI COMPONENTS
// ==================================================================

const StartScreenComponent = ({ gameMode, setGameMode, playSound, sfxRefs, teams, setTeams, handleStartGame, setSinglePlayerSubType, highScore }) => (
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
        
        {/* --- Game mode specific options --- */}
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

        {/* --- NEW: Conditionally shown high score button --- */}
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
    const router = useRouter();
    
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
                <button id="new-game-btn" onClick={() => router.push('/')} className="btn-secondary"><i className="fas fa-home"></i> Main Menu</button>
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
//  Main Page Component
// ==================================================================
export default function GuessThePricePage() {
    const router = useRouter();
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
    const [isAudioConsentModalOpen, setAudioConsentModalOpen] = useState(true);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [musicVolume, setMusicVolume] = useState(0.3);
    const [audioContextStarted, setAudioContextStarted] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    const backgroundMusicRef = useRef(null);
    const sfxRefs = { start: useRef(null), interaction: useRef(null), correct: useRef(null), wrong: useRef(null), curtain: useRef(null) };
    
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
    
    // --- EDITED CODE: START ---
    // This effect handles pausing music when the user leaves the tab/app.
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!backgroundMusicRef.current) return;

            if (document.hidden) {
                backgroundMusicRef.current.pause();
            } else {
                // Only resume if music is supposed to be playing.
                if (audioContextStarted && musicVolume > 0 && backgroundMusicRef.current.paused) {
                    backgroundMusicRef.current.play().catch(e => {
                        console.log("Could not resume music automatically on visibility change.", e);
                    });
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [audioContextStarted, musicVolume]);
    // --- EDITED CODE: END ---

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
            console.warn("All items have been used. Restarting item list.");
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
            if (isCorrect) {
                winner = 'You';
                playSound(sfxRefs.correct);
                showToast("Correct Answer!", 'correct');
            } else {
                playSound(sfxRefs.wrong);
                showToast("Wrong Answer!", 'wrong');
            }
        } else {
            let smallestDiff = Infinity;
            teams.forEach(team => {
                const guess = parseFloat(guesses[team.name] || 0);
                const diff = Math.abs(guess - currentItem.price);
                diffs[team.name] = diff;
                if (diff < smallestDiff) { smallestDiff = diff; winner = team.name; }
                else if (diff === smallestDiff) { winner = null; }
            });
            if (winner) {
                playSound(sfxRefs.correct);
                showToast(`${winner} got it right!`, 'correct');
            } else {
                playSound(sfxRefs.wrong);
                showToast("Nobody got it!", 'wrong');
            }
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
    
    const screenComponents = {
        [GameScreen.START]: <StartScreenComponent {...{ gameMode, setGameMode, playSound, sfxRefs, teams, setTeams, handleStartGame, setSinglePlayerSubType, highScore }} />,
        [GameScreen.GAME]: <GameScreenComponent {...{ gameMode, singlePlayerSubType, scores, currentRound, curtainsOpen, currentItem, teams, guesses, setGuesses, handleRevealPrice }} />,
        [GameScreen.RESULTS]: <ResultsScreenComponent {...{ currentItem, guesses, teams, scores, gameMode, singlePlayerSubType, currentRound, setScreen, handleNextRound, roundResults }} />,
        [GameScreen.GAME_OVER]: <GameOverScreenComponent {...{ scores, gameMode, handleNewGame, singlePlayerSubType, highScore, setHighScore }} />,
    };

    return (
        <>
            <Head>
                <title>Guess The Price - Blyza Game Center</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            </Head>
            
            <button id="home-menu-btn" className="icon-btn" onClick={() => screen === GameScreen.START ? router.push('/') : handleNewGame()}>
                <i className={screen === GameScreen.START ? "fas fa-home" : "fas fa-arrow-left"}></i>
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
                </div>
                <div className="game-container">
                  {screenComponents[screen]}
                </div>
            </div>

            {toast.show && ( <div className={`toast ${toast.type}`}> {toast.message} </div> )}

            {isAudioConsentModalOpen && (
                <div className="modal" style={{display: 'flex'}}>
                    <div className="modal-content"><h2>Enable Audio?</h2><p>This game has sounds. Would you like to enable them?</p><div id="audio-consent-buttons"><button onClick={() => { setAudioConsentModalOpen(false); initAudio(); }} className="btn-success">Yes!</button><button onClick={() => { setSfxEnabled(false); setMusicVolume(0); setAudioConsentModalOpen(false); }} className="btn-secondary">No, thanks</button></div></div>
                </div>
            )}
            {isSettingsModalOpen && ( <SettingsModal {...{ setOpen: setSettingsModalOpen, musicVolume, setMusicVolume, sfxEnabled, setSfxEnabled, playSound, sfxRefs }} /> )}
            
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