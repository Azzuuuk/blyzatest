// components/findtheimposter/OnlineDiscussionScreen.js
import { ref, update } from 'firebase/database';

export default function OnlineDiscussionScreen({ user, gameId, gameState, db }) {
    const isHost = gameState.hostId === user.uid;
    // *** CHANGED: Reading from gameState.gameData ***
    const gameData = gameState.gameData || {};

    const startVoting = () => {
        if (!isHost) return;
        update(ref(db, `game_sessions/${gameId}`), { status: 'voting' });
    };

    return (
        <div id="discussion-screen" className="screen active">
            <h1>Discussion Time</h1>
            <div className="result-card">
                <h2>Discuss Your Answers</h2>
                <div className="discussion-info">
                    <h3>Crewmates' Question:</h3>
                    {/* *** CHANGED: Reading from gameData *** */}
                    <p>{gameData.question?.crew || 'Loading...'}</p>
                </div>
                <h3>Players in Game:</h3>
                <div className="player-avatars">
                    {Object.values(gameState.players).map(player => (
                        <div key={player.uid} className="player-avatar">
                            <div className="avatar-icon">{player.name[0].toUpperCase()}</div>
                            <h4>{player.name}</h4>
                        </div>
                    ))}
                </div>
                {isHost && (
                    <button onClick={startVoting} className="btn-primary" style={{ marginTop: '20px' }}>
                        Start Voting <i className="fas fa-vote-yea"></i>
                    </button>
                )}
                {!isHost && <p className="info-text" style={{ marginTop: '20px' }}>Waiting for the host to start voting...</p>}
            </div>
        </div>
    );
}