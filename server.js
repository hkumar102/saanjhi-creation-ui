const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the Angular app build directory
app.use(express.static(path.join(__dirname, 'dist/admin-portal/browser')));

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/admin-portal/browser/index.html'));
});

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});