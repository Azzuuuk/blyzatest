// In components/pointpursuit/OnlineGameScreen.js
import { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';

// --- Reusable Question Component for Online Play ---
const OnlineQuestionDisplay = ({ gameState, user, gameId, db, playSound, sfxRefs }) => {
    const [curtainsOpen, setCurtainsOpen] = useState(false);
    const [answerRevealed, setAnswerRevealed] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const { currentQuestion, currentTeamIndex } = gameState;
    const players = Object.values(gameState.players);
    const playerWhoseTurn = players[currentTeamIndex];

    useEffect(() => {
        setCurtainsOpen(false);
        setAnswerRevealed(false);
        setSelectedAnswer(null);
        setTimeout(() => {
            playSound(sfxRefs.curtain);
            setCurtainsOpen(true);
        }, 300);
    }, [currentQuestion.question]);

    const handleAnswer = (selectedIndex) => {
        if (answerRevealed || user.uid !== playerWhoseTurn.uid) return;

        playSound(sfxRefs.interaction);
        const isCorrect = selectedIndex === currentQuestion.answer;
        const pointValue = currentQuestion.value;
        const scoreChange = isCorrect ? pointValue : -Math.floor(pointValue / 2);
        
        playSound(isCorrect ? sfxRefs.correct : sfxRefs.wrong);
        
        const newScore = playerWhoseTurn.score + scoreChange;
        
        setSelectedAnswer(selectedIndex);
        setAnswerRevealed(true);

        // Host updates score and game state after a delay
        setTimeout(() => {
            const nextTeamIndex = (currentTeamIndex + 1) % players.length;
            const isGameOver = (gameState.usedQuestions?.length || 0) >= 25;

            const updates = {
                [`/players/${playerWhoseTurn.uid}/score`]: newScore,
                currentQuestion: null, // Clear the question
                currentTeamIndex: nextTeamIndex,
                status: isGameOver ? 'game-over' : 'in-game'
            };
            update(ref(db, `game_sessions/${gameId}`), updates);
        }, 2500); // Wait 2.5 seconds before moving on
    };

    return (
        <div id="question-screen" className="screen active">
            <div className="team-display">
                <div className="team-card active">
                    <div className="team-name">{playerWhoseTurn?.name}'s Turn</div>
                    <div className="team-score">${playerWhoseTurn?.score}</div>
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
                            <button key={i} className={btnClass} onClick={() => handleAnswer(i)} disabled={answerRevealed || user.uid !== playerWhoseTurn.uid}>
                                <i className={`far fa-circle`}></i> {opt}
                            </button>
                        );
                    })}
                </div>
                {user.uid !== playerWhoseTurn.uid && !answerRevealed && <p>Waiting for {playerWhoseTurn.name} to answer...</p>}
            </div>
        </div>
    );
};


// --- Main Online Game Screen Component ---
export default function OnlineGameScreen({ user, gameId, gameState, db, playSound, sfxRefs, questionsDatabase, categories, values }) {
    
    // If there's a question, show the question screen
    if (gameState.currentQuestion) {
        return <OnlineQuestionDisplay {...{ user, gameId, gameState, db, playSound, sfxRefs }} />;
    }

    // Otherwise, show the game board
    const { currentTeamIndex } = gameState;
    const players = Object.values(gameState.players);
    const playerWhoseTurn = players[currentTeamIndex];
    const isMyTurn = user.uid === playerWhoseTurn?.uid;

    const handleSelectQuestion = (category, value) => {
        if (!isMyTurn) return;

        playSound(sfxRefs.select);
        
        // Host needs to find a question and update state
        const questionsForCell = questionsDatabase[category]?.[value] || [];
        const availableQuestions = questionsForCell.filter((_, index) => 
            !(gameState.usedQuestions || []).includes(`${category}-${value}-${index}`)
        );

        if (availableQuestions.length === 0) {
            // This cell is empty, mark as used
            const newUsed = [...(gameState.usedQuestions || []), `${category}-${value}-NA`];
            update(ref(db, `game_sessions/${gameId}`), { usedQuestions: newUsed });
            return;
        }

        const qIndex = Math.floor(Math.random() * availableQuestions.length);
        const chosenQuestion = availableQuestions[qIndex];
        const originalIndex = questionsDatabase[category][value].indexOf(chosenQuestion);

        const newUsedQuestions = [...(gameState.usedQuestions || []), `${category}-${value}-${originalIndex}`];
        
        const updates = {
            currentQuestion: { ...chosenQuestion, category, value },
            usedQuestions: newUsedQuestions,
            status: 'question'
        };
        update(ref(db, `game_sessions/${gameId}`), updates);
    };

    return (
        <div id="game-screen" className="screen active">
            <h1>Point Pursuit</h1>
            <div className="team-display">
                {players.map((player, index) => (
                    <div key={player.uid} className={`team-card ${index === currentTeamIndex ? 'active' : ''}`}>
                        <div className="team-name">{player.name}</div>
                        <div className="team-score">${player.score}</div>
                    </div>
                ))}
            </div>
            <div className="game-board">
                {categories.map(cat => <div key={cat} className="category-header">{cat}</div>)}
                {values.map(val => categories.map(cat => {
                    const isUsed = (gameState.usedQuestions || []).some(q => q.startsWith(`${cat}-${val}`));
                    return (
                        <div key={`${cat}-${val}`} 
                             className={`value-cell ${isUsed ? 'used' : ''} ${isMyTurn && !isUsed ? 'my-turn-glow' : ''}`} 
                             onClick={() => !isUsed && handleSelectQuestion(cat, val)}>
                            ${val}
                        </div>
                    );
                }))}
            </div>
             {!isMyTurn && <p style={{marginTop:'15px'}}>Waiting for {playerWhoseTurn?.name}'s turn...</p>}
             {isMyTurn && <p style={{marginTop:'15px', color:'var(--blyza-orange-primary)', fontFamily:'var(--font-heading-alt)'}}>It's your turn! Pick a question.</p>}
        </div>
    );
}