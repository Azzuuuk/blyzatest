import { useState } from 'react';

export default function MultiplayerStartScreen({ user, createGame, joinGame }) {
    const [playerName, setPlayerName] = useState('');
    const [joinCode, setJoinCode] = useState('');

    // This checks if the user is authenticated AND has typed a name
    const isReadyToCreate = user && playerName.trim() !== '';
    // This also checks if they've typed a 5-character join code
    const isReadyToJoin = user && playerName.trim() !== '' && joinCode.trim().length === 5;

    const handleCreate = () => {
        if (!isReadyToCreate) return; // This check is for safety
        createGame(playerName.trim());
    };

    const handleJoin = () => {
        if (!isReadyToJoin) return; // This check is for safety
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
                
                {/* The "disabled" attribute makes the button unclickable until isReadyToCreate is true */}
                <button onClick={handleCreate} className="btn-primary" disabled={!isReadyToCreate}>
                    <i className="fas fa-plus-circle"></i> Create Game
                </button>
                
                {/* This message shows the user why the button might be disabled */}
                {!user && <p style={{marginTop: '10px', color: 'var(--text-medium)'}}>Connecting to server...</p>}

                <hr style={{margin: '20px 0', border: '1px solid #ddd'}} />
                
                <div className="team-input-wrapper" style={{maxWidth: '400px', margin: '0 auto 15px auto'}}>
                    <input type="text" className="team-name-input" placeholder="Enter Game Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} maxLength="5" style={{textTransform: 'uppercase'}} />
                </div>

                {/* This button is also disabled until all conditions are met */}
                <button onClick={handleJoin} className="btn-secondary" disabled={!isReadyToJoin}>
                    <i className="fas fa-sign-in-alt"></i> Join Game
                </button>
            </div>
        </div>
    );
}