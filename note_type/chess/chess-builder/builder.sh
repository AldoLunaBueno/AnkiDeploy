rm -rf node_modules _chess_bundle.js package-lock.json package.json
npm install cm-chessboard esbuild chess.js
./node_modules/.bin/esbuild entry.js --bundle --minify --outfile=_chess_bundle.js