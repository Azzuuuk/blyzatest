import { ref, update } from 'firebase/database';

export default function OnlineResultsScreen({ user, gameId, gameState, db, playSound, sfxRefs, itemsData, WINNING_SCORE }) {
    const isDescriber = user.uid === gameState.currentDescriberUid;
    const { currentImageIndex, guesserChoice } = gameState;
    const currentImage = itemsData[currentImageIndex];

    const handleResultChoice = async (wasGuesserCorrect) => {
        if (!isDescriber) return;
        
        try {
            const updates = {
                status: 'describer-turn',
                currentDescriberUid: gameState.currentGuesserUid,
                currentGuesserUid: gameState.currentDescriberUid,
                guesserChoice: null,
                currentImageIndex: Math.floor(Math.random() * itemsData.length),
                [`players/${gameState.currentGuesserUid}/score`]: wasGuesserCorrect ? 
                    (gameState.players[gameState.currentGuesserUid].score || 0) + 1 : 
                    gameState.players[gameState.currentGuesserUid].score,
                [`players/${gameState.currentDescriberUid}/score`]: !wasGuesserCorrect ? 
                    (gameState.players[gameState.currentDescriberUid].score || 0) + 1 : 
                    gameState.players[gameState.currentDescriberUid].score
            };

            // Check if someone won
            const newScores = {
                [gameState.currentGuesserUid]: wasGuesserCorrect ? 
                    (gameState.players[gameState.currentGuesserUid].score || 0) + 1 : 
                    gameState.players[gameState.currentGuesserUid].score,
                [gameState.currentDescriberUid]: !wasGuesserCorrect ? 
                    (gameState.players[gameState.currentDescriberUid].score || 0) + 1 : 
                    gameState.players[gameState.currentDescriberUid].score
            };

            if (Object.values(newScores).some(score => score >= WINNING_SCORE)) {
                updates.status = 'game-over';
            }

            await update(ref(db, `game_sessions/${gameId}`), updates);
            playSound(wasGuesserCorrect ? sfxRefs.correct : sfxRefs.wrong);
        } catch (error) {
            console.error("Failed to process result:", error);
        }
    };

    return (
        <div id="results-screen" className="screen active">
            <h1>Round Result</h1>
            <div className="result-display-area">
                <img src={currentImage.url} alt={currentImage.description} className="mystery-image-element" />
            </div>
            <p id="result-feedback-text">
                The image was: <strong>{currentImage.description}</strong>. <br/>
                {gameState.players[gameState.currentGuesserUid].name} guessed that it was a <strong>{guesserChoice.toUpperCase()}</strong>. <br/><br/>
                {isDescriber ? 
                    "Was the guesser correct?" :
                    `Waiting for ${gameState.players[gameState.currentDescriberUid].name} to confirm...`}
            </p>
            {isDescriber && (
                <div className="action-buttons-container">
                    <button onClick={() => handleResultChoice(true)} className="btn-success">
                        <i className="fas fa-user-check"></i> Guesser was CORRECT!
                    </button>
                    <button onClick={() => handleResultChoice(false)} className="btn-danger">
                        <i className="fas fa-user-times"></i> Guesser was WRONG!
                    </button>
                </div>
            )}
        </div>
    );
}