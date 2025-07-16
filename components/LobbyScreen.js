import React from 'react';
import { ref, update } from 'firebase/database';

export default function LobbyScreen({ user, gameId, gameState, leaveGame, db, playSound, sfxRefs, itemsData }) {
    const isHost = gameState.hostId === user.uid;
    const players = Object.entries(gameState.players);

    const startGame = () => {
        if (!isHost) return;
        playSound(sfxRefs.start);
        const firstItemIndex = Math.floor(Math.random() * itemsData.length);
        const updates = {
            status: 'in-game',
            currentRound: 1,
            currentItemIndex: firstItemIndex,
            usedItemIndexes: [firstItemIndex],
            ...players.reduce((acc, [uid]) => {
                acc[`/players/${uid}/score`] = 0;
                return acc;
            }, {})
        };
        update(ref(db, `games/${gameId}`), updates);
    };

    return (
        <div className="screen active">
            <h1>Game Lobby</h1>
            <div className="instructions" style={{textAlign: 'center', padding: '15px'}}>
                <p>Game Code: <strong style={{color: 'var(--blyza-orange-primary)', fontSize: '1.5em', letterSpacing: '3px'}}>{gameId}</strong></p>
                <p>Share this code with your friends to have them join!</p>
            </div>
            <h3>Players in Lobby ({players.length}/8):</h3>
            <div className="score-display">
                {players.map(([uid, player]) => (
                    <div className="score-card" key={uid}>
                        <h4>{player.name} {gameState.hostId === uid ? '👑 (Host)' : ''}</h4>
                    </div>
                ))}
            </div>
            <div className="game-over-buttons-container">
                {isHost && <button id="start-game-btn" onClick={startGame} disabled={players.length < 2}><i className="fas fa-play"></i> Start Game</button>}
                {!isHost && <p>Waiting for the host to start the game...</p>}
                <button id="new-game-btn" className="btn-secondary" onClick={leaveGame}><i className="fas fa-door-open"></i> Leave Lobby</button>
            </div>
            {isHost && players.length < 2 && <p style={{marginTop: '15px', color: 'var(--text-medium)'}}>Need at least 2 players to start.</p>}
        </div>
    );
}