// In pages/point-pursuit.js

import { useState, useEffect, useRef, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { auth, db } from '/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, set, onValue, update, remove, onDisconnect, serverTimestamp } from 'firebase/database';

// Import Online Components
import MultiplayerStartScreen from '/components/MultiplayerStartScreen';
import LobbyScreen from '/components/LobbyScreen';
import OnlineGameScreen from '/components/pointpursuit/OnlineGameScreen';
import OnlineResultsScreen from '/components/pointpursuit/OnlineResultsScreen';

// --- Static Game Data ---
const questionsDatabase = { "General Knowledge": { 100: [ { question: "Who painted the Mona Lisa?", options: ["Leonardo da Vinci", "Vincent van Gogh", "Pablo Picasso", "Michelangelo"], answer: 0 }, { question: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], answer: 1 }, { question: "What is the longest river in the world?", options: ["Indus", "Amazon", "Nile", "Danube"], answer: 2 } ], 200: [ { question: "What is the capital of Canada?", options: ["Montreal", "Toronto", "Vancouver", "Ottawa"], answer: 3 }, { question: "What is the national language of Brazil?", options: ["Spanish", "Brazillian", "Portuguese", "English"], answer: 2 }, { question: "What is the chemical symbol for Potassium?", options: ["Au", "K", "Pt", "P"], answer: 1 } ], 300: [ { question: "Which one of the following countries has an Airport?", options: ["Vatican", "Palau", "Andorra", "Monaco"], answer: 1 }, { question: "When did World War 1 end", options: ["1915", "1916", "1917", "1918"], answer: 3 }, { question: "How many prime numbers are there between 1 - 100?", options: ["23", "24", "25", "26"], answer: 2 } ], 400: [ { question: "Who was the first woman to win a Nobel Prize?", options: ["Irène Curie", "Marie Curie", "Mother Teresa", "Malala Yousafzai"], answer: 1 }, { question: "Which country gifted the Statue of Liberty to the US?", options: ["England", "France", "Spain", "Italy"], answer: 1 }, { question: "Which ancient civilization built Machu Picchu?", options: ["Inca", "Egyptian", "Indus", "Paracas"], answer: 0 } ], 500: [ { question: "Which country has the most Pyramids?", options: ["Sudan", "Egypt", "Jordan", "El Salvador"], answer: 0 }, { question: "What is the oldest University in the wrold?", options: ["The University of Bologna", "University of Salamanca ", "University of Oxford", "University of Al Quaraouiyine"], answer: 3 }, { question: "What is the mean annual temperature of the interior in Antarctica?", options: ["-35°C", "-43.5°C", "-48.5°C", "-55°C"], answer: 1 } ] }, "Pop Culture": { 100: [ { question: "Who is known as the 'Queen of Pop'?", options: ["Beyoncé", "Madonna", "Lady Gaga", "Taylor Swift"], answer: 1 }, { question: "Which actor played the lead role in the Pirates of the Caribbean movies?", options: ["Robert Downey Jr.", "Johnny Depp", "Tom Hanks", "Matt Damon"], answer: 1 }, { question: "When did the Titanic release?", options: ["1990", "1998", "2002", "2005"], answer: 1 } ], 200: [ { question: "What was the first Disney animated feature film?", options: ["Lion King", "Toy Story 1", "Snow White and the Seven Dwarfs", "Pinocchio"], answer: 2 }, { question: "What reality show made Harry Styles famous?", options: ["Britan's Got Talent", "The Voice", "Fear Factor", "X Factor"], answer: 3 }, { question: "Who was the first person to reach 100 million followers on Instagram?", options: ["Selena Gomez", "Katy Perry", "Cristiano Ronaldo", "Lady Gaga"], answer: 0 } ], 300: [ { question: "What year did Meta acquire Instagram?", options: ["2010", "2011", "2012", "2013"], answer: 2 }, { question: "How many Youtube channels have over 10 million subscribers?", options: ["1100", "1600", "1900", "2100"], answer: 3 }, { question: "What was Twitter's total revenue in 2017?", options: ["2.2B", "2.4B", "2.7B", "3.5B"], answer: 3 } ], 400: [ { question: "What is the real name of The Weeknd?", options: ["Abel Tesfaye", "Abel Fred", "Abel Myrtle", "Weekday"], answer: 0 }, { question: "What was the name of Ross and Rachel's baby in Friends?", options: ["Jack", "Ben", "Chloe", "Emma"], answer: 3 }, { question: "Who was the most subscriber streamer on Twitch in 2019?", options: ["Ninja", "TFue", "Kai Cenat", "Ludwig"], answer: 1 } ], 500: [ { question: "What was the first music video to air on MTV?", options: ["Thriller - Michael Jackson", "Video Killed the Radio Star - The Buggles", "Like a Virgin - Madonna", "Billie Jean - Michael Jackson"], answer: 1 }, { question: "What song holds the record for most weeks at #1 on Billboard Hot 100?", options: ["Old Town Road", "Gods Plan", "Shape of You", "Despacito"], answer: 0 }, { question: "What is the name of Ariana Grande’s perfume line?", options: ["Sky", "Air", "Blue", "Cloud"], answer: 3 } ] }, "Science": { 100: [ { question: "What is the most abundant gas on Earth?", options: ["Nitrogen", "Oxygen", "Carbon Dioxide", "Hellium"], answer: 0 }, { question: "Who discovered gravity?", options: ["Albert Einstein", "Thomas Edison", "Isaac Newton", "Charles Darwin"], answer: 2 }, { question: "Largest planet in our Solar System?", options: ["Earth", "Jupiter", "Neptune", "Uranus"], answer: 1 } ], 200: [ { question: "What is the approximate speed of light?", options: ["300,000,000 m/s", "300,000,000 km/s", "300,000,000 miles/s", "300,000,000 feet/s"], answer: 0 }, { question: "Which part of the plant conducts photosynthesis?", options: ["Stem", "Root", "Flower", "Leave"], answer: 3 }, { question: "What particle has a negative charge?", options: ["Proton", "Electron", "Neutron", "Atom"], answer: 1 } ], 300: [ { question: "What’s the main gas on the Sun?", options: ["Carbon", "Nitrogen", "Hydrogen", "Helium"], answer: 2 }, { question: "According to Newton's 2nd Law, what is the formula for Force?", options: ["Mass/Acceleration", "Acceleration/Mass", "Mass x Acceleration", "Gravitaional pull x Volume"], answer: 2 }, { question: "What is the name of the phenomenon where light bends as it passes from one medium to another?", options: ["Scattering", "Reflection", "Mirage", "Refraction"], answer: 3 } ], 400: [ { question: "What’s the heaviest naturally occurring element (by atomic mass)?", options: ["Uranium", "Tungsten", "Titanium", "Platinum"], answer: 0 }, { question: "What is the study of fossils called?", options: ["Geology", "Paleontology", "Archaeology", "Anthropology"], answer: 1 }, { question: "What is the study of earthquakes called?", options: ["Geology", "Paleontology", "Anthropology", "Seismology"], answer: 3 } ], 500: [ { question: "Which blood type is a universal donor?", options: ["O Negative", "O Positive", "B Positive", "B Negative"], answer: 0 }, { question: "How do you spell Science?", options: ["Sceince", "Scince", "Science", "Sciense"], answer: 2 }, { question: "Which of the following is not found inside a Human body?", options: ["Brain", "Heart", "Liver", "GMC Terrain 2016 model"], answer: 3 } ] }, "Sports": { 100: [ { question: "How many players are on a basketball team?", options: ["5", "6", "7", "8"], answer: 0 }, { question: "In which sport would you perform a slam dunk?", options: ["Football", "Basketball", "Tennis", "Baseball"], answer: 1 }, { question: "How many rings are on the Olympic flag?", options: ["8", "7", "6", "5"], answer: 3 } ], 200: [ { question: "Which country won the 2010 FIFA World Cup?", options: ["Germany", "Brazil", "France", "Spain"], answer: 3 }, { question: "What is the national sport of Japan?", options: ["Kendo", "Sumo", "Judo", "Karate"], answer: 1 }, { question: "How long is a Marathon?", options: ["26 km", "50 km", "42 km", "34 km"], answer: 2 } ], 300: [ { question: "Who has won the most Grand Slam titles in men’s tennis?", options: ["Roger Federer", "Novak Djokovic", "Rafael Nadal", "Andy Murray"], answer: 1 }, { question: "Which country hosted the 2004 Summer Olympics?", options: ["France", "Japan", "Greece", "Portugal"], answer: 2 }, { question: "Which athlete has won the most Olympic gold medals?", options: ["Michael Phelps", "Usain Bolt", "Larisa Latynina", "Simone Biles"], answer: 0 } ], 400: [ { question: "Whats the max achievable score in a single turn of Darts", options: ["150", "180", "200", "240"], answer: 1 }, { question: "Which country has won the most ICC Worlc Cups?", options: ["India", "Pakistan", "South Africa", "Australia"], answer: 3 }, { question: "Who currently has the longest win streak in the UFC?", options: ["Islam Makachev", "Khabib Nurmagomedov", "Jon Jones", "Conor Mcregor"], answer: 2 } ], 500: [ { question: "What is the diameter of a basketball hoop in inches?", options: ["16", "18", "20", "24"], answer: 1 }, { question: "What country invented table Tennis?", options: ["Thailand", "Phillipines", "China", "England"], answer: 3 }, { question: "Which professional Boxer holds the record for the most Knockouts?", options: ["Billy Bird", "Mike Tyson", "Sugar Ray Robinson", "Buck Smith"], answer: 0 } ] }, "History": { 100: [ { question: "In what year did World War II end?", options: ["1943", "1945", "1947", "1950"], answer: 1 }, { question: "Who was the first president of the United States?", options: ["Thomas Jefferson", "John Adams", "George Washington", "Abraham Lincoln"], answer: 2 }, { question: "Who was the famous queen of Egypt who had a relationship with Julius Caesar and Mark Antony?", options: ["Cleopatra", "Tutankhamun", "Ankhsenamun", "Queen Tiye"], answer: 0 } ], 200: [ { question: "Which ancient civilization built the pyramids?", options: ["Greeks", "Romans", "Egyptians", "Mayans"], answer: 2 }, { question: "What was the name of the ship that brought the Pilgrims to America?", options: ["Santa Maria", "Mayflower", "Pinta", "Nina"], answer: 1 }, { question: "Who was the British Prime Minister during most of WWII?", options: ["Clement Attlee", "Tony Blair", "Margaret Thatcher", "Winston Churchill"], answer: 3 } ], 300: [ { question: "Who wrote the Declaration of Independence?", options: ["Benjamin Franklin", "Thomas Jefferson", "John Adams", "George Washington"], answer: 1 }, { question: "When was the Internet made?", options: ["1983", "1988", "1991", "1993"], answer: 0 }, { question: "Who was the first emperor of Rome?", options: ["Julius", "Marcus", "Augustus", "Maximian"], answer: 2 } ], 400: [ { question: "Who was the first female Prime Minister of the United Kingdom?", options: ["Theresa May", "Margaret Thatcher", "Angela Merkel", "Indira Gandhi"], answer: 1 }, { question: "What was the name of the ancient trade route that connected China to the Mediterranean?", options: ["The Incense Route", "The Silk Road", "The Amber Road", "The Tea Route"], answer: 1 }, { question: "Who was the first man in Space", options: ["Yuri Gagaran", "Neil Armstrong", "Buzz Aldrin", "Buzz Lightyear"], answer: 0 } ], 500: [ { question: "What country experienced a genocide under the Khmer Rouge?", options: ["Mongolia", "Laos", "Indonesia", "Cambodia"], answer: 3 }, { question: "What was the name of the period of cultural and intellectual rebirth in Europe?", options: ["Enlightenment", "Reformation", "Renaissance", "Industrial Revolution"], answer: 2 }, { question: "Price of 1 oz of gold today is $3200. What was the price in 2001", options: ["$252", "$271", "$293", "$299"], answer: 1 } ] } };
const categories = ["General Knowledge", "Pop Culture", "Science", "Sports", "History"];
const values = [100, 200, 300, 400, 500];

