# Chess Board Editor

A standalone HTML-based chess board editor for setting up and analyzing chess positions. This tool allows you to create custom chess positions and export them in FEN (Forsyth–Edwards Notation) format for use with chess engines.

## Features

### Core Functionality
- **Visual Board Editor**: Click to place pieces on an 8x8 chess board
- **Piece Palette**: Select from all chess pieces (white and black)
- **Position Management**: Start position, clear board, and delete pieces
- **FEN Import/Export**: Load and save positions using standard FEN notation

### Chess Rules Configuration
- **Turn Selection**: Choose which side moves next (White or Black)
- **Castling Rights**: Configure king-side and queen-side castling for both colors
- **Position Validation**: Ensures proper FEN format

## Usage

### Opening the Editor

Simply open `board-editor.html` in any modern web browser:

```bash
# Open with default browser
open board-editor.html           # macOS
start board-editor.html          # Windows
xdg-open board-editor.html       # Linux
```

Or double-click the `board-editor.html` file.

### Creating a Position

1. **Select a Piece**: Click any piece from the piece selector palette
2. **Place on Board**: Click any square on the board to place the selected piece
3. **Delete Pieces**: Click the "Delete Piece" button, then click squares to remove pieces
4. **Clear Board**: Use "Clear Board" to start fresh
5. **Start Position**: Use "Start Position" to load the standard chess starting position

### Configuring Rules

- **Turn**: Click "White" or "Black" to set whose turn it is
- **Castling**: Check/uncheck the castling rights for each side
  - White King-side (K)
  - White Queen-side (Q)
  - Black King-side (k)
  - Black Queen-side (q)

### Working with FEN

#### Exporting Position
The FEN string is automatically updated as you edit the board. To copy it:
1. The FEN appears in the textarea at the bottom
2. Click "Copy FEN" to copy it to your clipboard

#### Importing Position
To load a position from FEN:
1. Click "Load FEN"
2. Paste or type your FEN string
3. Click OK

## FEN Format

The editor generates and accepts FEN strings in the standard format:

```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

Components:
1. **Board position**: Piece placement (/ separates ranks)
2. **Active color**: w (white) or b (black)
3. **Castling**: K/Q/k/q (king/queen side for white/black)
4. **En passant**: Target square (or -)
5. **Halfmove clock**: Moves since last capture/pawn move
6. **Fullmove number**: Current move number

## Integration with lbot

This board editor can be used with the lbot chess analysis tools:

### Using with Stockfish Engine

After setting up a position:

1. Copy the FEN string from the board editor
2. Use it with the Stockfish engine in your bot scripts:

```javascript
// In your chess bot script
const positionFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
chessEngine.postMessage("position fen " + positionFEN);
chessEngine.postMessage("go depth 8");
```

### Using with Lichess Bot

The FEN can be used to set up specific positions for testing:

```javascript
// Set current position
currentFen = "your-fen-from-editor";
calculateMove();
```

## Keyboard Shortcuts

- Click piece selector to choose a piece
- Click board squares to place/remove pieces
- Use buttons for quick actions

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Technical Details

- **No Dependencies**: Pure HTML/CSS/JavaScript
- **Offline**: Works without internet connection
- **Lightweight**: Single file, ~16KB
- **Responsive**: Adapts to different screen sizes

## Limitations

- En passant square must be manually set in FEN (not in UI)
- No move validation or legal move checking
- No drag-and-drop (click-to-place only)

## Related Files

- `newengine1.js` - JavaScript chess engine integration
- `script.user.js` - Lichess bot userscript
- `Lichess Bot v5` - Main bot script with FEN handling

## References

Inspired by:
- [Lichess Board Editor](https://lichess.org/editor)
- [@reductionfear/vdchess Issue #7](https://github.com/reductionfear/vdchess/issues/7)
- FEN Notation: [Wikipedia](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)

## License

Part of the lbot project. Use freely for chess analysis and bot testing.
