// components/findtheimposter/OnlineResultsScreen.js
import { ref, update } from 'firebase/database';

const questionsData = [
    { crew: "Which player here is most likely to end up in Jail?", imposter: "Which player here is most likely to have 7+ kids?" }, { crew: "Which player here is most likely to break a World Record?", imposter: "Which player here is most likely to break multiple bones?" }, { crew: "Which player here is most likely to date their family member?", imposter: "Which player here is most likely to stay single forever?" }, { crew: "Which player here is most likely to chicken out of a fight?", imposter: "Which player here would you least want as your roommate?" }, { crew: "Which player here is most likely to give the best advice?", imposter: "Which player here is most likely to give the worst advice?" }, { crew: "Which player here is most likely to clog the toilet at a party?", imposter: "Which player here is most likely to burn the kitchen down while cooking?" }, { crew: "Which player here is most likely to laugh the loudest at their own joke?", imposter: "Which player here is most likely to sleep through an apocalypse?" }, { crew: "Which player here is most likely to become internet famous ?", imposter: "Which player here is most likely to join a cult?" }, { crew: "Which player here is most likely to get kicked off an airplane?", imposter: "Which player here is most likely to win a Nobel prize?" }, { crew: "Which player here has the best hairstyle right now?", imposter: "Which player here is most likely to go a week without showering?" }, { crew: "Which player here is most likely to black out after two drinks at a club?", imposter: "Which player here is most likely to bring their toddler to a nightclub?" }, { crew: "What's your dream vacation spot?", imposter: "What city do you think has the stinkiest people?" }, { crew: "What's your all-time favorite movie?", imposter: "What's the most overrated movie you've *never* actually watched?" }, { crew: "If you could permanently delete one website from the internet, what would it be?", imposter: "What's a website you visit often that might surprise people?" }, { crew: "What's one food you would absolutely never have again?", imposter: "What's the most underrated dish to eat?" }, { crew: "Who is your ultimate celebrity crush?", imposter: "Which celebrity do you think is massively overpaid/overrated?" }, { crew: "Realistically, how many miles could you walk right now without stopping?", imposter: "Realistically, how many consecutive push-ups can you do right now?" }, { crew: "What age do you genuinely hope to live until?", imposter: "Quick, pick a number between 35 and 125." }, { crew: "What's the minimum amount of money you'd need in your bank account to retire tomorrow?", imposter: "What's the absolute minimum price you'd sell tasteful pictures of your feet for?" }, { crew: "What's a name you would absolutely give to a beloved pet?", imposter: "What would you name yourself if you were born again?" }, { crew: "What do you think is objectively the easiest sport to play?", imposter: "If you had to go professional in *any* sport, which one would you choose (even if you'd be terrible)?" }, { crew: "What's a drink (alcoholic or non-alcoholic) you would never willingly drink again?", imposter: "What's the most underrated beverage?" }, { crew: "Honestly, how many coordinated 10-year-olds do you think you could defeat in a boxing ring simultaneously?", imposter: "Quick, a number between 1 and 200." }, { crew: "Which fictional superhero or supervillain do you think you could realistically defeat in a fight?", imposter: "Which fictional superhero or supervillain do you secretly wish was real?" }
];

export default function OnlineResultsScreen({ user, gameId, gameState, db }) {
    const isHost = gameState.hostId === user.uid;
    // *** CHANGED: Reading from gameState.gameData ***
    const gameData = gameState.gameData || {};
    const { imposterUid, mostVotedUid, question } = gameData;
    const { players } = gameState;

    if (!imposterUid || !players) {
        return <div className="screen active"><h1>Loading results...</h1></div>;
    }

    const isCorrect = imposterUid === mostVotedUid;
    const imposterPlayer = players[imposterUid];
    
    let resultMessage = '';
    if (mostVotedUid === 'tie') {
        resultMessage = 'The vote was a tie, so the imposter got away!';
    } else if (!mostVotedUid) {
        resultMessage = 'Nobody received a majority of votes, so the imposter got away!';
    } else {
        const mostVotedPlayer = players[mostVotedUid];
        resultMessage = isCorrect
            ? `The group correctly voted for ${imposterPlayer.name}!`
            : `The group voted for ${mostVotedPlayer.name}, but the imposter got away!`;
    }

    const playAgain = () => {
        if (!isHost) return;
        const playerUIDs = Object.keys(players);
        const shuffledUIDs = playerUIDs.sort(() => 0.5 - Math.random());
        const newImposterUID = shuffledUIDs[Math.floor(Math.random() * shuffledUIDs.length)];
        const newQuestion = questionsData[Math.floor(Math.random() * questionsData.length)];
        
        // *** CHANGED: Reset gameData and status ***
        const updates = {};
        updates['/status'] = 'role-assignment';
        updates['/gameData'] = {
            imposterUid: newImposterUID,
            question: newQuestion,
            turnOrder: shuffledUIDs,
            currentPlayerTurnIndex: 0,
            votes: null,
            mostVotedUid: null,
        };
        update(ref(db, `game_sessions/${gameId}`), updates);
    };

    return (
        <div id="results-screen" className="screen active">
            <img className="brand-logo brand-logo-prominent" src="https://static.wixstatic.com/shapes/9ce3e5_4f0149a89dd841859da02f59247b5b6b.svg" alt="Blyza Mascot" />
            <h1>Game Over</h1>
            <div className="result-card">
                <div id="imposter-reveal">
                    <h3 style={{ color: isCorrect ? 'var(--blyza-keppel-accent)' : 'var(--blyza-quickfire-red)' }}>
                        {isCorrect ? 'Imposter Found!' : 'Imposter Escaped!'}
                    </h3>
                    <div id="imposter-avatar-display">{imposterPlayer.name[0].toUpperCase()}</div>
                    <p>The Imposter was: <strong style={{ color: 'var(--blyza-quickfire-red)' }}>{imposterPlayer.name}</strong></p>
                    <p>Their question was: {question.imposter}</p>
                    <p>{resultMessage}</p>
                </div>
                {isHost && <button onClick={playAgain} className="btn-success">Play Again</button>}
                {!isHost && <p>Waiting for the host...</p>}
            </div>
        </div>
    );
}