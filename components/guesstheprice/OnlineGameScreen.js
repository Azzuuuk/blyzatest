import { useState, useEffect } from 'react';
import { ref, update, set } from 'firebase/database';

export default function OnlineGameScreen({ user, gameId, gameState, itemsData, db, playSound, sfxRefs, showToast }) {
    const [guess, setGuess] = useState('');
    const [curtainsOpen, setCurtainsOpen] = useState(false);
    const currentItem = itemsData[gameState.currentItemIndex];
    const roundData = gameState.rounds?.[gameState.currentRound];
    const hasGuessed = roundData?.guesses?.[user.uid] !== undefined;
    const allPlayersGuessed = Object.keys(gameState.players).length === Object.keys(roundData?.guesses || {}).length;
    const isHost = gameState.hostId === user.uid;

    useEffect(() => {
        setGuess('');
        setCurtainsOpen(false);
        setTimeout(() => {
            playSound(sfxRefs.curtain);
            setCurtainsOpen(true);
        }, 500);
    }, [gameState.currentRound]);

    const submitGuess = () => {
        if (guess === '' || hasGuessed) return;
        playSound(sfxRefs.interaction);
        const guessRef = ref(db, `game_sessions/${gameId}/rounds/${gameState.currentRound}/guesses/${user.uid}`);
        set(guessRef, parseFloat(guess));
    };

    const handleRevealPrice = () => {
        if (!isHost || !allPlayersGuessed) return;
        playSound(sfxRefs.start);
        const actualPrice = currentItem.price;
        const guesses = roundData.guesses;
        let smallestDiff = Infinity;
        let winnerId = null;
        Object.entries(guesses).forEach(([uid, playerGuess]) => {
            const diff = Math.abs(playerGuess - actualPrice);
            if (diff < smallestDiff) { smallestDiff = diff; winnerId = uid; } 
            else if (diff === smallestDiff) { winnerId = null; }
        });
        const updates = {};
        updates[`/status`] = 'results';
        updates[`/rounds/${gameState.currentRound}/results`] = { winnerId, actualPrice };
        if (winnerId) {
            const newScore = (gameState.players[winnerId].score || 0) + 1;
            updates[`/players/${winnerId}/score`] = newScore;
            showToast(`${gameState.players[winnerId].name} won the round!`, 'correct');
            playSound(sfxRefs.correct);
        } else {
            showToast('A tie! No points awarded.', 'wrong');
            playSound(sfxRefs.wrong);
        }
        update(ref(db, `game_sessions/${gameId}`), updates);
    };

    return (
        <div id="game-screen" className="screen active">
            <div className="game-info">
                <div>Round <span>{gameState.currentRound}</span></div>
                <div>Players Guessed: <span>{Object.keys(roundData?.guesses || {}).length} / {Object.keys(gameState.players).length}</span></div>
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
            <div className="guess-input-group" style={{maxWidth: '400px', margin: '20px auto'}}>
                <div className="guess-label">Your guess:</div>
                <div className="guess-input-container">
                    <div className="dollar-sign">$</div>
                    <input type="number" className="price-input" placeholder="0.00" min="0" step="0.01" value={guess} onChange={e => setGuess(e.target.value)} disabled={hasGuessed} />
                </div>
                <button onClick={submitGuess} disabled={hasGuessed} style={{marginTop: '10px', width: '100%'}}>
                    {hasGuessed ? 'Guess Locked In!' : 'Submit Guess'}
                </button>
            </div>
            {isHost && (
                <button id="reveal-price-btn" onClick={handleRevealPrice} disabled={!allPlayersGuessed}>Reveal Price <i className="fas fa-eye"></i></button>
            )}
            {!isHost && !allPlayersGuessed && <p>Waiting for all players to guess...</p>}
            {!isHost && allPlayersGuessed && <p>All guesses are in! Waiting for the host to reveal the price...</p>}
        </div>
    );
}