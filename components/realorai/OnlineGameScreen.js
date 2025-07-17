// In components/OnlineGameScreen.js

import { useState, useEffect, useRef } from 'react';
// --- ACTION: 'update' has been added to this import line ---
import { ref, set, update } from 'firebase/database';

export default function OnlineGameScreen({ user, gameId, gameState, mediaItems, db, playSound, sfxRefs, showToast }) {
    const [curtainsOpen, setCurtainsOpen] = useState(false);
    const videoRef = useRef(null);
    
    // --- Core Game State from Firebase ---
    const currentItem = mediaItems[gameState.currentItemIndex];
    const roundData = gameState.rounds?.[gameState.currentRound];
    const hasGuessed = roundData?.guesses?.[user.uid] !== undefined;
    const allPlayersGuessed = Object.keys(gameState.players).length === Object.keys(roundData?.guesses || {}).length;
    const isHost = gameState.hostId === user.uid;

    // --- Effects for managing UI and video playback ---
    useEffect(() => {
        setCurtainsOpen(false); // Reset curtains every round
        setTimeout(() => {
            playSound(sfxRefs.curtain);
            setCurtainsOpen(true);
        }, 500);
    }, [gameState.currentRound, playSound, sfxRefs.curtain]);

    useEffect(() => {
        if (curtainsOpen && currentItem?.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => console.error("Video autoplay prevented.", e));
        }
    }, [curtainsOpen, currentItem]);

    // --- Player Actions ---
    const submitChoice = (choice) => {
        if (hasGuessed) return;
        playSound(sfxRefs.interaction);
        const guessRef = ref(db, `games/${gameId}/rounds/${gameState.currentRound}/guesses/${user.uid}`);
        set(guessRef, choice); // 'real' or 'ai'
    };

    // --- Host Action ---
    const handleRevealResults = () => {
        if (!isHost || !allPlayersGuessed) return;
        
        playSound(sfxRefs.start);
        const correctAnswer = currentItem.isAI; // true or false
        const playerGuesses = roundData.guesses;
        
        const updates = {};
        let correctPlayers = 0;

        // Determine who was correct and update their scores
        Object.entries(playerGuesses).forEach(([uid, choice]) => {
            const wasCorrect = (choice === 'ai' && correctAnswer) || (choice === 'real' && !correctAnswer);
            if (wasCorrect) {
                const newScore = (gameState.players[uid].score || 0) + 1;
                updates[`/players/${uid}/score`] = newScore;
                correctPlayers++;
            }
        });
        
        updates[`/status`] = 'results';
        updates[`/rounds/${gameState.currentRound}/isAI`] = correctAnswer; // Store the correct answer for the results screen

        // This line will now work correctly because `update` is imported.
        update(ref(db, `games/${gameId}`), updates);
        
        // Show a summary toast
        if (correctPlayers === 0) {
            showToast('Ouch! Nobody got it right.', 'wrong');
            playSound(sfxRefs.incorrect);
        } else {
            showToast(`${correctPlayers} player(s) guessed correctly!`, 'correct');
            playSound(sfxRefs.correct);
        }
    };

    return (
        <div id="game-screen" className="screen active">
            <div className="game-info">
                <div>Round <span>{gameState.currentRound}</span></div>
                <div>Guessed: <span>{Object.keys(roundData?.guesses || {}).length} / {Object.keys(gameState.players).length}</span></div>
            </div>
            
            <div className="item-stage-container">
                <div className={`stage-curtains left ${curtainsOpen ? 'open' : ''}`}></div>
                <div className={`stage-curtains right ${curtainsOpen ? 'open' : ''}`}></div>
                <div className="tv-screen-container">
                    <h3>Is this Real or AI?</h3>
                    {currentItem && (
                        <>
                            <div className={`media-description ${curtainsOpen ? 'visible' : ''}`}>{currentItem.description}</div>
                            {currentItem.type === 'image' ? (
                                <img src={currentItem.url} alt={currentItem.description} className={`media-content ${curtainsOpen ? 'visible' : ''}`} />
                            ) : (
                                <video ref={videoRef} src={currentItem.url} controls muted loop playsInline className={`media-content ${curtainsOpen ? 'visible' : ''}`}></video>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="choice-buttons">
                <button onClick={() => submitChoice('real')} className="choice-btn btn-success" disabled={hasGuessed}>
                    {hasGuessed ? 'Locked In' : <><i className="fas fa-check-circle"></i> Real</>}
                </button>
                <button onClick={() => submitChoice('ai')} className="choice-btn btn-danger" disabled={hasGuessed}>
                    {hasGuessed ? 'Locked In' : <><i className="fas fa-robot"></i> AI</>}
                </button>
            </div>
            
             {isHost && (
                <button id="reveal-price-btn" onClick={handleRevealResults} disabled={!allPlayersGuessed} style={{marginTop: '20px'}}>
                    Reveal Results <i className="fas fa-eye"></i>
                </button>
            )}
            {!isHost && !allPlayersGuessed && <p style={{marginTop: '20px'}}>Waiting for all players to guess...</p>}
            {!isHost && allPlayersGuessed && <p style={{marginTop: '20px'}}>All guesses are in! Waiting for the host to reveal the results...</p>}
        </div>
    );
}