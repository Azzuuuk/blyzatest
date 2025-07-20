// In components/pointpursuit/OnlineResultsScreen.js
import React, { useMemo } from 'react';
import { useRouter } from 'next/router';

export default function OnlineResultsScreen({ gameState, handleNewGame }) {
    const router = useRouter();
    const players = Object.values(gameState.players);
    
    const { winnerMessage, winnerNames } = useMemo(() => {
        if (!players || players.length === 0) return { winnerMessage: "Game Over", winnerNames: [] };
        
        const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
        const highScore = sortedPlayers[0].score;
        const winners = sortedPlayers.filter(player => player.score === highScore);

        if (winners.length === 1) {
            return { winnerMessage: `${winners[0].name} Wins!`, winnerNames: [winners[0].name] };
        } else {
            return { winnerMessage: "It's a Tie!", winnerNames: winners.map(w => w.name) };
        }
    }, [players]);

    return (
        <div id="final-results-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
            <h1>Final Results</h1>
            <div className="win-message">{winnerMessage}</div>
            {winnerNames.length > 0 && <div className="winner-trophy">🏆</div>}
            <div className="team-display" style={{ marginBottom: '30px', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                {[...players].sort((a, b) => b.score - a.score).map(player => (
                    <div key={player.uid} className={`team-card ${winnerNames.includes(player.name) ? 'active' : ''}`} style={{width: '80%', maxWidth: '300px'}}>
                        <div className="team-name">{player.name}</div>
                        <div className="team-score">${player.score}</div>
                    </div>
                ))}
            </div>
            <div className="game-over-buttons-container">
                <button id="play-again-btn" className="btn-success" onClick={handleNewGame}><i className="fas fa-door-open"></i> Leave Game</button>
                <button id="visit-store-btn" className="btn-info" onClick={() => router.push('/store')}><i className="fas fa-store"></i> Visit Store</button>
            </div>
        </div>
    );
}