const GameScreen = { START: 'start', TEAM_SETUP: 'team_setup', GAME: 'game', QUESTION: 'question', RESULTS: 'results' };

// ==================================================================
//  LOCAL PLAY UI COMPONENTS
// ==================================================================
const StartScreenComponent = ({ setScreen, playSound, sfxRefs }) => (
    <div id="start-screen" className="screen active">
        <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
        <h1>Point Pursuit</h1>
        <div className="instructions">
            <p>HOW TO PLAY</p>
            <ul>
                <li><i className="fas fa-list"></i> Choose from 5 categories, each with 5 difficulty levels</li>
                <li><i className="fas fa-brain"></i> Correct answers earn points; harder questions give more!</li>
                <li><i className="fas fa-circle-xmark"></i> Wrong answers deduct half the question's value!</li>
                <li><i className="fas fa-users"></i> Team with the most points wins!</li>
            </ul>
        </div>
        <button id="setup-teams-btn" className="btn-primary" onClick={() => { playSound(sfxRefs.interaction); setScreen(GameScreen.TEAM_SETUP); }}>
            <i className="fas fa-users"></i> Setup Teams
        </button>
    </div>
);

const TeamSetupComponent = ({ teams, setTeams, handleBeginGame, playSound, sfxRefs }) => {
    const minTeams = 2, maxTeams = 4;
    const addTeam = () => {
        if (teams.length < maxTeams) {
            playSound(sfxRefs.interaction);
            setTeams([...teams, { name: `Team ${teams.length + 1}`, score: 0 }]);
        }
    };
    const removeTeam = () => {
        if (teams.length > minTeams) {
            playSound(sfxRefs.interaction);
            setTeams(teams.slice(0, -1));
        }
    };
    const updateTeamName = (index, newName) => {
        const newTeams = [...teams];
        newTeams[index].name = newName;
        setTeams(newTeams);
    };

    return (
        <div id="team-setup-screen" className="screen active">
            <h2>Set Up Your Teams</h2>
            <div className="team-setup-controls">
                <p className="info-text" style={{ fontSize: '0.9rem', marginTop: '-15px', marginBottom: '20px' }}>(2-4 Teams)</p>
                <div className="team-inputs" id="team-inputs-container">
                    {teams.map((team, index) => (
                        <div key={index} className="team-input-container">
                            <input type="text" className="team-name-input" placeholder={`Team ${index + 1} Name`} value={team.name} onChange={(e) => updateTeamName(index, e.target.value)} />
                        </div>
                    ))}
                </div>
                <div className="team-add-remove-buttons">
                    <button id="add-team-btn" className="btn-secondary" onClick={addTeam} disabled={teams.length >= maxTeams}><i className="fas fa-plus-circle"></i> Add Team</button>
                    <button id="remove-team-btn" className="btn-danger" onClick={removeTeam} disabled={teams.length <= minTeams}><i className="fas fa-minus-circle"></i> Remove Team</button>
                </div>
            </div>
            <button id="begin-game-btn" className="btn-primary" onClick={handleBeginGame}><i className="fas fa-play"></i> Begin Game</button>
        </div>
    );
};

