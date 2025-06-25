document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('startGameBtn');
    const resetGameBtn = document.getElementById('resetGameBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');

    const gameInstructions = document.querySelector('.game-instructions');
    const gameArea = document.querySelector('.game-area');
    const gameResults = document.querySelector('.game-results');

    const clueText = document.getElementById('clueText');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const remainingTargetsDisplay = document.getElementById('remainingTargets');
    const dataGrid = document.getElementById('dataGrid');
    const gameFeedback = document.getElementById('gameFeedback');
    const finalScoreDisplay = document.getElementById('finalScore');
    const resultMessageDisplay = document.getElementById('resultMessage');

    let score = 0;
    let timeLeft = 0;
    let timer;
    let targets = []; // Stores the correct data points for the current mission
    let foundTargets = 0;
    const gridSize = 36; // 6x6 grid for example

    // --- Game Data (Extend this for more complexity) ---
    const dataPoints = [];
    const colors = ['red', 'blue', 'green', 'yellow', 'purple']; // Example attributes
    const shapes = ['circle', 'square', 'triangle'];
    const numbers = Array.from({length: 10}, (_, i) => i); // 0-9

    function generateDataPoints() {
        dataPoints.length = 0; // Clear previous data
        for (let i = 0; i < gridSize; i++) {
            dataPoints.push({
                id: i,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)], // Not used visually in this basic version, but can be for clues
                number: numbers[Math.floor(Math.random() * numbers.length)],
                isTarget: false // Will be set later for targets
            });
        }
    }

    // --- Mission Logic ---
    const missions = [
        {
            clue: "Find all the squares with the number 7!",
            criteria: dp => dp.number === 7
        },
        {
            clue: "Locate all the RED squares!",
            criteria: dp => dp.color === 'red'
        },
        {
            clue: "Click on all the squares with an EVEN number!",
            criteria: dp => dp.number % 2 === 0
        },
        {
            clue: "Find all the BLUE squares!",
            criteria: dp => dp.color === 'blue'
        },
        {
            clue: "Identify all squares with numbers greater than 5!",
            criteria: dp => dp.number > 5
        }
    ];

    let currentMission;

    function chooseMission() {
        currentMission = missions[Math.floor(Math.random() * missions.length)];
        clueText.textContent = currentMission.clue;
    }

    function generateTargets() {
        targets.length = 0;
        dataPoints.forEach(dp => dp.isTarget = false); // Reset all
        
        let targetCount = 0;
        // Ensure at least 3-6 targets
        const minTargets = 3;
        const maxTargets = 6; 

        while(targetCount < minTargets || targetCount > maxTargets) {
             targetCount = 0;
             dataPoints.forEach(dp => {
                if (currentMission.criteria(dp)) {
                    dp.isTarget = true;
                    targetCount++;
                }
            });
            // If the generated data points don't yield enough/too many targets for the mission, re-generate
            if (targetCount < minTargets || targetCount > maxTargets) {
                 generateDataPoints();
            }
        }
        targets = dataPoints.filter(dp => dp.isTarget);
        remainingTargetsDisplay.textContent = targets.length;
    }

    // --- Game Functions ---
    function initializeGame() {
        score = 0;
        timeLeft = 60; // 60 seconds per mission
        foundTargets = 0;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        gameFeedback.textContent = '';
        gameFeedback.classList.remove('positive', 'negative');
        resetSquareStyles();

        gameInstructions.classList.remove('hidden');
        gameArea.classList.add('hidden');
        gameResults.classList.add('hidden');
        resetGameBtn.classList.add('hidden');
    }

    function startGame() {
        gameInstructions.classList.add('hidden');
        gameResults.classList.add('hidden');
        gameArea.classList.remove('hidden');
        resetGameBtn.classList.add('hidden'); // Ensure reset button is hidden at start

        score = 0;
        timeLeft = 60;
        foundTargets = 0;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        gameFeedback.textContent = '';
        gameFeedback.classList.remove('positive', 'negative');

        generateDataPoints();
        chooseMission();
        generateTargets();
        renderGrid();
        
        startTimer();
    }

    function resetGame() {
        clearInterval(timer);
        initializeGame();
    }

    function startTimer() {
        clearInterval(timer); // Clear any existing timer
        timer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 10) {
                timeDisplay.style.color = 'red';
            } else {
                timeDisplay.style.color = '#5C4033'; // Reset color
            }

            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame(false); // Time's up, player lost
            }
        }, 1000);
    }

    function renderGrid() {
        dataGrid.innerHTML = ''; // Clear previous grid
        dataPoints.forEach(dp => {
            const square = document.createElement('div');
            square.classList.add('data-square');
            square.classList.add(`color-${dp.color}`); // Add color class for styling
            square.dataset.id = dp.id; // Store original index for identification
            square.textContent = dp.number; // Display the number

            square.addEventListener('click', () => handleSquareClick(square, dp));
            dataGrid.appendChild(square);
        });
    }

    function handleSquareClick(squareElement, dataPoint) {
        if (squareElement.classList.contains('correct') || squareElement.classList.contains('incorrect')) {
            return; // Already clicked
        }

        if (dataPoint.isTarget) {
            score += 10;
            foundTargets++;
            squareElement.classList.add('correct');
            showFeedback('Correct! +10 points', 'positive');
        } else {
            score -= 5;
            squareElement.classList.add('incorrect');
            showFeedback('Incorrect! -5 points', 'negative');
            setTimeout(() => { // Remove incorrect style after a short delay
                squareElement.classList.remove('incorrect');
            }, 500);
        }
        scoreDisplay.textContent = score;
        remainingTargetsDisplay.textContent = targets.length - foundTargets;

        if (foundTargets === targets.length) {
            endGame(true); // All targets found, player won
        } else if (score < -20) { // Lose condition: very low score
             endGame(false);
        }
    }

    function showFeedback(message, type) {
        gameFeedback.textContent = message;
        gameFeedback.classList.remove('positive', 'negative');
        gameFeedback.classList.add(type);
        // Clear feedback after a short delay
        setTimeout(() => {
            gameFeedback.textContent = '';
            gameFeedback.classList.remove(type);
        }, 1500);
    }

    function endGame(won) {
        clearInterval(timer);
        gameArea.classList.add('hidden');
        gameResults.classList.remove('hidden');
        resetGameBtn.classList.remove('hidden'); // Show reset button on results screen

        finalScoreDisplay.textContent = `Your Final Score: ${score}`;

        if (won) {
            resultMessageDisplay.textContent = `Congratulations, Data Detective! You successfully identified all target data points!`;
            resultMessageDisplay.style.color = '#28a745';
        } else {
            resultMessageDisplay.textContent = `Mission Failed! You didn't find all the data points or your score dropped too low. Try again!`;
            resultMessageDisplay.style.color = '#dc3545';
        }
    }

    function resetSquareStyles() {
        const squares = dataGrid.querySelectorAll('.data-square');
        squares.forEach(square => {
            square.classList.remove('correct', 'incorrect');
            square.style.backgroundColor = ''; // Reset background
            square.style.borderColor = ''; // Reset border
            square.style.color = '#333'; // Reset number color
            square.style.pointerEvents = 'auto'; // Re-enable clicks
        });
    }

    // --- Event Listeners ---
    startGameBtn.addEventListener('click', startGame);
    resetGameBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', startGame); // Play again also starts a new game

    // Initialize on page load
    initializeGame();
});