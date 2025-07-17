// In pages/real-or-ai.js

// --- ACTION: Add useCallback to the import ---
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';

// Firebase Imports
import { auth, db } from '/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue, update, remove, onDisconnect, serverTimestamp } from 'firebase/database';

// Component Imports
import MultiplayerStartScreen from '/components/MultiplayerStartScreen';
import LobbyScreen from '/components/LobbyScreen';
import OnlineGameScreen from '/components/realorai/OnlineGameScreen';
import OnlineResultsScreen from '/components/realorai/OnlineResultsScreen';

// --- Static Game Data (Unchanged) ---
const mediaItems = [
    { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_d76ca16cd1db4a6da7d6292106a05590~mv2.jpg", description: "Popstar", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_df76be4f583d4f3e9a28dd3bd2c29510~mv2.jpg", description: "Master Oogway", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_8cf5eac3afde48ccab0a4b0c5a98dff6~mv2.png", description: "2.6 Million Dollar Mansion", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_52c88e7ede90479e9a22f96402606ca7~mv2.png", description: "What they lookin at?", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_bf87f7d4df874b408b8951c097206815~mv2.webp", description: "Maroon 5 concert", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_fab2c9bbd5b7483997e21730454bdf91~mv2.png", description: "Street photography", isAI: true }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_dad23f0a7a114f20ae21fe809b01be11/1080p/mp4/file.mp4", description: "Jelly", isAI: true }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_6ad18c17069842519f5ab861d920c365/1080p/mp4/file.mp4", description: "Love the beach", isAI: false }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_e39cfbcaee614f1b90c82cf2a881b7a4/1080p/mp4/file.mp4", description: "YUUMMMM", isAI: true }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_10b41ddbc09f481c8de2bdf59a02cefb/1080p/mp4/file.mp4", description: "Climbed that", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_92ef479506ab405aacddff5802111667~mv2.jpg", description: "Technologia", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_24e52e5bf9a14a7994be19537fb33dd2~mv2.jpg", description: "Sky full of stars", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_3dab047a6fcc4f8d97a73d41bb79c761~mv2.jpg", description: "Post Hike", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_b6a751547d6f48ea9b484f4c05409ad9~mv2.webp", description: "Space Invasion?", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_de96da45b2214773b27a35e58dcd7ea3~mv2.webp", description: "Adorablee", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_5c02118aa9cd4d8eb22e7621c155cd6a~mv2.webp", description: "Yumm", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_9cbcd84aa0634d9bb7d8ef14e3df8d4d~mv2.webp", description: "Future winter Olympian", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_f8226cd46b144ae3af8a91dff52cfcdd~mv2.png", description: "Sunkissed", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_f62a99e9d5b24e5587079d32ab023855~mv2.png", description: "Every wallpaper in 2013", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_160fdd4b9e8748e7ae0322524a350e04~mv2.png", description: "Sahara", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_d785956c74ee4e62b8eb7d80e56499ed~mv2.png", description: "Everybody's childhood crush", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_214a8f44c9b0446bbe197e95185f28de~mv2.png", description: "Oranges", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_e0f42595978145cc926f661e873258e6~mv2.png", description: "Family pic", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_1593625b415c49639afd56cb7589063b~mv2.webp", description: "Golden State", isAI: true }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_64edf447f7c8472db0696145d04d817e/1080p/mp4/file.mp4", description: "Aspiring videographer", isAI: true }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_a287874449c34b02bed1968be7adc58f/1080p/mp4/file.mp4", description: "Bloooom", isAI: true }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_f4dd37888eec481dac346561454c6529/1080p/mp4/file.mp4", description: "I wanna go there", isAI: true }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_9bd6c1e8834b401bbf7aae87c201afa4/1080p/mp4/file.mp4", description: "Bloom Bloom", isAI: false }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_6a0da61044284d8686ae7e8d3bbfa17d/1080p/mp4/file.mp4", description: "where is this?", isAI: false }, { type: "video", url: "https://video.wixstatic.com/video/9ce3e5_2976d3ab2dbd4675bb0b46c506055548/1080p/mp4/file.mp4", description: "Lapsie", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_3eb1495d90d84c33b19fe5c344674f5b~mv2.jpg", description: "Pretty frog", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_02b2a4f6170247709f467fe700452dd4~mv2.jpg", description: "HK Skyline", isAI: false }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_f004a01f1c72414a92588affdb63db75~mv2.jpg", description: "Egyptian Papyrus", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_8e623916fdfe40d2bc495400da325b3b~mv2.jpg", description: "Rocket Launch", isAI: true }, { type: "image", url: "https://static.wixstatic.com/media/9ce3e5_68ff6b1ec9c945e4ad0c9c0192be7e67~mv2.jpg", description: "It's a Pangolin", isAI: true },
];
const GameScreen = { START: 'start', GAME: 'game', RESULTS: 'results', GAME_OVER: 'gameOver' };
const MAX_ROUNDS = 5;

