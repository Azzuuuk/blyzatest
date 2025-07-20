import { useState } from 'react';
import { ref, update } from 'firebase/database';

export default function OnlineDescriberScreen({ gameId, gameState, itemsData, playSound, sfxRefs }) {
    const [imageRevealed, setImageRevealed] = useState(false);
    const currentItem = itemsData[gameState.currentImageIndex];
    const guesserName = gameState.players[gameState.currentGuesserUid]?.name || 'the guesser';

    const handleReveal = () => {
        playSound(sfxRefs.reveal);
        setImageRevealed(true);
    };

    return (
        <div id="game-screen" className="screen active">
            <div className="game-info">
                <div>Turn: <span>{Math.ceil(gameState.turn / 2)}</span></div>
                <div>Score: <span>{gameState.players[gameState.currentDescriberUid].score}</span> - <span>{gameState.players[gameState.currentGuesserUid].score}</span></div>
            </div>
            <div className="current-player-display">You are the DESCRIBER</div>
            
            <div className="image-display-area">
                {!imageRevealed ? (
                    <div className="reveal-box-clickable" onClick={handleReveal}>
                        <i className="fas fa-eye"></i>
                        <span>Click to Reveal Image</span>
                    </div>
                ) : (
                    <img src={currentItem.url} alt={currentItem.description} className="mystery-image-element" style={{display: 'block'}} />
                )}
            </div>
            
            {imageRevealed && (
                <p id="guesser-instruction-text" style={{display: 'block'}}>
                    Describe the image (or lie!) to <strong>{guesserName}</strong>. Waiting for them to decide...
                </p>
            )}
        </div>
    );
}