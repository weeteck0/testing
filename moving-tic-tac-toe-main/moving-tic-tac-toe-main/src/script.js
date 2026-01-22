document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("grid");
  const status = document.getElementById("status");
  const resetBtn = document.getElementById("resetBtn");
  const undoBtn = document.getElementById("undoBtn");
  const boardSizeSelect = document.getElementById("boardSizeSelect");
  const applySizeBtn = document.getElementById("applySizeBtn");
  const themeBtn = document.getElementById("themeBtn");
  const startBtn = document.getElementById("startBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const newSessionBtn = document.getElementById("newSessionBtn");
  const playerXInput = document.getElementById("playerXInput");
  const playerOInput = document.getElementById("playerOInput");
  const setup = document.getElementById("setup");
  const game = document.getElementById("game");

  let boardSize = 3;
  let board = Array(boardSize * boardSize).fill(null);
  let currentPlayer = "X";
  let selected = null;
  let gameOver = false;
  let winningCells = null;
  let history = [];
  let maxPieces = 3; 
  let winLength = 3;

  let playerXName = localStorage.getItem("playerXName") || "Player X";
  let playerOName = localStorage.getItem("playerOName") || "Player O";

  if (playerXInput) playerXInput.value = playerXName;
  if (playerOInput) playerOInput.value = playerOName;
  if (game) game.style.display = "none";

  function getAdjacency(i) {
    const adj = [];
    const row = Math.floor(i / boardSize);
    const col = i % boardSize;

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize) {
          adj.push(r * boardSize + c);
        }
      }
    }
    return adj;
  }

  function render() {
    grid.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    grid.innerHTML = "";

    board.forEach((cell, i) => {
      const div = document.createElement("div");
      div.className = "cell";
      div.textContent = cell || "";

      if (cell === "X") div.classList.add("X");
      if (cell === "O") div.classList.add("O");
      if (i === selected) div.classList.add("selected");

      if (selected !== null && board[i] === null && getAdjacency(selected).includes(i)) {
        div.classList.add("valid");
      }

      if (winningCells && winningCells.includes(i)) {
        div.classList.add("win");
      }

      div.onclick = () => handleClick(i);
      grid.appendChild(div);
    });
  }

  function handleClick(i) {
    if (gameOver) return;
    const pieces = board.filter(c => c === currentPlayer).length;

    if (pieces < maxPieces) {
      if (board[i] === null) {
        history.push([...board]);
        board[i] = currentPlayer;
        endTurn();
      }
      return;
    }

    if (board[i] === currentPlayer) {
      selected = i;
      status.textContent = `${currentPlayer === "X" ? playerXName : playerOName}: select destination`;
      render();
      return;
    }

    if (selected !== null && board[i] === null && getAdjacency(selected).includes(i)) {
      history.push([...board]);
      board[i] = currentPlayer;
      board[selected] = null;
      selected = null;
      endTurn();
    }
  }

  function endTurn() {
    const winPattern = checkWin();

    if (winPattern) {
      winningCells = winPattern;
      gameOver = true;
      status.textContent = `🎉 ${currentPlayer === "X" ? playerXName : playerOName} wins!`;
      
      // Trigger Confetti
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      render();
      showEndButtons();
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    selected = null;
    updateStatusMessage();
    render();
  }

  function updateStatusMessage() {
    const pieces = board.filter(c => c === currentPlayer).length;
    if (pieces === maxPieces && !hasValidMove(currentPlayer)) {
      status.textContent = "🤝 It's a draw!";
      gameOver = true;
      showEndButtons();
      return;
    }

    status.textContent = pieces < maxPieces
      ? `${currentPlayer === "X" ? playerXName : playerOName}: place a piece`
      : `${currentPlayer === "X" ? playerXName : playerOName}: move a piece`;
  }

  function checkWin() {
    const patterns = [];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c <= boardSize - winLength; c++) {
        patterns.push([...Array(winLength)].map((_, i) => r * boardSize + c + i));
      }
    }
    for (let c = 0; c < boardSize; c++) {
      for (let r = 0; r <= boardSize - winLength; r++) {
        patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + c));
      }
    }
    for (let r = 0; r <= boardSize - winLength; r++) {
      for (let c = 0; c <= boardSize - winLength; c++) {
        patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + (c + i)));
      }
    }
    for (let r = 0; r <= boardSize - winLength; r++) {
      for (let c = winLength - 1; c < boardSize; c++) {
        patterns.push([...Array(winLength)].map((_, i) => (r + i) * boardSize + (c - i)));
      }
    }
    return patterns.find(p => p.every(i => board[i] === currentPlayer)) || null;
  }

  function hasValidMove(player) {
    return board.some((cell, i) =>
      cell === player && getAdjacency(i).some(a => board[a] === null)
    );
  }

  function resetGame() {
    board = Array(boardSize * boardSize).fill(null);
    currentPlayer = "X";
    selected = null;
    gameOver = false;
    winningCells = null;
    history = [];
    hideEndButtons();
    updateStatusMessage();
    render();
  }

  function undoMove() {
    if (!history.length || gameOver) return;
    board = history.pop();
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    selected = null;
    updateStatusMessage();
    render();
  }

  function applyBoardSize() {
    boardSize = parseInt(boardSizeSelect.value);
    maxPieces = boardSize; 
    winLength = boardSize;
    resetGame();
  }

  function hideEndButtons() {
    if (playAgainBtn) playAgainBtn.style.display = "none";
    if (newSessionBtn) newSessionBtn.style.display = "none";
    resetBtn.style.display = "inline-block";
    undoBtn.style.display = "inline-block";
  }

  function showEndButtons() {
    if (playAgainBtn) playAgainBtn.style.display = "inline-block";
    if (newSessionBtn) newSessionBtn.style.display = "inline-block";
    resetBtn.style.display = "none";
    undoBtn.style.display = "none";
  }

  // FIXED: Restart button now redirects to the setup page
  if (resetBtn) {
    resetBtn.onclick = () => {
      resetGame();
      game.style.display = "none";
      setup.style.display = "block";
    };
  }

  if (undoBtn) undoBtn.onclick = undoMove;
  if (applySizeBtn) applySizeBtn.onclick = applyBoardSize;
  if (themeBtn) themeBtn.onclick = () => document.body.classList.toggle("dark-mode");
  
  // Play Again stays in the game but resets the board
  if (playAgainBtn) playAgainBtn.onclick = resetGame;

  // New Session goes back to setup
  if (newSessionBtn) {
    newSessionBtn.onclick = () => {
      game.style.display = "none";
      setup.style.display = "block";
    };
  }

  if (startBtn) {
    startBtn.onclick = () => {
      playerXName = playerXInput.value || "Player X";
      playerOName = playerOInput.value || "Player O";
      localStorage.setItem("playerXName", playerXName);
      localStorage.setItem("playerOName", playerOName);
      setup.style.display = "none";
      game.style.display = "block";
      resetGame();
    };
  }
});