// ==================================================================
//  LOCAL GAME UI COMPONENTS (Unchanged from your previous version)
// ==================================================================
const StartScreenComponent = ({ gameMode, setGameMode, playSound, sfxRefs, teams, setTeams, handleStartGame, setSinglePlayerSubType, highScore, showToast }) => (
    <div id="start-screen" className="screen active">
        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
        <h1>Real or AI</h1>
        <div className="instructions">
            <p>HOW TO PLAY</p>
            <ul>
                <li><i className="fas fa-image"></i> You'll see an image or video</li>
                <li><i className="fas fa-brain"></i> Decide if it's real or AI-generated</li>
                <li><i className="fas fa-check-circle"></i> Get 1 point for each correct guess</li>
                <li><i className="fas fa-users"></i> Play solo or with up to 4 teams!</li>
            </ul>
        </div>
        <div className="game-mode-selection">
            <div className={`mode-option ${gameMode === 'single' ? 'selected' : ''}`} onClick={() => { playSound(sfxRefs.interaction); setGameMode('single'); }}>
                <i className="fas fa-user"></i>
                <h3>Single Player</h3>
                <p>5 rounds or infinite mode</p>
            </div>
            <div className={`mode-option ${gameMode === 'multi' ? 'selected' : ''}`} onClick={() => { playSound(sfxRefs.interaction); setGameMode('multi'); }}>
                <i className="fas fa-users"></i>
                <h3>Multiplayer</h3>
                <p>Up to 4 teams</p>
            </div>
        </div>
        
        {gameMode === 'single' && (
            <div id="single-player-sub-options" style={{ marginTop: '15px' }}>
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
                            {teams.length > 2 && (<button className="remove-team-btn" onClick={() => {playSound(sfxRefs.interaction); setTeams(teams.filter((_, i) => i !== index))}}><i className="fas fa-times"></i></button>)}
                        </div>
                    ))}
                </div>
                <button id="add-team-btn" onClick={() => {playSound(sfxRefs.interaction); teams.length < 4 && setTeams([...teams, { name: '' }])}} disabled={teams.length >= 4}>Add Team</button>
                <button id="start-game-btn" onClick={handleStartGame} className="btn-primary">Start Game <i className="fas fa-play"></i></button>
            </div>
        )}

        {gameMode === 'single' && (
             <div className="start-screen-bottom-actions" style={{marginTop: '20px'}}>
                <button className="btn-secondary" style={{backgroundColor: 'var(--blyza-sunny-yellow)', color: 'var(--text-dark)'}} onClick={() => showToast(`Infinite High Score: ${highScore}`, 'info')}>
                    <i className="fas fa-star"></i> High Score: {highScore}
                </button>
            </div>
        )}
    </div>
);
const GameScreenComponent = ({ gameMode, singlePlayerSubType, scores, currentRound, curtainsOpen, currentMedia, teams, currentPlayerIndex, handleChoice, buttonsDisabled }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        if (curtainsOpen && currentMedia?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => console.error("Video autoplay was prevented.", e));
        }
    }, [curtainsOpen, currentMedia]);

    return (
        <div id="game-screen" className="screen active">
            <div className="game-info">
                {gameMode === 'multi' && <div>Round <span>{currentRound}</span></div>}
                {gameMode === 'single' && singlePlayerSubType === '5rounds' && <div>Round <span>{currentRound}</span>/{MAX_ROUNDS}</div>}
                {gameMode === 'single' && <div>Score: <span>{scores[teams[0]?.name] || 0}</span></div>}
            </div>
            {gameMode === 'multi' && <div id="turn-indicator">{teams[currentPlayerIndex]?.name}'s turn:</div>}
            
            <div className="item-stage-container">
                <div className={`stage-curtains left ${curtainsOpen ? 'open' : ''}`}></div>
                <div className={`stage-curtains right ${curtainsOpen ? 'open' : ''}`}></div>
                <div className="tv-screen-container">
                    <h3>Is this Real or AI?</h3>
                    {currentMedia && (
                        <>
                            <div className={`media-description ${curtainsOpen ? 'visible' : ''}`}>{currentMedia.description}</div>
                            {currentMedia.type === 'image' ? (
                                <img src={currentMedia.url} alt={currentMedia.description} className={`media-content ${curtainsOpen ? 'visible' : ''}`} />
                            ) : (
                                <video ref={videoRef} src={currentMedia.url} controls muted loop playsInline className={`media-content ${curtainsOpen ? 'visible' : ''}`}></video>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="choice-buttons">
                <button onClick={() => handleChoice('real')} className="choice-btn btn-success" disabled={buttonsDisabled}><i className="fas fa-check-circle"></i> Real</button>
                <button onClick={() => handleChoice('ai')} className="choice-btn btn-danger" disabled={buttonsDisabled}><i className="fas fa-robot"></i> AI</button>
            </div>
        </div>
    );
};
const ResultsScreenComponent = ({ currentMedia, teams, scores, gameMode, singlePlayerSubType, currentRound, setScreen, handleNextRound, roundChoices }) => {
    const videoRef = useRef(null);
    useEffect(() => {
        if (currentMedia?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => {});
        }
    }, [currentMedia]);
    const isGameOver = useMemo(() => {
        if (gameMode === 'multi' && currentRound >= MAX_ROUNDS) return true;
        if (gameMode === 'single' && singlePlayerSubType === '5rounds' && currentRound >= MAX_ROUNDS) return true;
        if (gameMode === 'single' && singlePlayerSubType === 'infinite') {
            const playerChoice = roundChoices[teams[0].name];
            const isCorrect = (playerChoice === 'real' && !currentMedia.isAI) || (playerChoice === 'ai' && currentMedia.isAI);
            if (!isCorrect) return true;
        }
        return false;
    }, [currentRound, gameMode, singlePlayerSubType, roundChoices, teams, currentMedia]);

    return (
        <div id="results-screen" className="screen active">
            <h1>Round Result</h1>
            <div className="result-item-display">
                {currentMedia.type === 'image' ? (
                    <img src={currentMedia.url} alt={currentMedia.description} className="media-content visible" />
                ) : (
                    <video ref={videoRef} src={currentMedia.url} controls muted loop playsInline className="media-content visible"></video>
                )}
                <div className={`answer-display ${currentMedia.isAI ? 'answer-ai' : 'answer-real'}`}>
                    <i className={`fas ${currentMedia.isAI ? 'fa-robot' : 'fa-check-circle'}`}></i>
                    {currentMedia.isAI ? "AI-Generated!" : "This was Real!"}
                </div>
            </div>
            {gameMode === 'single' ? (
                (() => {
                    const choice = roundChoices[teams[0].name];
                    const isCorrect = (choice === 'real' && !currentMedia.isAI) || (choice === 'ai' && currentMedia.isAI);
                    return (
                        <div className={`feedback-summary ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
                            <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                            {isCorrect ? "You guessed correctly!" : `Incorrect! You chose ${choice}.`}
                        </div>
                    );
                })()
            ) : (
                <div className="detailed-feedback-area">
                    {teams.map(team => {
                        const choice = roundChoices[team.name];
                        if (!choice) return null;
                        const isCorrect = (choice === 'real' && !currentMedia.isAI) || (choice === 'ai' && currentMedia.isAI);
                        return (
                            <div key={team.name} className={`player-feedback-entry ${isCorrect ? 'correct' : 'incorrect'}`}>
                                <i className={`fas fa-${isCorrect ? 'check' : 'times'}`}></i>
                                <strong>{team.name}</strong> chose: {choice}.
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="score-display">
                {teams.map(team => (
                    <div key={team.name} className="score-card">
                        <h4>{team.name}</h4>
                        <div className="score-value">{scores[team.name] || 0}</div>
                        {gameMode !== 'single' || singlePlayerSubType !== 'infinite' ? (
                             <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${((scores[team.name] || 0) / MAX_ROUNDS) * 100}%` }}></div>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
            <button id="next-round-btn" className="btn-primary" onClick={() => isGameOver ? setScreen(GameScreen.GAME_OVER) : handleNextRound()}>
                {isGameOver ? 'See Final Results' : 'Next Round'} <i className={`fas ${isGameOver ? 'fa-trophy' : 'fa-arrow-right'}`}></i>
            </button>
        </div>
    );
};
const GameOverScreenComponent = ({ scores, gameMode, handleNewGame, singlePlayerSubType, highScore, setHighScore, beatTheGame, playSound, sfxRefs }) => {
    const router = useRouter();
    
    useEffect(() => { 
      if (gameMode === 'single' && singlePlayerSubType === 'infinite') {
          const finalScore = Object.values(scores)[0] || 0;
          if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem('realOrAiHighScore', finalScore.toString());
          }
      }

      const triggerConfetti = () => {
        if (typeof window === 'undefined' || !playSound) return;
        playSound(sfxRefs.confetti);
        const colors = ['#FF8833', '#cb7ae1', '#00BFA6', '#FFDF00'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            const animDuration = Math.random() * 3 + 2;
            confetti.style.animation = `fallAndFade ${animDuration}s linear ${Math.random()}s forwards`;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), (animDuration + 1.1) * 1000);
        }
      };
      triggerConfetti(); 
    }, [gameMode, singlePlayerSubType, scores, highScore, setHighScore, playSound, sfxRefs.confetti, beatTheGame]);

    const { winnerMessage, finalDetails, trophy, winnerNames } = useMemo(() => {
        let maxScore = -1;
        if(Object.values(scores).length > 0) {
            maxScore = Math.max(...Object.values(scores));
        }

        if (gameMode === 'single') {
            const score = Object.values(scores)[0] || 0;
            const singlePlayerName = Object.keys(scores)[0] || "You";
            if (singlePlayerSubType === 'infinite') {
                const isNewHighScore = score > highScore;
                if (beatTheGame) {
                    return { winnerMessage: "You Beat The Game!", finalDetails: `You correctly identified all items! Final Score: ${score}. ${isNewHighScore ? '<strong>New High Score!</strong>' : ''}`, trophy: '👑', winnerNames: [singlePlayerName] };
                }
                return { winnerMessage: "Game Over!", finalDetails: `Your Score: ${score}. ${isNewHighScore ? '<strong>New High Score!</strong>' : `High Score: ${highScore}`}`, trophy: isNewHighScore ? '🏆' : '👍', winnerNames: [] };
            }
            if (score === MAX_ROUNDS) return { winnerMessage: "Perfect Score!", finalDetails: "You're an expert!", trophy: '🌟', winnerNames: [singlePlayerName] };
            if (score >= Math.ceil(MAX_ROUNDS * 0.6)) return { winnerMessage: "Great Job!", finalDetails: `You got ${score} out of ${MAX_ROUNDS}.`, trophy: '🏆', winnerNames: [singlePlayerName] };
            return { winnerMessage: "Nice Try!", finalDetails: `You got ${score} out of ${MAX_ROUNDS}.`, trophy: '👍', winnerNames: [] };
        }

        const winnerList = Object.keys(scores).filter(name => scores[name] === maxScore && maxScore > 0);
        if (winnerList.length === 1) return { winnerMessage: `${winnerList[0]} Wins!`, finalDetails: `With a top score of ${maxScore}!`, trophy: '🏆', winnerNames: winnerList };
        if (winnerList.length > 1) return { winnerMessage: "It's a Tie!", finalDetails: `${winnerList.join(' & ')} all scored ${maxScore}!`, trophy: '🏆', winnerNames: winnerList };
        return { winnerMessage: "Game Complete!", finalDetails: "Great game, everyone!", trophy: '🎉', winnerNames: [] };

    }, [scores, gameMode, singlePlayerSubType, highScore, beatTheGame]);
    
    return (
        <div id="game-over-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot"/>
            <h1>Game Over!</h1>
            <div className="win-message">{winnerMessage}</div>
            <div className="winner-trophy">{trophy}</div>
            <div id="final-message-details-el" dangerouslySetInnerHTML={{ __html: finalDetails }}></div>

            <div id="final-score-display-el" className="score-display">
                {Object.entries(scores).map(([name, score]) => (
                    <div key={name} className={`score-card ${winnerNames.includes(name) ? 'winner-glow' : ''}`}>
                        <h4>{name}</h4>
                        <div className="score-value">{score || 0}</div>
                    </div>
                ))}
            </div>
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
    <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content">
            <span className="close-modal-btn" onClick={() => setOpen(false)}>×</span>
            <h2>Settings</h2>
            <div className="setting-item">
                <label htmlFor="music-volume">Music Volume</label>
                <input id="music-volume" type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={e => setMusicVolume(parseFloat(e.target.value))} />
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
//  MAIN PAGE COMPONENT
// ==================================================================
export default function RealOrAIPage() {
    const router = useRouter();
    const [playMode, setPlayMode] = useState(null);
    const [screen, setScreen] = useState(GameScreen.START);
    const [teams, setTeams] = useState([{ name: 'Team 1' }, { name: 'Team 2' }]);
    const [gameMode, setGameMode] = useState('single');
    const [singlePlayerSubType, setSinglePlayerSubType] = useState('5rounds');
    const [scores, setScores] = useState({});
    const [highScore, setHighScore] = useState(0);
    const [currentRound, setCurrentRound] = useState(0);
    const [currentMedia, setCurrentMedia] = useState(null);
    const [usedItems, setUsedItems] = useState([]);
    const [roundChoices, setRoundChoices] = useState({});
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [beatTheGame, setBeatTheGame] = useState(false);
    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [curtainsOpen, setCurtainsOpen] = useState(false);
    const [isAudioConsentModalOpen, setAudioConsentModalOpen] = useState(true);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [musicVolume, setMusicVolume] = useState(0.2);
    const [audioContextStarted, setAudioContextStarted] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    const backgroundMusicRef = useRef(null);
    const sfxRefs = { start: useRef(null), interaction: useRef(null), correct: useRef(null), incorrect: useRef(null), curtain: useRef(null), confetti: useRef(null) };
    
    useEffect(() => {
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        window.addEventListener('resize', setAppHeight); setAppHeight();
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    useEffect(() => {
        const savedVol = localStorage.getItem('musicVolume');
        const savedSfx = localStorage.getItem('sfxEnabled');
        const savedHighScore = localStorage.getItem('realOrAiHighScore');
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
            } else if (audioContextStarted && musicVolume > 0 && backgroundMusicRef.current.paused) {
                backgroundMusicRef.current.play().catch(e => {});
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [audioContextStarted, musicVolume]);

    // --- ACTION: WRAP ALL FUNCTIONS IN useCallback TO PREVENT RE-RENDERING LOOPS ---
    const showToast = useCallback((message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
    }, []);

    const playSound = useCallback((soundRef) => {
        if (sfxEnabled && soundRef.current && audioContextStarted) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(e => {});
        }
    }, [sfxEnabled, audioContextStarted]);

    const initAudio = useCallback(() => {
        if (audioContextStarted) return;
        setAudioContextStarted(true);
    }, [audioContextStarted]);
    
    const setupRound = useCallback((initialUsedItems = usedItems) => {
        setRoundChoices({});
        setCurtainsOpen(false);
        setButtonsDisabled(false);
        setCurrentPlayerIndex(0);
        let available = mediaItems.filter(i => !initialUsedItems.includes(i.url));
        if (available.length === 0) {
            setBeatTheGame(true);
            setScreen(GameScreen.GAME_OVER);
            return;
        }
        const nextMedia = available[Math.floor(Math.random() * available.length)];
        setCurrentMedia(nextMedia);
        setUsedItems(prev => [...prev, nextMedia.url]);
        setCurrentRound(prev => prev + 1);
        setScreen(GameScreen.GAME);
        setTimeout(() => { playSound(sfxRefs.curtain); setCurtainsOpen(true); }, 500);
    }, [usedItems, playSound, sfxRefs.curtain]);

    const handleStartGame = useCallback(() => {
        playSound(sfxRefs.start);
        initAudio();
        let playerObjects;
        let initialScores = {};
        if (gameMode === 'single') {
            playerObjects = [{ name: 'You' }];
        } else {
            playerObjects = teams.map((team, index) => ({ name: team.name.trim() || `Team ${index + 1}` }));
            if (playerObjects.length < 2) { 
                showToast('You need at least 2 teams!', 'wrong'); 
                return; 
            }
        }
        playerObjects.forEach(p => initialScores[p.name] = 0);
        setScores(initialScores);
        setTeams(playerObjects);
        setCurrentRound(0);
        setUsedItems([]);
        setBeatTheGame(false);
        setupRound([]);
    }, [playSound, initAudio, gameMode, teams, showToast, setupRound]);

    const processAndShowResults = useCallback((finalChoices) => {
        let newScores = { ...scores };
        let correctPlayers = [];
        teams.forEach(team => {
            const choice = finalChoices[team.name];
            const isCorrect = (choice === 'real' && !currentMedia.isAI) || (choice === 'ai' && currentMedia.isAI);
            if(isCorrect) {
                newScores[team.name] = (newScores[team.name] || 0) + 1;
                correctPlayers.push(team.name);
            }
        });
        setScores(newScores);
        if (correctPlayers.length > 0) playSound(sfxRefs.correct);
        else playSound(sfxRefs.incorrect);
        if(gameMode === 'single') {
             showToast(correctPlayers.length > 0 ? "Correct!" : "Incorrect!", correctPlayers.length > 0 ? 'correct' : 'wrong');
        } else {
            if(correctPlayers.length === teams.length) showToast("Everyone got it right!", 'correct');
            else if(correctPlayers.length > 0) showToast(`${correctPlayers.join(', ')} got it right!`, 'correct');
            else showToast("No one got it right!", 'wrong');
        }
        setScreen(GameScreen.RESULTS);
    }, [scores, teams, currentMedia, playSound, sfxRefs.correct, sfxRefs.incorrect, gameMode, showToast]);

    const handleChoice = useCallback((choice) => {
        playSound(sfxRefs.interaction);
        setButtonsDisabled(true);
        const currentTeamName = teams[currentPlayerIndex].name;
        const newChoices = {...roundChoices, [currentTeamName]: choice};
        setRoundChoices(newChoices);
        if (gameMode === 'single' || currentPlayerIndex >= teams.length - 1) {
            setTimeout(() => processAndShowResults(newChoices), 500);
        } else {
            setTimeout(() => {
                setCurrentPlayerIndex(prev => prev + 1);
                setButtonsDisabled(false);
                showToast(`${teams[currentPlayerIndex + 1].name}'s turn!`, 'info');
            }, 400);
        }
    }, [playSound, teams, currentPlayerIndex, roundChoices, gameMode, processAndShowResults, showToast]);

    const handleNextRound = useCallback(() => {
      playSound(sfxRefs.interaction);
      setupRound();
    }, [playSound, setupRound]);
    
    const handleNewGame = useCallback(() => {
        playSound(sfxRefs.interaction);
        setScreen(GameScreen.START);
        setGameMode('single');
        setTeams([{ name: 'Team 1' }, { name: 'Team 2' }]);
    }, [playSound]);
    
    // --- ONLINE GAME LOGIC (now using useCallback) ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
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
    }, [playMode, gameId, user, showToast]);
    
    const createGame = useCallback(async (playerName) => {
        if (!user) return showToast("Authentication error, please wait.", "wrong");
        const newGameId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const gameRef = ref(db, `games/${newGameId}`);
        const newGameData = {
            gameType: 'realOrAI',  // Different gameType
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
        await set(gameRef, newGameData);
        setGameId(newGameId);
    }, [user, showToast]);

    const joinGame = useCallback((idToJoin, playerName) => {
        if (!user) return showToast("Authentication error, please wait.", "wrong");
        const gameRef = ref(db, `games/${idToJoin}`);
        onValue(gameRef, async (snapshot) => {
            if (snapshot.exists()) {
                const gameData = snapshot.val();
                if (gameData.status === 'lobby') {
                    const playerRef = ref(db, `games/${idToJoin}/players/${user.uid}`);
                    await set(playerRef, { name: playerName, score: 0 });
                    setGameId(idToJoin);
                } else {
                    showToast("This game has already started.", "wrong");
                }
            } else {
                showToast("Game code not found.", "wrong");
            }
        }, { onlyOnce: true });
    }, [user, showToast]);
    
    const leaveGame = useCallback(() => {
        if (!user || !gameId || !gameState) return;
        if (gameState.hostId === user.uid) {
            remove(ref(db, `games/${gameId}`));
        } else {
            remove(ref(db, `games/${gameId}/players/${user.uid}`));
        }
        setGameId(null);
        setGameState(null);
    }, [user, gameId, gameState]);

    const startGame = useCallback(() => {
        if (!gameState || gameState.hostId !== user.uid) return;
        playSound(sfxRefs.start);
        const firstItemIndex = Math.floor(Math.random() * mediaItems.length);
        const players = Object.keys(gameState.players);
        const updates = {
            status: 'in-game', currentRound: 1, currentItemIndex: firstItemIndex, usedItemIndexes: [firstItemIndex],
            ...players.reduce((acc, uid) => { acc[`/players/${uid}/score`] = 0; return acc; }, {})
        };
        update(ref(db, `games/${gameId}`), updates);
    }, [gameState, user, gameId, playSound, sfxRefs.start]);

    const goBackToModeSelect = useCallback(() => {
        if (gameId) leaveGame();
        handleNewGame();
        setPlayMode(null);
    }, [gameId, leaveGame, handleNewGame]);
    
    // --- RENDER LOGIC ---
    const sharedHead = (
        <Head>
            <title>Real or AI - Blyza Game Center</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </Head>
    );

    const sharedAudioAndModals = (
        <>
            {toast.show && ( <div className={`toast ${toast.type}`}> {toast.message} </div> )}
            {isAudioConsentModalOpen && playMode !== null && (
                <div className="modal" style={{display: 'flex'}}>
                    <div className="modal-content"><h2>Enable Audio?</h2><p>This game has sounds. Would you like to enable them?</p><div id="audio-consent-buttons"><button onClick={() => { playSound(sfxRefs.interaction); setAudioConsentModalOpen(false); initAudio(); }} className="btn-success">Yes!</button><button onClick={() => { setSfxEnabled(false); setMusicVolume(0); setAudioConsentModalOpen(false); initAudio(); }} className="btn-secondary">No, thanks</button></div></div>
                </div>
            )}
            {isSettingsModalOpen && ( <SettingsModal {...{ setOpen: setSettingsModalOpen, musicVolume, setMusicVolume, sfxEnabled, setSfxEnabled, playSound, sfxRefs }} /> )}
            <audio ref={backgroundMusicRef} loop src="https://static.wixstatic.com/mp3/9ce3e5_380adfaea802407b9a4cebc67f12a216.mp3"></audio>
            <audio ref={sfxRefs.start} src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3"></audio>
            <audio ref={sfxRefs.interaction} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav"></audio>
            <audio ref={sfxRefs.correct} src="https://static.wixstatic.com/mp3/9ce3e5_76691a6fefcd4536aa403ada111e886a.mp3"></audio>
            <audio ref={sfxRefs.incorrect} src="https://static.wixstatic.com/mp3/9ce3e5_277f814439064d1bbe5c0342241b23e4.mp3"></audio>
            <audio ref={sfxRefs.curtain} src="https://static.wixstatic.com/mp3/9ce3e5_ccd36cdf98bf4e1594cf2e52d5296c51.wav"></audio>
            <audio ref={sfxRefs.confetti} src="https://static.wixstatic.com/mp3/9ce3e5_5d7fcfc389734cf7994f5d37de621e3d.mp3"></audio>
            <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        </>
    );

    const sharedWrapper = (children) => (
        <div className="game-page-wrapper">
            <div className="hero-background-elements">
                <div className="bg-game-element bg-android-1"><i className="fas fa-android"></i></div>
                <div className="bg-game-element bg-brain-1"><i className="fas fa-brain"></i></div>
            </div>
            <div className="game-container">{children}</div>
        </div>
    );
    
    // --- RENDER BASED ON PLAY MODE ---
    if (playMode === 'local') {
        const localGameProps = { gameMode, setGameMode, playSound, sfxRefs, teams, setTeams, handleStartGame, setSinglePlayerSubType, highScore, scores, currentRound, curtainsOpen, currentMedia, currentPlayerIndex, handleChoice, buttonsDisabled, roundChoices, setScreen, handleNextRound, handleNewGame, setHighScore, beatTheGame, showToast };
        const gameOverScores = gameMode === 'single' ? { [teams[0]?.name || 'You']: scores[teams[0]?.name || 'You'] } : scores;
        return (
            <>
                {sharedHead}
                <button id="home-menu-btn" className="icon-btn" onClick={goBackToModeSelect}><i className="fas fa-arrow-left"></i></button>
                <button id="settings-btn" className="icon-btn" onClick={() => { playSound(sfxRefs.interaction); setSettingsModalOpen(true); }}><i className="fas fa-cog"></i></button>
                {sharedWrapper({
                    [GameScreen.START]: <StartScreenComponent {...localGameProps} />,
                    [GameScreen.GAME]: <GameScreenComponent {...localGameProps} />,
                    [GameScreen.RESULTS]: <ResultsScreenComponent {...localGameProps} />,
                    [GameScreen.GAME_OVER]: <GameOverScreenComponent {...localGameProps} scores={gameOverScores} />,
                }[screen])}
                {sharedAudioAndModals}
            </>
        );
    } 
    
    if (playMode === 'online') {
        const onlineGameProps = { user, gameId, gameState, mediaItems, db, playSound, sfxRefs, showToast };
        return (
            <>
                {sharedHead}
                <button id="home-menu-btn" className="icon-btn" onClick={goBackToModeSelect}><i className="fas fa-arrow-left"></i></button>
                <button id="settings-btn" className="icon-btn" onClick={() => { playSound(sfxRefs.interaction); setSettingsModalOpen(true); }}><i className="fas fa-cog"></i></button>
                {sharedWrapper(
                    !user ? <div className="loading-screen">Connecting...</div>
                    : !gameId ? <MultiplayerStartScreen {...{user, createGame, joinGame}} />
                    : !gameState ? <div className="loading-screen">Joining Game...</div>
                    : {
                        'lobby': <LobbyScreen {...onlineGameProps} startGame={startGame} leaveGame={leaveGame} />,
                        'in-game': <OnlineGameScreen {...onlineGameProps} />,
                        'results': <OnlineResultsScreen {...onlineGameProps} />,
                        'game-over': (() => {
                             const finalScores = Object.values(gameState.players).reduce((acc, player) => { acc[player.name] = player.score; return acc; }, {});
                             return <GameOverScreenComponent scores={finalScores} handleNewGame={goBackToModeSelect} gameMode="multi" playSound={playSound} sfxRefs={sfxRefs} />;
                        })()
                    }[gameState.status] || <div>Error: Unknown game state.</div>
                )}
                {sharedAudioAndModals}
            </>
        );
    }
    
    // Default: Mode Selection Screen
    return (
        <>
            {sharedHead}
            {sharedWrapper(
                <div id="mode-selection-screen" className="screen active">
                    <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
                    <h1>Real or AI</h1>
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
                            signInAnonymously(auth).catch(e => {
                                console.error("Anonymous sign-in failed", e);
                                showToast("Could not connect to online services.", "wrong");
                            });
                            setPlayMode('online');
                        }}>
                            <i className="fas fa-globe"></i>
                            <h3>Online Multiplayer</h3>
                            <p>Play with friends on different devices.</p>
                        </div>
                    </div>
                </div>
            )}
            {sharedAudioAndModals}
        </>
    );
}