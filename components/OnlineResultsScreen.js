import React from 'react';
import { ref, update } from 'firebase/database';

export default function OnlineResultsScreen({ user, gameId, gameState, itemsData, db, playSound, sfxRefs, showToast }) {
    const isHost = gameState.hostId === user.uid;
    const currentItem = itemsData[gameState.currentItemIndex];
    const roundData = gameState.rounds[gameState.currentRound];
    const results = roundData.results;
    const winnerId = results.winnerId;

    const maxRounds = 5; // Set your desired round limit
    const isGameOver = gameState.currentRound >= maxRounds || Object.values(gameState.players).some(p => p.score >= 5);

    const nextRound = () => {
        if (!isHost) return;
        playSound(sfxRefs.interaction);

        if (isGameOver) {
            update(ref(db, `games/${gameId}`), { status: 'game-over' });
            return;
        }

        const usedIndexes = gameState.usedItemIndexes || [];
        let availableItems = itemsData.map((_, i) => i).filter(i => !usedIndexes.includes(i));
        if (availableItems.length === 0) availableItems = itemsData.map((_,i) => i); // Reset if all used
        
        const nextItemIndex = availableItems[Math.floor(Math.random() * availableItems.length)];
        
        update(ref(db, `games/${gameId}`), {
            status: 'in-game',
            currentRound: gameState.currentRound + 1,
            currentItemIndex: nextItemIndex,
            usedItemIndexes: [...usedIndexes, nextItemIndex]
        });
    };

    return (
        <div id="results-screen" className="screen active">
            {currentItem && (
                <div className="result-item">
                    <img src={currentItem.image} alt={currentItem.name} className="item-image" />
                    <div className="price-display">Actual Price: $<span>{results.actualPrice.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2 })}</span></div>
                    <div id="item-description-text">{currentItem.description}</div>
                </div>
            )}
            <div id="guess-results-area" className="score-display">
                {Object.entries(gameState.players).map(([uid, player]) => {
                    const guess = roundData.guesses[uid];
                    const diff = Math.abs(guess - results.actualPrice);
                    return (
                        <div key={uid} className={`guess-result ${winnerId === uid ? 'closest-guess' : ''}`}>
                            <div><b>{player.name} ({player.score} pts)</b></div>
                            <div>Guessed: ${guess?.toLocaleString(undefined, {minimumFractionDigits: 2}) || 'N/A'}</div>
                            <div className="difference-display">Difference: ${diff.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                            {winnerId === uid && <div className="winner-badge">Winner! +1 Point</div>}
                        </div>
                    );
                })}
            </div>
            {isHost && (
                <button id="next-round-btn" onClick={nextRound}>
                    {isGameOver ? 'Show Final Results' : 'Next Round'} <i className="fas fa-arrow-right"></i>
                </button>
            )}
             {!isHost && <p>Waiting for the host to continue...</p>}
        </div>
    );
}