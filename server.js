const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve the main index.html file for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Battleships and Subs app running at http://localhost:${port}`);
    console.log(`Press Ctrl+C to stop the server`);
});
