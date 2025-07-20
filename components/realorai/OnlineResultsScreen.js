// In components/realorai/OnlineResultsScreen.js

import React, { useEffect, useRef } from 'react';
import { ref, update } from 'firebase/database';

export default function OnlineResultsScreen({ user, gameId, gameState, mediaItems, db, playSound, sfxRefs }) {
    const isHost = gameState.hostId === user.uid;
    const currentMedia = mediaItems[gameState.currentItemIndex];
    const roundData = gameState.rounds[gameState.currentRound];

    const MAX_ROUNDS = 5;
    const isGameOver = gameState.currentRound >= MAX_ROUNDS;

    const videoRef = useRef(null);
    useEffect(() => {
        if (currentMedia?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => {});
        }
    }, [currentMedia]);

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
                {currentMedia.type === 'image' ? (
                    <img src={currentMedia.url} alt={currentMedia.description} className="media-content visible" />
                ) : (
                    <video ref={videoRef} src={currentMedia.url} controls muted loop playsInline className="media-content visible"></video>
                )}
                <div className={`answer-display ${currentMedia.isAI ? 'answer-ai' : 'answer-real'}`}>
                    <i className={`fas ${currentMedia.isAI ? 'fa-robot' : 'fa-check-circle'}`}></i>
                    {currentMedia.isAI ? "AI-Generated!" : "Real!"}
                </div>
            </div>

            <div className="score-display">
                {Object.entries(gameState.players).map(([uid, player]) => {
                    const isCorrect = 
                        (roundData.guesses[uid] === 'ai' && currentMedia.isAI) || 
                        (roundData.guesses[uid] === 'real' && !currentMedia.isAI);
                    
                    return (
                        <div key={uid} className={`score-card ${isCorrect ? 'winner-glow' : ''}`}>
                            <h4>{player.name}</h4>
                            <div className="score-value">{player.score || 0}</div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${((player.score || 0) / MAX_ROUNDS) * 100}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isHost && (
                <button id="next-round-btn" className="btn-primary" onClick={nextRound}>
                    {isGameOver ? 'See Final Results' : 'Next Round'} 
                    <i className={`fas ${isGameOver ? 'fa-trophy' : 'fa-arrow-right'}`}></i>
                </button>
            )}
        </div>
    );
}