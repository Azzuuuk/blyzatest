// components/findtheimposter/OnlineStartScreen.js
import { useState } from 'react';

export default function OnlineStartScreen({ createGame, joinGame }) {
    const [playerName, setPlayerName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const isReadyToCreate = playerName.trim() !== '';
    const isReadyToJoin = playerName.trim() !== '' && joinCode.trim().length === 5;

    return (
        <div id="start-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
            <h1>Online Multiplayer</h1>
            <div className="instructions">Enter your name, then create a game or join one with a code.</div>
            <div id="multiplayer-start-area">
                <div className="player-input-wrapper" style={{ maxWidth: '400px', margin: '0 auto 15px auto' }}>
                    <input type="text" className="player-name-input" placeholder="Enter Your Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} maxLength="15" />
                </div>
                <button onClick={() => createGame(playerName.trim())} className="btn-primary" disabled={!isReadyToCreate}>
                    <i className="fas fa-plus-circle"></i> Create Game
                </button>
                <hr style={{ margin: '20px 0', border: '1px solid #ddd' }} />
                <div className="player-input-wrapper" style={{ maxWidth: '400px', margin: '0 auto 15px auto' }}>
                    <input type="text" className="player-name-input" placeholder="Enter Game Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} maxLength="5" style={{ textTransform: 'uppercase' }} />
                </div>
                <button onClick={() => joinGame(joinCode.trim().toUpperCase(), playerName.trim())} className="btn-secondary" disabled={!isReadyToJoin}>
                    <i className="fas fa-sign-in-alt"></i> Join Game
                </button>
            </div>
        </div>
    );
}