const LocalGameComponent = ({ teams, currentTeamIndex, usedQuestions, handleSelectQuestion }) => (
    <div id="game-screen" className="screen active">
        <h1>Point Pursuit</h1>
        <div className="team-display">
            {teams.map((team, index) => (
                <div key={index} className={`team-card ${index === currentTeamIndex ? 'active' : ''}`}>
                    <div className="team-name">{team.name}</div>
                    <div className="team-score">${team.score}</div>
                </div>
            ))}
        </div>
        <div className="game-board">
            {categories.map(cat => <div key={cat} className="category-header">{cat}</div>)}
            {values.map(val => categories.map(cat => {
                const isUsed = usedQuestions.includes(`${cat}-${val}`);
                return (
                    <div key={`${cat}-${val}`} className={`value-cell ${isUsed ? 'used' : ''}`} onClick={() => !isUsed && handleSelectQuestion(cat, val)}>
                        ${val}
                    </div>
                );
            }))}
        </div>
    </div>
);

const LocalQuestionComponent = ({ teams, currentTeamIndex, currentQuestion, handleAnswer, answerRevealed, selectedAnswer, playSound, sfxRefs }) => {
    const [curtainsOpen, setCurtainsOpen] = useState(false);
    useEffect(() => {
        setCurtainsOpen(false);
        setTimeout(() => {
            playSound(sfxRefs.curtain);
            setCurtainsOpen(true);
        }, 300);
    }, [currentQuestion]);

    return (
        <div id="question-screen" className="screen active">
            <div className="team-display">
                <div className="team-card active">
                    <div className="team-name">{teams[currentTeamIndex]?.name}'s Turn</div>
                    <div className="team-score">${teams[currentTeamIndex]?.score}</div>
                </div>
            </div>
            <div className="question-screen-content">
                <div className="question-category-value">{currentQuestion.category} - ${currentQuestion.value}</div>
                <div className="question-reveal-area">
                    <div className={`stage-curtains left ${curtainsOpen ? 'open' : ''}`}></div>
                    <div className={`stage-curtains right ${curtainsOpen ? 'open' : ''}`}></div>
                    <div className={`question-text-display ${curtainsOpen ? 'visible' : ''}`}>{currentQuestion.question}</div>
                </div>
                <div className="options-container">
                    {currentQuestion.options.map((opt, i) => {
                        let btnClass = 'option-btn visible';
                        if (answerRevealed) {
                            if (i === currentQuestion.answer) btnClass += ' correct-answer-reveal';
                            else if (i === selectedAnswer) btnClass += ' selected-wrong';
                        }
                        return (
                            <button key={i} className={btnClass} onClick={() => !answerRevealed && handleAnswer(i)} disabled={answerRevealed}>
                                <i className={`far fa-${answerRevealed && i === currentQuestion.answer ? 'check' : 'circle'}`}></i> {opt}
                            </button>
                        );
                    })}
                </div>
                {answerRevealed && <button className="btn-primary" id="continue-game-btn" onClick={() => handleAnswer(null, true)}><i className="fas fa-arrow-right"></i> Continue</button>}
            </div>
        </div>
    );
};

