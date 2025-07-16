// In components/LobbyScreen.js

import React from 'react';

// Notice we no longer need to import `ref` or `update` from firebase
// We also removed `db`, `itemsData` from the props

export default function LobbyScreen({ user, gameId, gameState, leaveGame, startGame, playSound, sfxRefs }) {
    const isHost = gameState.hostId === user.uid;
    const players = Object.entries(gameState.players);

    const handleStartClick = () => {
        // The component's only job is to call the function passed from the parent
        startGame(); 
    }

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
                {isHost && <button id="start-game-btn" onClick={handleStartClick} disabled={players.length < 2}><i className="fas fa-play"></i> Start Game</button>}
                {!isHost && <p>Waiting for the host to start the game...</p>}
                <button id="new-game-btn" className="btn-secondary" onClick={leaveGame}><i className="fas fa-door-open"></i> Leave Lobby</button>
            </div>
            {isHost && players.length < 2 && <p style={{marginTop: '15px', color: 'var(--text-medium)'}}>Need at least 2 players to start.</p>}
        </div>
    );
}