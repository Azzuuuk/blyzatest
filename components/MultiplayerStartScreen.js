import { useState } from 'react';

export default function MultiplayerStartScreen({ createGame, joinGame }) {
    const [playerName, setPlayerName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    const handleCreate = () => {
        if (!playerName.trim()) return alert("Please enter your name!");
        createGame(playerName.trim());
    };

    const handleJoin = () => {
        if (!playerName.trim()) return alert("Please enter your name!");
        if (!joinCode.trim()) return alert("Please enter a game code!");
        joinGame(joinCode.trim().toUpperCase(), playerName.trim());
    };

    return (
        <div id="start-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
            <h1>Online Multiplayer</h1>
            <div className="instructions">
                Enter your name, then create a game or join one with a code.
            </div>
            <div id="multiplayer-start-area">
                <div className="team-input-wrapper" style={{maxWidth: '400px', margin: '0 auto 15px auto'}}>
                    <input type="text" className="team-name-input" placeholder="Enter Your Name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} maxLength="15" />
                </div>
                <button onClick={handleCreate} className="btn-primary"><i className="fas fa-plus-circle"></i> Create Game</button>
                <hr style={{margin: '20px 0', border: '1px solid #ddd'}} />
                <div className="team-input-wrapper" style={{maxWidth: '400px', margin: '0 auto 15px auto'}}>
                    <input type="text" className="team-name-input" placeholder="Enter Game Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} maxLength="5" style={{textTransform: 'uppercase'}} />
                </div>
                <button onClick={handleJoin} className="btn-secondary"><i className="fas fa-sign-in-alt"></i> Join Game</button>
            </div>
        </div>
    );
}