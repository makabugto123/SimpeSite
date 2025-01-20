const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Path to the JSON file
const poetsFile = path.join(__dirname, 'history.json');

// Sidebar HTML (shared by all pages)
const sidebarHTML = `
  <div class="sidebar">
    <h2>Menu</h2>
    <a href="/">Home</a>
    <a href="/post-poet">Post Poet</a>
    <a href="/random-poet-page">Random Poet</a>
  </div>
`;

// Base CSS (shared by all pages)
const baseCSS = `
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
    }
    .sidebar {
      width: 200px;
      background: #333;
      color: white;
      height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }
    .sidebar a {
      display: block;
      color: white;
      text-decoration: none;
      margin-bottom: 10px;
    }
    .sidebar a:hover {
      text-decoration: underline;
    }
    .content {
      flex: 1;
      padding: 20px;
      background: #f4f4f9;
      box-sizing: border-box;
    }
    h1 {
      color: #444;
    }
    form label {
      display: block;
      margin-top: 10px;
    }
    form input[type="text"] {
      width: 100%;
      padding: 8px;
      margin-top: 5px;
      margin-bottom: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    button {
      padding: 10px 15px;
      background-color: #007BFF;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    p {
      color: #666;
    }
  </style>
`;

// Serve the main page with sidebar
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Poet App</title>
        ${baseCSS}
      </head>
      <body>
        ${sidebarHTML}
        <div class="content">
          <h1>Welcome to Poet App</h1>
          <p>Select an option from the sidebar to get started.</p>
        </div>
      </body>
    </html>
  `);
});

// Serve the "Post Poet" page
app.get('/post-poet', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Post Poet</title>
        ${baseCSS}
        <style>
          textarea {
            width: 100%;
            height: 150px;
            padding: 8px;
            margin-top: 5px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            resize: vertical;
          }
        </style>
      </head>
      <body>
        ${sidebarHTML}
        <div class="content">
          <h1>Post Poet</h1>
          <form method="POST" action="/save">
            <label for="author">Author:</label>
            <input type="text" id="author" name="author" required />
            <label for="text">Text:</label>
            <textarea id="text" name="text" required></textarea>
            <button type="submit">Save Poet</button>
          </form>
        </div>
      </body>
    </html>
  `);
});


// Serve the "Random Poet" page
app.get('/random-poet-page', (req, res) => {
  fs.readFile(poetsFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the poets file.');
    }

    const poets = data ? JSON.parse(data) : [];
    if (poets.length === 0) {
      return res.send(`
        <html>
          <head>
            <title>Random Poet</title>
            ${baseCSS}
          </head>
          <body>
            ${sidebarHTML}
            <div class="content">
              <h1>Random Poet</h1>
              <p>No poets found.</p>
            </div>
          </body>
        </html>
      `);
    }

    const randomPoet = poets[Math.floor(Math.random() * poets.length)];
    res.send(`
      <html>
        <head>
          <title>Random Poet</title>
          ${baseCSS}
        </head>
        <body>
          ${sidebarHTML}
          <div class="content">
            <h1>Random Poet</h1>
            <p><strong>Author:</strong> ${randomPoet.author}</p>
            <p><strong>Text:</strong> ${randomPoet.text}</p>
          </div>
        </body>
      </html>
    `);
  });
});

// Serve a random poet in JSON format
app.get('/random-poet', (req, res) => {
  fs.readFile(poetsFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading the poets file.' });
    }

    const poets = data ? JSON.parse(data) : [];
    if (poets.length === 0) {
      return res.json({ error: 'No poets found.' });
    }

    const randomPoet = poets[Math.floor(Math.random() * poets.length)];
    res.json(randomPoet);
  });
});

// Save poet data
app.post('/save', (req, res) => {
  const { author, text } = req.body;

  if (!author || !text) {
    return res.status(400).send('Author and text are required.');
  }

  fs.readFile(poetsFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    const poets = data ? JSON.parse(data) : [];
    poets.push({ author, text });

    fs.writeFile(poetsFile, JSON.stringify(poets, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving the poet.');
      }
      res.redirect('/');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

