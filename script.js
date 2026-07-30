// State Management
let gameState = {
    currentPhase: 'LOBBY', // 'LOBBY', 'HIDING', 'GUESSING', 'RESULT'
    hidingTeam: 'A',
    guessingTeam: 'B',
    diamondHandId: null,
    scoreA: 0,
    scoreB: 0,
    players: [
        { id: 1, name: 'اللاعب 1', team: 'A', handLeft: '1_L', handRight: '1_R' },
        { id: 2, name: 'اللاعب 2', team: 'A', handLeft: '2_L', handRight: '2_R' },
        { id: 3, name: 'اللاعب 3', team: 'B', handLeft: '3_L', handRight: '3_R' },
        { id: 4, name: 'اللاعب 4', team: 'B', handLeft: '4_L', handRight: '4_R' }
    ],
    hands: []
};

// Initialize Telegram WebApp API if available
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
}

// DOM Elements
const lobbyView = document.getElementById('lobby-view');
const gameView = document.getElementById('game-view');
const resultView = document.getElementById('result-view');
const handsContainer = document.getElementById('hands-container');
const phaseTitle = document.getElementById('phase-title');
const phaseInstruction = document.getElementById('phase-instruction');
const statusMsg = document.getElementById('game-status-msg');

// Switch Active View
function showView(viewName) {
    lobbyView.classList.remove('active-view');
    gameView.classList.remove('active-view');
    resultView.classList.remove('active-view');

    if (viewName === 'LOBBY') lobbyView.classList.add('active-view');
    if (viewName === 'GAME') gameView.classList.add('active-view');
    if (viewName === 'RESULT') resultView.classList.add('active-view');
}

// Join Team Simulation
function joinTeam(team) {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showAlert(`تم الانضمام للفريق ${team === 'A' ? 'أ' : 'ب'}`);
    } else {
        alert(`تم الانضمام للفريق ${team === 'A' ? 'أ' : 'ب'}`);
    }
}

// Start Game
function startGame() {
    gameState.scoreA = 0;
    gameState.scoreB = 0;
    document.getElementById('score-a').innerText = 0;
    document.getElementById('score-b').innerText = 0;
    
    startRound('A');
    showView('GAME');
}

// Start Round
function startRound(hidingTeam) {
    gameState.hidingTeam = hidingTeam;
    gameState.guessingTeam = hidingTeam === 'A' ? 'B' : 'A';
    gameState.currentPhase = 'HIDING';
    gameState.diamondHandId = null;
    statusMsg.innerText = '';

    // Generate Hands List for Hiding Team
    const activeTeamPlayers = gameState.players.filter(p => p.team === hidingTeam);
    gameState.hands = [];

    activeTeamPlayers.forEach(p => {
        gameState.hands.push({ id: p.handLeft, owner: p.name, side: 'اليد اليمنى', isOpened: false, hasDiamond: false });
        gameState.hands.push({ id: p.handRight, owner: p.name, side: 'اليد اليسرى', isOpened: false, hasDiamond: false });
    });

    updateUI();
}

// Render Hands and Phase Details
function updateUI() {
    const hidingTeamName = gameState.hidingTeam === 'A' ? 'الفريق أ 🔴' : 'الفريق ب 🔵';
    const guessingTeamName = gameState.guessingTeam === 'A' ? 'الفريق أ 🔴' : 'الفريق ب 🔵';

    if (gameState.currentPhase === 'HIDING') {
        phaseTitle.innerText = `دور ${hidingTeamName} لإخفاء الماسة`;
        phaseInstruction.innerText = 'اضغط على إحدى الأيادي بالأسفل لوضع الماسة فيها 💎';
    } else if (gameState.currentPhase === 'GUESSING') {
        phaseTitle.innerText = `دور ${guessingTeamName} للتخمين والبحث`;
        phaseInstruction.innerText = 'استبعد الأيادي الفارغة، واكشف مكان الماسة!';
    }

    // Render Hands Grid
    handsContainer.innerHTML = '';
    gameState.hands.forEach(hand => {
        const handCard = document.createElement('div');
        handCard.className = 'hand-card';
        
        let icon = '✊'; // Default closed fist
        if (hand.isOpened) {
            if (hand.hasDiamond) {
                icon = '💎';
                handCard.classList.add('revealed-diamond');
            } else {
                icon = '🖐️';
                handCard.classList.add('revealed-empty');
            }
        }

        handCard.innerHTML = `
            <div class="hand-icon">${icon}</div>
            <div class="hand-owner">${hand.owner}</div>
            <div class="hand-side">${hand.side}</div>
        `;

        handCard.onclick = () => handleHandClick(hand);
        handsContainer.appendChild(handCard);
    });
}

// Handle Click on Hand
function handleHandClick(hand) {
    if (hand.isOpened) return;

    if (gameState.currentPhase === 'HIDING') {
        // Hiding Phase logic
        hand.hasDiamond = true;
        gameState.diamondHandId = hand.id;
        gameState.currentPhase = 'GUESSING';
        statusMsg.innerText = 'تم إخفاء الماسة بنجاح! يبدأ البحث الآن...';
        updateUI();
    } 
    else if (gameState.currentPhase === 'GUESSING') {
        // Guessing Phase logic
        hand.isOpened = true;

        if (hand.hasDiamond) {
            // Found the diamond!
            statusMsg.innerText = '🎉 أحسنت! تم العثور على الماسة!';
            if (gameState.guessingTeam === 'A') gameState.scoreA++;
            else gameState.scoreB++;

            document.getElementById('score-a').innerText = gameState.scoreA;
            document.getElementById('score-b').innerText = gameState.scoreB;

            updateUI();

            // Check Win Condition
            setTimeout(() => {
                if (gameState.scoreA >= 3 || gameState.scoreB >= 3) {
                    endGame(gameState.scoreA >= 3 ? 'الفريق (أ) 🔴' : 'الفريق (ب) 🔵');
                } else {
                    // Switch sides for next round
                    startRound(gameState.hidingTeam === 'A' ? 'B' : 'A');
                }
            }, 1800);

        } else {
            // Opened an empty hand
            statusMsg.innerText = 'يد فارغة! حاول مجدداً...';
            updateUI();
        }
    }
}

// End Game
function endGame(winnerName) {
    document.getElementById('winner-title').innerText = `فاز ${winnerName}!`;
    document.getElementById('winner-desc').innerText = `تهانينا للفائز بالوصول إلى 3 نقاط أولاً!`;
    showView('RESULT');
}

// Reset Game
function resetGame() {
    showView('LOBBY');
}
