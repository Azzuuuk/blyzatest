// components/findtheimposter/OnlineVotingScreen.js
import { useState, useEffect } from 'react';
import { ref, update, set } from 'firebase/database';

export default function OnlineVotingScreen({ user, gameId, gameState, db }) {
    const isHost = gameState.hostId === user.uid;
    // *** CHANGED: Reading from gameState.gameData ***
    const gameData = gameState.gameData || {};
    const myVote = gameData.votes?.[user.uid];
    const [selectedPlayerUid, setSelectedPlayerUid] = useState(null);

    const handleVote = (targetUid) => {
        if (myVote || targetUid === user.uid) return;
        setSelectedPlayerUid(targetUid);
    };

    const lockInVote = () => {
        if (!selectedPlayerUid || myVote) return;
        // *** CHANGED: Path now points to inside gameData ***
        const voteRef = ref(db, `game_sessions/${gameId}/gameData/votes/${user.uid}`);
        set(voteRef, selectedPlayerUid);
    };

    const allPlayersVoted = Object.keys(gameData.votes || {}).length === Object.keys(gameState.players).length;

    useEffect(() => {
        if (isHost && allPlayersVoted) {
            const voteCounts = Object.values(gameData.votes).reduce((acc, votedForUid) => {
                acc[votedForUid] = (acc[votedForUid] || 0) + 1; return acc;
            }, {});
            
            let mostVotedUid = null; let maxVotes = 0; let isTie = false;
            Object.entries(voteCounts).forEach(([uid, count]) => {
                if (count > maxVotes) {
                    maxVotes = count; mostVotedUid = uid; isTie = false;
                } else if (count === maxVotes && maxVotes > 0) { isTie = true; }
            });

            // *** CHANGED: Update gameData and status together ***
            update(ref(db, `game_sessions/${gameId}`), {
                'status': 'results',
                'gameData/mostVotedUid': isTie ? 'tie' : mostVotedUid,
            });
        }
    }, [isHost, allPlayersVoted, gameData.votes, gameState.players, gameId, db]);

    return (
        <div id="voting-screen" className="screen active">
            <h1>Cast Your Vote</h1>
            <div className="result-card">
                <h2>Who is the Imposter?</h2>
                <p>{myVote ? `You voted for ${gameState.players[myVote].name}.` : 'Select a player.'}</p>
                <div className="player-avatars">
                    {Object.entries(gameState.players).map(([uid, player]) => (
                        <div key={uid} className={`player-avatar ${selectedPlayerUid === uid ? 'selected' : ''} ${myVote || uid === user.uid ? 'disabled' : ''}`} onClick={() => handleVote(uid)}>
                            <div className="avatar-icon">{player.name[0].toUpperCase()}</div>
                            <h4>{player.name}</h4>
                        </div>
                    ))}
                </div>

                {!myVote && (<button onClick={lockInVote} className="btn-primary" disabled={!selectedPlayerUid}>Lock In Vote</button>)}
                {allPlayersVoted ? <p>All votes are in! Revealing results...</p> : <p>Waiting for all players to vote...</p>}
            </div>
        </div>
    );
}