const GameOverComponent = ({ teams, handleNewGame }) => {
    const router = useRouter();
    const { winnerMessage, winnerNames } = useMemo(() => {
        if (!teams || teams.length === 0) return { winnerMessage: "Game Over", winnerNames: [] };
        const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
        const highScore = sortedTeams[0].score;
        const winners = sortedTeams.filter(team => team.score === highScore);
        if (winners.length === 1) return { winnerMessage: `${winners[0].name} Wins!`, winnerNames: [winners[0].name] };
        return { winnerMessage: "It's a Tie!", winnerNames: winners.map(w => w.name) };
    }, [teams]);

    return (
        <div id="final-results-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
            <h1>Final Results</h1>
            <div className="win-message">{winnerMessage}</div>
            {winnerNames.length > 0 && <div className="winner-trophy">🏆</div>}
            <div className="team-display" style={{ marginBottom: '30px' }}>
                {[...teams].sort((a, b) => b.score - a.score).map(team => (
                    <div key={team.name} className={`team-card ${winnerNames.includes(team.name) ? 'active' : ''}`}>
                        <div className="team-name">{team.name}</div>
                        <div className="team-score">${team.score}</div>
                    </div>
                ))}
            </div>
            <div className="game-over-buttons-container">
                <button id="play-again-btn" className="btn-success" onClick={handleNewGame}><i className="fas fa-redo"></i> Play Again</button>
                <button id="visit-store-btn" className="btn-info" onClick={() => router.push('/store')}><i className="fas fa-store"></i> Visit Store</button>
            </div>
        </div>
    );
};

