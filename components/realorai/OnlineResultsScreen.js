// In components/realorai/OnlineResultsScreen.js

import React, { useEffect, useRef } from 'react';
import { ref, update } from 'firebase/database';

export default function OnlineResultsScreen({ user, gameId, gameState, mediaItems, db, playSound, sfxRefs }) {
    const isHost = gameState.hostId === user.uid;
    const currentItem = mediaItems[gameState.currentItemIndex];
    const roundData = gameState.rounds[gameState.currentRound];
    const correctAnswer = roundData.isAI;

    const MAX_ROUNDS = 5;
    const isGameOver = gameState.currentRound >= MAX_ROUNDS;

    const videoRef = useRef(null);
    useEffect(() => {
        if (currentItem?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => {});
        }
    }, [currentItem]);

    const nextRound = () => {
        if (!isHost) return;
        playSound(sfxRefs.interaction);

        if (isGameOver) {
            update(ref(db, `game_sessions/${gameId}`), { status: 'game-over' });
            return;
        }

        const usedIndexes = gameState.usedItemIndexes || [];
        let availableItems = mediaItems.map((_, i) => i).filter(i => !usedIndexes.includes(i));
        if (availableItems.length === 0) {
             update(ref(db, `game_sessions/${gameId}`), { status: 'game-over' });
             return;
        }
        
        const nextItemIndex = availableItems[Math.floor(Math.random() * availableItems.length)];
        
        update(ref(db, `game_sessions/${gameId}`), {
            status: 'in-game',
            currentRound: gameState.currentRound + 1,
            currentItemIndex: nextItemIndex,
            usedItemIndexes: [...usedIndexes, nextItemIndex]
        });
    };

    return (
        <div id="results-screen" className="screen active">
            <h1>Round Result</h1>
            <div className="result-item-display">
                {currentItem.type === 'image' ? (
                    <img src={currentItem.url} alt={currentItem.description} className="media-content visible" />
                ) : (
                    <video ref={videoRef} src={currentItem.url} controls muted loop playsInline className="media-content visible"></video>
                )}
                <div className={`answer-display ${correctAnswer ? 'answer-ai' : 'answer-real'}`}>
                    <i className={`fas ${correctAnswer ? 'fa-robot' : 'fa-check-circle'}`}></i>
                    {correctAnswer ? "AI-Generated!" : "This was Real!"}
                </div>
            </div>

            <div className="detailed-feedback-area">
                 {Object.entries(gameState.players).map(([uid, player]) => {
                    const choice = roundData.guesses[uid];
                    const wasCorrect = (choice === 'ai' && correctAnswer) || (choice === 'real' && !correctAnswer);
                    return (
                        <div key={uid} className={`player-feedback-entry ${wasCorrect ? 'correct' : 'incorrect'}`}>
                           <div style={{ flexGrow: 1 }}>
                             <strong>{player.name}</strong> chose: {choice || 'N/A'}.
                           </div>
                           <div style={{ fontWeight: 'bold' }}>
                                Score: {player.score} {wasCorrect ? '(+1)' : ''}
                           </div>
                        </div>
                    );
                })}
            </div>

            {isHost && (
                <button id="next-round-btn" className="btn-primary" onClick={nextRound}>
                    {isGameOver ? 'Show Final Results' : 'Next Round'} <i className="fas fa-arrow-right"></i>
                </button>
            )}
             {!isHost && <p>Waiting for the host to continue...</p>}
        </div>
    );
}