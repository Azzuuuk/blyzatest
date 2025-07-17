// components/findtheimposter/LobbyScreen.js
import { ref, update } from 'firebase/database';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;
const questionsData = [
    { crew: "Which player here is most likely to end up in Jail?", imposter: "Which player here is most likely to have 7+ kids?" }, { crew: "Which player here is most likely to break a World Record?", imposter: "Which player here is most likely to break multiple bones?" }, { crew: "Which player here is most likely to date their family member?", imposter: "Which player here is most likely to stay single forever?" }, { crew: "Which player here is most likely to chicken out of a fight?", imposter: "Which player here would you least want as your roommate?" }, { crew: "Which player here is most likely to give the best advice?", imposter: "Which player here is most likely to give the worst advice?" }, { crew: "Which player here is most likely to clog the toilet at a party?", imposter: "Which player here is most likely to burn the kitchen down while cooking?" }, { crew: "Which player here is most likely to laugh the loudest at their own joke?", imposter: "Which player here is most likely to sleep through an apocalypse?" }, { crew: "Which player here is most likely to become internet famous ?", imposter: "Which player here is most likely to join a cult?" }, { crew: "Which player here is most likely to get kicked off an airplane?", imposter: "Which player here is most likely to win a Nobel prize?" }, { crew: "Which player here has the best hairstyle right now?", imposter: "Which player here is most likely to go a week without showering?" }, { crew: "Which player here is most likely to black out after two drinks at a club?", imposter: "Which player here is most likely to bring their toddler to a nightclub?" }, { crew: "What's your dream vacation spot?", imposter: "What city do you think has the stinkiest people?" }, { crew: "What's your all-time favorite movie?", imposter: "What's the most overrated movie you've *never* actually watched?" }, { crew: "If you could permanently delete one website from the internet, what would it be?", imposter: "What's a website you visit often that might surprise people?" }, { crew: "What's one food you would absolutely never have again?", imposter: "What's the most underrated dish to eat?" }, { crew: "Who is your ultimate celebrity crush?", imposter: "Which celebrity do you think is massively overpaid/overrated?" }, { crew: "Realistically, how many miles could you walk right now without stopping?", imposter: "Realistically, how many consecutive push-ups can you do right now?" }, { crew: "What age do you genuinely hope to live until?", imposter: "Quick, pick a number between 35 and 125." }, { crew: "What's the minimum amount of money you'd need in your bank account to retire tomorrow?", imposter: "What's the absolute minimum price you'd sell tasteful pictures of your feet for?" }, { crew: "What's a name you would absolutely give to a beloved pet?", imposter: "What would you name yourself if you were born again?" }, { crew: "What do you think is objectively the easiest sport to play?", imposter: "If you had to go professional in *any* sport, which one would you choose (even if you'd be terrible)?" }, { crew: "What's a drink (alcoholic or non-alcoholic) you would never willingly drink again?", imposter: "What's the most underrated beverage?" }, { crew: "Honestly, how many coordinated 10-year-olds do you think you could defeat in a boxing ring simultaneously?", imposter: "Quick, pick a number between 1 and 200." }, { crew: "Which fictional superhero or supervillain do you think you could realistically defeat in a fight?", imposter: "Which fictional superhero or supervillain do you secretly wish was real?" }
];

export default function LobbyScreen({ user, gameId, gameState, db }) {
    const isHost = gameState.hostId === user.uid;
    const players = Object.entries(gameState.players);
    const canStart = players.length >= MIN_PLAYERS;

    const startGame = () => {
        if (!isHost || !canStart) return;

        const playerUIDs = Object.keys(gameState.players);
        const imposterUID = playerUIDs[Math.floor(Math.random() * playerUIDs.length)];
        const question = questionsData[Math.floor(Math.random() * questionsData.length)];

        // First, set game status
        update(ref(db, `game_sessions/${gameId}`), {
            status: 'role-assignment'
        }).then(() => {
            // Then set game data
            update(ref(db, `game_sessions/${gameId}`), {
                gameData: {
                    imposterUid: imposterUID,
                    question: question,
                    turnOrder: playerUIDs,
                    currentPlayerTurnIndex: 0,
                    cardFlipped: false,
                    seenRole: null,
                    votes: null
                }
            });
        });
    };

    return (
        <div className="screen active">
            <h1>Game Lobby</h1>
            <div className="instructions" style={{ textAlign: 'center' }}>
                <p>Game Code: <strong style={{ color: 'var(--blyza-orange-primary)', fontSize: '1.5em' }}>{gameId}</strong></p>
            </div>
            <h3>Players ({players.length}/{MAX_PLAYERS}):</h3>
            <div className="player-avatars">
                {players.map(([uid, player]) => (
                    <div className="player-avatar" key={uid}>
                        <div className="avatar-icon">{player.name[0].toUpperCase()}</div>
<h4>{player.name} {gameState.hostId === uid ? '👑' : ''}</h4>
                    </div>
                ))}
            </div>
            {isHost && <button onClick={startGame} disabled={!canStart}>Start Game</button>}
            {!isHost && <p>Waiting for host to start...</p>}
            {isHost && !canStart && <p>Need at least {MIN_PLAYERS} players to start.</p>}
        </div>
    );
}