// ==================================================================
//  MAIN PAGE COMPONENT 
// ==================================================================
export default function PointPursuitPage() {
    const [playMode, setPlayMode] = useState(null); // 'local' or 'online'
    const [screen, setScreen] = useState(GameScreen.START);

    // Local Play State
    const [teams, setTeams] = useState([{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [usedQuestions, setUsedQuestions] = useState([]);
    const [availableQuestions, setAvailableQuestions] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answerRevealed, setAnswerRevealed] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    // Online Play State
    const [user, setUser] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [gameState, setGameState] = useState(null);

    // Shared State (Audio, Modals, etc.)
    const [isAudioConsentModalOpen, setAudioConsentModalOpen] = useState(true);
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [sfxEnabled, setSfxEnabled] = useState(true);
    const [musicVolume, setMusicVolume] = useState(0.2);
    const [audioContextStarted, setAudioContextStarted] = useState(false);

    const backgroundMusicRef = useRef(null);
    const sfxRefs = { start: useRef(null), interaction: useRef(null), correct: useRef(null), wrong: useRef(null), curtain: useRef(null), select: useRef(null) };

    useEffect(() => {
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        window.addEventListener('resize', setAppHeight); setAppHeight();
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    useEffect(() => {
        // When the game page loads, add the class to the body
        document.body.classList.add('game-page-active');

        // This is the cleanup function. It runs when the component unmounts.
        return () => {
            // When leaving the game page, remove the class
            document.body.classList.remove('game-page-active');
        };
    }, []);
    
    // Audio setup and persistence
    useEffect(() => {
        const savedVol = localStorage.getItem('musicVolume');
        const savedSfx = localStorage.getItem('sfxEnabled');
        if (savedVol !== null) setMusicVolume(parseFloat(savedVol));
        if (savedSfx !== null) setSfxEnabled(savedSfx === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('musicVolume', musicVolume);
        if (backgroundMusicRef.current) backgroundMusicRef.current.volume = musicVolume;
    }, [musicVolume]);

    useEffect(() => { localStorage.setItem('sfxEnabled', String(sfxEnabled)); }, [sfxEnabled]);

    const initAudio = () => {
        if (audioContextStarted) return;
        setAudioContextStarted(true);
        if (musicVolume > 0) backgroundMusicRef.current?.play().catch(e => console.error("Audio play failed", e));
    };
    const playSound = (soundRef) => {
        if (sfxEnabled && soundRef.current && audioContextStarted) {
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(e => {});
        }
    };

    // --- LOCAL PLAY LOGIC ---
    const handleBeginGame = () => {
        playSound(sfxRefs.start);
        const finalTeams = teams.map((team, i) => ({ ...team, name: team.name.trim() || `Team ${i + 1}` }));
        setTeams(finalTeams);
        setUsedQuestions([]);
        setCurrentTeamIndex(0);
        setAvailableQuestions(JSON.parse(JSON.stringify(questionsDatabase)));
        setScreen(GameScreen.GAME);
    };

    const handleSelectQuestion = (category, value) => {
        playSound(sfxRefs.select);
        const questions = availableQuestions[category]?.[value];
        if (!questions || questions.length === 0) return;
        
        const qIndex = Math.floor(Math.random() * questions.length);
        const questionData = questions.splice(qIndex, 1)[0];
        
        setCurrentQuestion({ ...questionData, category, value });
        setAvailableQuestions({...availableQuestions}); // Force update
        setUsedQuestions([...usedQuestions, `${category}-${value}`]);
        setAnswerRevealed(false);
        setSelectedAnswer(null);
        setScreen(GameScreen.QUESTION);
    };

    const handleAnswer = (selectedIndex, isContinue = false) => {
        if (isContinue) {
            playSound(sfxRefs.interaction);
            if (usedQuestions.length >= categories.length * values.length) {
                setScreen(GameScreen.RESULTS);
            } else {
                setCurrentTeamIndex((currentTeamIndex + 1) % teams.length);
                setScreen(GameScreen.GAME);
            }
            return;
        }

        const isCorrect = selectedIndex === currentQuestion.answer;
        const pointValue = currentQuestion.value;
        const scoreChange = isCorrect ? pointValue : -Math.floor(pointValue / 2);
        
        playSound(isCorrect ? sfxRefs.correct : sfxRefs.wrong);
        
        const newTeams = [...teams];
        newTeams[currentTeamIndex].score += scoreChange;
        setTeams(newTeams);
        
        setSelectedAnswer(selectedIndex);
        setAnswerRevealed(true);
    };

    const handleNewGame = () => {
        playSound(sfxRefs.interaction);
        setTeams([{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }]);
        setScreen(GameScreen.START);
    };

    // --- ONLINE PLAY LOGIC ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (playMode !== 'online' || !gameId || !user) {
            setGameState(null);
            return;
        }
        const gameRef = ref(db, `game_sessions/${gameId}`);
        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setGameState(data);
            else { setGameState(null); setGameId(null); }
        });
        const playerRef = ref(db, `game_sessions/${gameId}/players/${user.uid}`);
        onDisconnect(playerRef).remove();
        return () => unsubscribe();
    }, [playMode, gameId, user]);
    
    const createGame = async (playerName) => {
        if (!user) return;
        const newGameId = Math.random().toString(36).substring(2, 7).toUpperCase();
        const gameRef = ref(db, `game_sessions/${newGameId}`);
        const initialGameState = {
            gameType: 'pointPursuit',
            hostId: user.uid,
            status: 'lobby',
            createdAt: serverTimestamp(),
            players: { [user.uid]: { name: playerName.trim(), uid: user.uid, score: 0 } }
        };
        await set(gameRef, initialGameState);
        setGameId(newGameId);
    };

    const joinGame = (idToJoin, playerName) => {
        if (!user) return;
        const gameRef = ref(db, `game_sessions/${idToJoin}`);
        onValue(gameRef, async (snapshot) => {
            if (snapshot.exists() && snapshot.val().status === 'lobby') {
                const playerRef = ref(db, `game_sessions/${idToJoin}/players/${user.uid}`);
                await set(playerRef, { name: playerName, score: 0, uid: user.uid });
                setGameId(idToJoin);
            } else {
                // Show error toast
            }
        }, { onlyOnce: true });
    };
    
    const leaveGame = () => {
        if (!user || !gameId || !gameState) return;
        if (gameState.hostId === user.uid) remove(ref(db, `game_sessions/${gameId}`));
        else remove(ref(db, `game_sessions/${gameId}/players/${user.uid}`));
        setGameId(null); setGameState(null);
    };

    const startGame = () => {
        if (!gameState || gameState.hostId !== user.uid) return;
        playSound(sfxRefs.start);
        
        const playerIds = Object.keys(gameState.players);
        const updates = {
            status: 'in-game',
            currentTeamIndex: 0,
            usedQuestions: [],
            currentQuestion: null,
            // Reset all player scores
            ...playerIds.reduce((acc, uid) => {
                acc[`/players/${uid}/score`] = 0;
                return acc;
            }, {})
        };
        update(ref(db, `game_sessions/${gameId}`), updates);
    };

    const goBackToModeSelect = () => {
        if (gameId) leaveGame();
        handleNewGame();
        setPlayMode(null);
    }
    
    // --- RENDER LOGIC ---
    const localGameProps = { teams, setTeams, handleBeginGame, playSound, sfxRefs, screen, setScreen, currentTeamIndex, usedQuestions, handleSelectQuestion, currentQuestion, handleAnswer, answerRevealed, selectedAnswer, handleNewGame };
    const onlineGameProps = { user, gameId, gameState, db, playSound, sfxRefs, questionsDatabase, categories, values };

    return (
        <>
            <Head>
                <title>Point Pursuit - Blyza Game Center</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </Head>

            <div className="point-pursuit-page-wrapper">
                
                <div className="hero-background-elements">
                    <div className="bg-game-element bg-trophy-1"><i className="fas fa-trophy"></i></div>
                    <div className="bg-game-element bg-lightbulb-1"><i className="fas fa-lightbulb"></i></div>
                    <div className="bg-game-element bg-book-1"><i className="fas fa-book-open"></i></div>
                    <div className="bg-game-element bg-grad-cap-1"><i className="fas fa-graduation-cap"></i></div>
                    <div className="bg-game-element bg-trophy-2"><i className="fas fa-trophy"></i></div>
                    <div className="bg-game-element bg-lightbulb-2"><i className="fas fa-lightbulb"></i></div>
                </div>

                <div className="game-container">
                    
                    {playMode && (
                        <>
                            <button id="back-btn" className="icon-btn" onClick={playMode === 'local' ? handleNewGame : goBackToModeSelect} style={{ display: (screen === 'start' && playMode === 'local') ? 'none' : 'flex', zIndex: 1001 }}><i className="fas fa-arrow-left"></i></button>
                            <button id="settings-btn" className="icon-btn" onClick={() => setSettingsModalOpen(true)} style={{ zIndex: 1001 }}><i className="fas fa-cog"></i></button>
                        </>
                    )}

                    {playMode === 'local' && (
                        <>
                        {
                            {
                                [GameScreen.START]: <StartScreenComponent {...localGameProps} />,
                                [GameScreen.TEAM_SETUP]: <TeamSetupComponent {...localGameProps} />,
                                [GameScreen.GAME]: <LocalGameComponent {...localGameProps} />,
                                [GameScreen.QUESTION]: <LocalQuestionComponent {...localGameProps} />,
                                [GameScreen.RESULTS]: <GameOverComponent {...localGameProps} />,
                            }[screen]
                        }
                        </>
                    )} 
                    
                    {playMode === 'online' && (
                        <>
                        {
                            !user ? <div className="loading-screen">Connecting...</div>
                            : !gameId ? <MultiplayerStartScreen {...{user, createGame, joinGame}} />
                            : !gameState ? <div className="loading-screen">Joining Game...</div>
                            : {
                                'lobby': <LobbyScreen {...{...onlineGameProps, leaveGame, startGame}} />,
                                'in-game': <OnlineGameScreen {...onlineGameProps} />,
                                'question': <OnlineGameScreen {...onlineGameProps} />,
                                'game-over': <OnlineResultsScreen {...onlineGameProps} handleNewGame={leaveGame} />,
                            }[gameState.status] || <div>Error: Unknown game state.</div>
                        }
                        </>
                    )}
                    
                    {!playMode && (
                        <div id="mode-selection-screen" className="screen active">
                            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
                            <h1>Point Pursuit</h1>
                            <p className="instructions" style={{border:'none', padding: '10px'}}>Choose how you want to play.</p>
                            <div className="game-mode-selection" style={{gridTemplateColumns: '1fr 1fr', display:'grid', gap: '15px'}}>
                                <div className="mode-option" style={{padding:'20px', border: '3px solid black', borderRadius: '12px', cursor:'pointer'}} onClick={() => { playSound(sfxRefs.interaction); setPlayMode('local'); initAudio(); }}>
                                    <i className="fas fa-couch" style={{fontSize: '2rem'}}></i>
                                    <h3>Local Play</h3>
                                    <p>Play with friends on the same device.</p>
                                </div>
                                <div className="mode-option" style={{padding:'20px', border: '3px solid black', borderRadius: '12px', cursor:'pointer'}} onClick={() => { 
                                    playSound(sfxRefs.interaction);
                                    initAudio();
                                    signInAnonymously(auth).catch(e => console.error(e));
                                    setPlayMode('online');
                                }}>
                                    <i className="fas fa-globe" style={{fontSize: '2rem'}}></i>
                                    <h3>Online Multiplayer</h3>
                                    <p>Play with friends on different devices.</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* --- Modals and Audio Elements --- */}
            {isAudioConsentModalOpen && <div className="modal" style={{display: 'flex'}}><div className="modal-content"><h2>Enable Audio?</h2><p>This game has sounds. Would you like to enable them?</p><div id="audio-consent-buttons"><button onClick={() => { setAudioConsentModalOpen(false); initAudio(); }} className="btn-success">Yes!</button><button onClick={() => { setSfxEnabled(false); setMusicVolume(0); setAudioConsentModalOpen(false); }} className="btn-secondary">No, thanks</button></div></div></div>}
            {isSettingsModalOpen && <div className="modal" style={{display: 'flex'}}><div className="modal-content"><span className="close-modal-btn" onClick={() => setSettingsModalOpen(false)}>×</span><h2>Settings</h2>...</div></div>}
            <audio ref={backgroundMusicRef} loop src="https://static.wixstatic.com/mp3/9ce3e5_380adfaea802407b9a4cebc67f12a216.mp3"></audio>
            <audio ref={sfxRefs.start} src="https://static.wixstatic.com/mp3/9ce3e5_1b9151238aec4e29ab14f1526e9c1334.mp3"></audio>
            <audio ref={sfxRefs.interaction} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav"></audio>
            <audio ref={sfxRefs.select} src="https://static.wixstatic.com/mp3/9ce3e5_fc326aa1760c485dbac083ec55c2bfcb.wav"></audio>
            <audio ref={sfxRefs.correct} src="https://static.wixstatic.com/mp3/9ce3e5_76691a6fefcd4536aa403ada111e886a.mp3"></audio>
            <audio ref={sfxRefs.wrong} src="https://static.wixstatic.com/mp3/9ce3e5_277f814439064d1bbe5c0342241b23e4.mp3"></audio>
            <audio ref={sfxRefs.curtain} src="https://static.wixstatic.com/mp3/9ce3e5_ccd36cdf98bf4e1594cf2e52d5296c51.wav"></audio>
            <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        </>
    );
}