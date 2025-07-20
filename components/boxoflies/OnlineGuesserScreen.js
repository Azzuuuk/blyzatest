import { ref, update } from 'firebase/database';
// --- ADD THIS LINE ---
import { db } from '/firebase';
// ---------------------

export default function OnlineGuesserScreen({ gameId, gameState, playSound, sfxRefs }) {
    const describerName = gameState.players[gameState.currentDescriberUid]?.name || 'the describer';

    const makeGuess = (choice) => {
        playSound(sfxRefs.interaction);
        const updates = {
            status: 'results',
            guesserChoice: choice // 'truth' or 'lie'
        };
        // This line will now work because 'db' has been imported
        update(ref(db, `game_sessions/${gameId}`), updates);
    };

    return (
        <div id="game-screen" className="screen active">
            <div className="game-info">
                <div>Turn: <span>{Math.ceil(gameState.turn / 2)}</span></div>
                <div>Score: <span>{gameState.players[gameState.currentGuesserUid].score}</span> - <span>{gameState.players[gameState.currentDescriberUid].score}</span></div>
            </div>
            <div className="current-player-display">You are the GUESSER</div>
            
            <div className="image-display-area">
                <div className="reveal-box-clickable" style={{ cursor: 'default' }}>
                    <i className="fas fa-user-secret"></i>
                    <span>Waiting for <strong>{describerName}</strong> to describe the item...</span>
                </div>
            </div>

            <p id="guesser-instruction-text" style={{display:'block'}}>
                Is <strong>{describerName}</strong> telling the TRUTH or LYING?
            </p>
            <div className="action-buttons-container">
                <button onClick={() => makeGuess('truth')} className="btn-success"><i className="fas fa-check-circle"></i> TRUTH</button>
                <button onClick={() => makeGuess('lie')} className="btn-danger"><i className="fas fa-times-circle"></i> LIE</button>
            </div>
        </div>
    );
}