// components/findtheimposter/OnlineRoleScreen.js
import { useEffect } from 'react';
import { ref, update, set } from 'firebase/database';

export default function OnlineRoleScreen({ user, gameId, gameState, db, playSound, sfxRefs }) {
    const gameData = gameState.gameData || {};
    const {
        turnOrder = [],
        currentPlayerTurnIndex = 0,
        imposterUid,
        question,
        cardFlipped = false
    } = gameData;
    
    const { players, hostId } = gameState;
    const isHost = user.uid === hostId;
    const currentPlayerUid = turnOrder[currentPlayerTurnIndex];
    const isMyTurn = user.uid === currentPlayerUid;
    const isImposter = user.uid === imposterUid;

    // Handle sound effects for card flip
    useEffect(() => {
        if (cardFlipped && isMyTurn) {
            playSound(sfxRefs.flip);
        }
    }, [cardFlipped, isMyTurn, playSound, sfxRefs]);

    const handleCardFlip = async () => {
        if (!isMyTurn || cardFlipped) return;
        try {
            await set(ref(db, `game_sessions/${gameId}/gameData/cardFlipped`), true);
            playSound(sfxRefs.flip);
        } catch (error) {
            console.error("Failed to flip card:", error);
        }
    };

    const handleNextPlayer = async () => {
        if (!isMyTurn || !cardFlipped) return;
        try {
            await set(ref(db, `game_sessions/${gameId}/gameData/seenRole/${user.uid}`), true);
            await set(ref(db, `game_sessions/${gameId}/gameData/cardFlipped`), false);

            if (currentPlayerTurnIndex < turnOrder.length - 1) {
                await set(ref(db, `game_sessions/${gameId}/gameData/currentPlayerTurnIndex`), currentPlayerTurnIndex + 1);
            } else if (isHost) {
                await set(ref(db, `game_sessions/${gameId}/status`), "discussion");
            }
        } catch (error) {
            console.error("Failed to progress turn:", error);
        }
    };

    if (!gameData || typeof currentPlayerTurnIndex === 'undefined') {
        return <div className="screen active"><h1>Preparing roles...</h1></div>;
    }

    if (currentPlayerTurnIndex >= turnOrder.length) {
        return <div className="screen active"><h1>All Roles Assigned!</h1><p>Moving to discussion...</p></div>;
    }

    if (!isMyTurn) {
        const currentPlayerName = players[currentPlayerUid]?.name || '...';
        return (
            <div className="screen active">
                <h1>Assigning Roles</h1>
                <p>Waiting for <strong>{currentPlayerName}</strong>...</p>
            </div>
        );
    }

    return (
        <div id="role-screen" className="screen active">
            <h1>It's Your Turn, {players[user.uid].name}!</h1>
            <p className="info-text">Click the card below to reveal your role. Keep it secret!</p>
            <div className={`role-card ${cardFlipped ? 'flipped' : ''}`} onClick={handleCardFlip}>
                <div className="role-card-inner">
                    <div className="role-card-front">
                        <i className="fas fa-eye role-icon"></i>
                        <p>Click to Reveal</p>
                    </div>
                    <div className="role-card-back">
                        <h3 className={isImposter ? 'role-imposter' : 'role-crewmate'}>
                            {isImposter ? 'IMPOSTER' : 'CREWMATE'}
                        </h3>
                        <p>{isImposter ? question.imposter : question.crew}</p>
                    </div>
                </div>
            </div>
            <button 
                className="btn-primary" 
                onClick={handleNextPlayer} 
                disabled={!cardFlipped}>
                {currentPlayerTurnIndex === turnOrder.length - 1 ? 'Start Discussion' : 'Next Player'} 
                <i className="fas fa-arrow-right"></i>
            </button>
        </div>
    );
}