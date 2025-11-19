(function() {
  'use strict';

  console.log('[Inject] Initializing Chess Analyzer for Lichess');

  let chessEngine;
  let currentFen = "";
  let bestMove;
  let webSocketWrapper = null;
  let gameId = null;
  let isWhite = true;
  let timeLimitMs = 50;

  function initializeChessEngine() {
    if (typeof window.STOCKFISH === 'function') {
      chessEngine = window.STOCKFISH();
      chessEngine.postMessage("setoption name Skill Level value 10");
      chessEngine.postMessage("setoption name Hash value 1");
      chessEngine.postMessage("setoption name Threads value 1");
      console.log('[Inject] Chess engine initialized');
    } else {
      console.warn('[Inject] Chess engine not available - loading from CDN');
      loadStockfish();
    }
  }

  function loadStockfish() {
    const script = document.createElement('script');
    script.src = 'https://raw.githubusercontent.com/workinworld/stkfish/refs/heads/main/stockfish8.js';
    script.onload = () => {
      console.log('[Inject] Stockfish loaded from CDN');
      initializeChessEngine();
    };
    script.onerror = () => {
      console.error('[Inject] Failed to load Stockfish');
    };
    document.head.appendChild(script);
  }

  function completeFen(partialFen) {
    let fenParts = partialFen.split(' ');
    
    if (fenParts.length === 6) {
      return partialFen;
    }
    
    if (fenParts.length === 2) {
      fenParts.push('KQkq');
    }
    
    if (fenParts.length === 3) {
      fenParts.push('-');
    }
    
    if (fenParts.length === 4) {
      fenParts.push('0');
    }
    
    if (fenParts.length === 5) {
      fenParts.push('1');
    }
    
    return fenParts.join(' ');
  }

  function interceptWebSocket() {
    console.log('[Inject] Setting up WebSocket interception');
    let webSocket = window.WebSocket;
    const webSocketProxy = new Proxy(webSocket, {
      construct: function (target, args) {
        let wrappedWebSocket = new target(...args);
        webSocketWrapper = wrappedWebSocket;
        console.log('[Inject] WebSocket intercepted');

        wrappedWebSocket.addEventListener("message", function (event) {
          let message;
          try {
            message = JSON.parse(event.data);
          } catch (e) {
            return;
          }

          if (message.type === "gameFull" && message.id) {
            gameId = message.id;
            if (window.lichess && window.lichess.socket && window.lichess.socket.settings) {
              isWhite = message.white.id === window.lichess.socket.settings.userId;
              console.log('[Inject] Game ID:', gameId);
              console.log('[Inject] Playing as white:', isWhite);
            }
          }

          if (message.type === "gameState" && message.status >= 30) {
            handleGameEnd();
          }

          switch (message.t) {
            case 'd':
            case 'move':
              if (message.d && typeof message.d.fen === "string") {
                currentFen = message.d.fen;
                console.log('[Inject] Got FEN:', currentFen);

                let isWhitesTurn = message.d.ply % 2 === 0;

                if (isWhitesTurn) {
                  currentFen += " w";
                } else {
                  currentFen += " b";
                }

                currentFen = completeFen(currentFen);
                calculateMove();
              }
              break;

            case 'clockInc':
            case 'crowd':
            case 'mlat':
              break;

            default:
              break;
          }
        });

        return wrappedWebSocket;
      }
    });

    window.WebSocket = webSocketProxy;
  }

  function calculateMove() {
    if (!chessEngine) {
      console.warn('[Inject] Engine not ready');
      return;
    }
    chessEngine.postMessage("position fen " + currentFen);
    chessEngine.postMessage(`go depth 2 movetime ${timeLimitMs}`);
  }

  function setupChessEngineOnMessage() {
    if (!chessEngine) {
      setTimeout(setupChessEngineOnMessage, 1000);
      return;
    }
    
    chessEngine.onmessage = function (event) {
      if (event && event.includes("bestmove")) {
        bestMove = event.split(" ")[1];
        console.log('[Inject] Best move:', bestMove);
        if (webSocketWrapper) {
          webSocketWrapper.send(JSON.stringify({
            t: "move",
            d: { u: bestMove, b: 1, l: 10000, a: 1 }
          }));
        }
      }
    };
  }

  function handleGameEnd() {
    console.log('[Inject] Game ended');
  }

  function detectBoard() {
    const board = document.querySelector('.cg-wrap') || document.querySelector('.main-board');
    if (board) {
      console.log('[Inject] Board found - ready to send data');
      return true;
    }
    return false;
  }

  function waitForBoard() {
    if (detectBoard()) {
      initializeChessEngine();
      interceptWebSocket();
      setupChessEngineOnMessage();
      console.log('[Inject] Sensor started - using native game API');
    } else {
      setTimeout(waitForBoard, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForBoard);
  } else {
    waitForBoard();
  }
})();
