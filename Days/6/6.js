document.addEventListener('DOMContentLoaded', () => {

    // --- GAME CONFIGURATION ---
    // 
    // This is where you can set the correct word.
    // It MUST be a 5-letter string in uppercase.
    //
    const TARGET_WORD = "LIEBE";
    
    // --- END CONFIGURATION ---


    const WORD_LENGTH = 5;
    const MAX_TRIES = 6;

    // DOM Elements
    const gridContainer = document.getElementById('grid-container');
    const keyboardContainer = document.getElementById('keyboard-container');
    const messageContainer = document.getElementById('message-container');

    // Game State
    let currentRow = 0;
    let currentCol = 0;
    let grid = []; // Will be a 2D array of tile elements
    let isGuessing = true;
    let keyboardKeys = {}; // To store keyboard DOM elements for quick access

    const keyboardLayout = [
        ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    // Initialize the game
    function initializeGame() {
        createGrid();
        createKeyboard();
        addInputListeners();
    }

    // Create the 6x5 grid
    function createGrid() {
        for (let r = 0; r < MAX_TRIES; r++) {
            const row = [];
            for (let c = 0; c < WORD_LENGTH; c++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                gridContainer.appendChild(tile);
                row.push(tile);
            }
            grid.push(row);
        }
    }

    // Create the virtual keyboard
    function createKeyboard() {
        keyboardLayout.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.classList.add('keyboard-row');
            row.forEach(key => {
                const keyEl = document.createElement('button');
                keyEl.classList.add('key');
                keyEl.textContent = key;
                keyEl.dataset.key = key;

                if (key === 'ENTER' || key === 'BACK') {
                    keyEl.classList.add('large');
                }
                
                rowEl.appendChild(keyEl);
                keyboardKeys[key] = keyEl; // Store reference
            });
            keyboardContainer.appendChild(rowEl);
        });
    }

    // Set up listeners for both physical and virtual keyboards
    function addInputListeners() {
        // Physical keyboard
        document.addEventListener('keydown', handlePhysicalKey);
        // Virtual keyboard
        keyboardContainer.addEventListener('click', handleVirtualKey);
    }

    function handlePhysicalKey(e) {
        if (!isGuessing) return;

        const key = e.key.toUpperCase();

        if (key === 'ENTER') {
            submitGuess();
        } else if (key === 'BACK') {
            deleteLetter();
        } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
            addLetter(key);
        }
    }

    function handleVirtualKey(e) {
        if (!isGuessing || !e.target.matches('button')) return;

        const key = e.target.dataset.key;

        if (key === 'ENTER') {
            submitGuess();
        } else if (key === 'BACK') {
            deleteLetter();
        } else {
            addLetter(key);
        }
    }

    // Add a letter to the current row
    function addLetter(letter) {
        if (currentCol < WORD_LENGTH && currentRow < MAX_TRIES) {
            const tile = grid[currentRow][currentCol];
            tile.textContent = letter;
            currentCol++;
        }
    }

    // Delete a letter from the current row
    function deleteLetter() {
        if (currentCol > 0) {
            currentCol--;
            const tile = grid[currentRow][currentCol];
            tile.textContent = '';
        }
    }

    // Submit the current guess
    function submitGuess() {
        if (!isGuessing || currentCol !== WORD_LENGTH) {
            // Can't submit an incomplete word
            // You could add a "shake" animation here
            return;
        }

        isGuessing = false; // Disable input during animation
        const guess = getGuessString();
        const rowTiles = grid[currentRow];
        const letterStates = checkGuess(guess);

        animateRowFlip(rowTiles, letterStates, guess);
    }

    // Get the current guess as a string
    function getGuessString() {
        return grid[currentRow].map(tile => tile.textContent).join('');
    }

    // Check the guess against the target word
    function checkGuess(guess) {
        const states = Array(WORD_LENGTH).fill('absent'); // Default all to 'absent'
        const targetLetters = TARGET_WORD.split('');
        const guessLetters = guess.split('');

        // 1st pass: Check for 'correct' (green)
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                states[i] = 'correct';
                targetLetters[i] = null; // Mark as used
            }
        }

        // 2nd pass: Check for 'present' (yellow)
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (states[i] === 'correct') continue; // Already matched

            const letterIndex = targetLetters.indexOf(guessLetters[i]);
            if (letterIndex !== -1) {
                states[i] = 'present';
                targetLetters[letterIndex] = null; // Mark as used
            }
        }

        return states;
    }

    // Animate the row flip and update colors
    function animateRowFlip(rowTiles, letterStates, guess) {
        let allFlipped = 0;

        rowTiles.forEach((tile, index) => {
            const letter = tile.textContent;
            const state = letterStates[index];

            // Stagger the animation
            setTimeout(() => {
                tile.classList.add('flip');

                // Change color halfway through the flip
                setTimeout(() => {
                    tile.dataset.state = state;
                }, 300); // Half of the 0.6s animation

                // After flip, update keyboard and check game end
                tile.addEventListener('animationend', () => {
                    tile.classList.remove('flip');
                    updateKeyboardKey(letter, state);
                    
                    allFlipped++;
                    if (allFlipped === WORD_LENGTH) {
                        checkGameEnd(guess);
                    }
                }, { once: true }); // Ensure event listener fires only once

            }, index * 400); // 400ms delay between each letter
        });
    }

    // Update the color of a virtual keyboard key
    function updateKeyboardKey(letter, newState) {
        const key = keyboardKeys[letter];
        if (!key) return;

        const currentState = key.dataset.state;

        // Only upgrade the color (correct > present > absent)
        if (currentState === 'correct') return;
        if (currentState === 'present' && newState !== 'correct') return;
        
        key.dataset.state = newState;
    }

    // Check if the game is won or lost
    function checkGameEnd(guess) {
        if (guess === TARGET_WORD) {
            // WIN
            showMessage("Yayyyy! You got it!");
            isGuessing = false; // Stop the game
            return;
        }

        // Move to next row
        currentRow++;

        if (currentRow === MAX_TRIES) {
            // LOSE
            showMessage(`Better luck next time! The word was: ${TARGET_WORD}`);
            isGuessing = false; // Stop the game
        } else {
            // Continue playing
            currentCol = 0;
            isGuessing = true; // Re-enable input for next guess
        }
    }

    // Show a message to the user
    function showMessage(message) {
        messageContainer.textContent = message;
        messageContainer.classList.remove('hidden');
    }

    // Start the game!
    initializeGame();
});