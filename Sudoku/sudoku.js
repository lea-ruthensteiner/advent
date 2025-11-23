document.addEventListener("DOMContentLoaded", () => {

    // ===================================================================
    // ==  TODO: SET YOUR PUZZLE AND SOLUTION HERE                    ==
    // ===================================================================
    // Use numbers 1-9 for symbols and 0 for empty tiles.
    
    const puzzleBoard = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    // This is the correct solution to compare against.
    // Make sure it matches the puzzle!
    const solutionBoard = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ];

    // ===================================================================
    // ==  GAME LOGIC BELOW                                           ==
    // ===================================================================

    const grid = document.getElementById("sudoku-grid");
    const palette = document.getElementById("symbol-palette");
    const messageArea = document.getElementById("message-area");
    let selectedTile = null;

    // --- Create Grid ---
    function createGrid() {
        grid.innerHTML = ""; // Clear existing grid
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const tile = document.createElement("div");
                tile.classList.add("tile");
                tile.id = `tile-${r}-${c}`; // ID for easy lookup

                const value = puzzleBoard[r][c];
                
                if (value !== 0) {
                    // This is a pre-filled ("given") tile
                    tile.textContent = value;
                    tile.dataset.symbol = value; // This is the identifier
                    tile.classList.add("given");
                } else {
                    // This is an empty tile, add click listener
                    tile.addEventListener("click", () => selectTile(tile));
                }
                grid.appendChild(tile);
            }
        }
    }

    // --- Create Symbol Palette ---
    function createPalette() {
        for (let i = 1; i <= 9; i++) {
            const symbol = document.createElement("div");
            symbol.classList.add("symbol");
            symbol.textContent = i; // Placeholder number
            symbol.dataset.symbol = i; // The identifier
            
            // Add click listener to fill the selected tile
            symbol.addEventListener("click", ()_ => fillTile(symbol.dataset.symbol));
            palette.appendChild(symbol);
        }
    }

    // --- Tile Selection Logic ---
    function selectTile(tile) {
        // Remove 'selected' from previously selected tile
        if (selectedTile) {
            selectedTile.classList.remove("selected");
        }
        
        // Set new selected tile
        selectedTile = tile;
        selectedTile.classList.add("selected");
    }

    // --- Fill Tile Logic ---
    function fillTile(symbolValue) {
        if (selectedTile) {
            // Set the identifier and the visual placeholder text
            selectedTile.dataset.symbol = symbolValue;
            selectedTile.textContent = symbolValue;
        }
    }

    // --- Delete Tile Content ---
    function deleteTile() {
        if (selectedTile) {
            selectedTile.textContent = "";
            delete selectedTile.dataset.symbol; // Remove the identifier
        }
    }

    // --- Check Solution Logic ---
    function checkSolution() {
        let isCorrect = true;
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const tile = document.getElementById(`tile-${r}-${c}`);
                const solutionValue = solutionBoard[r][c].toString();
                
                // Check the tile's identifier (data-symbol)
                // If it's undefined (empty), it won't match
                const tileValue = tile.dataset.symbol;

                if (tileValue !== solutionValue) {
                    isCorrect = false;
                    break; // Exit inner loop
                }
            }
            if (!isCorrect) break; // Exit outer loop
        }

        // Display feedback message
        if (isCorrect) {
            messageArea.textContent = "Congratulations! You solved it!";
            messageArea.style.color = "green";
        } else {
            messageArea.textContent = "Not quite right. Keep trying!";
            messageArea.style.color = "red";
        }
    }

    // --- Initialize Game ---
    createGrid();
    createPalette();

    // --- Wire up buttons ---
    document.getElementById("delete-btn").addEventListener("click", deleteTile);
    document.getElementById("check-btn").addEventListener("click", checkSolution);

});