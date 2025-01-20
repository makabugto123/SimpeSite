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
const poetsFile = path.join(__dirname, 'poet.json');

// Serve the form
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Poet Entry</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f9;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .container {
            background: #fff;
            padding: 20px 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 300px;
            text-align: center;
          }
          h1 {
            color: #444;
            font-size: 24px;
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
          }
          input[type="text"] {
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          button {
            padding: 10px 20px;
            background-color: #007BFF;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover {
            background-color: #0056b3;
          }
          .error {
            color: #d9534f;
            margin-bottom: 15px;
            font-size: 14px;
          }
          a {
            text-decoration: none;
            color: #007BFF;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Create a Poet Entry</h1>
          <form method="POST" action="/save">
            <label for="author">Author</label>
            <input type="text" id="author" name="author" placeholder="Enter the author's name" />
            <label for="text">Text</label>
            <input type="text" id="text" name="text" placeholder="Enter the text" />
            <button type="submit">Save</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Save poet data
app.post('/save', (req, res) => {
  const { author, text } = req.body;

  // Validation
  if (!author || !text) {
    let errorMessage = '';
    if (!author) errorMessage += 'Author is empty. ';
    if (!text) errorMessage += 'Text is empty. ';
    return res.status(400).send(`
      <html>
        <head>
          <title>Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .container {
              text-align: center;
              background: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              width: 300px;
            }
            h3 {
              color: #d9534f;
            }
            a {
              text-decoration: none;
              color: #007BFF;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Error: ${errorMessage}</h3>
            <a href="/">Go Back</a>
          </div>
        </body>
      </html>
    `);
  }

  // Read the existing poets
  fs.readFile(poetsFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file.');
    }

    const poets = data ? JSON.parse(data) : [];
    const newPoet = { author, text };

    // Add new poet
    poets.push(newPoet);

    // Save to the file
    fs.writeFile(poetsFile, JSON.stringify(poets, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error saving the poet.');
      }
      res.send(`
        <html>
          <head>
            <title>Success</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              .container {
                text-align: center;
                background: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                width: 300px;
              }
              h3 {
                color: #5cb85c;
              }
              a {
                text-decoration: none;
                color: #007BFF;
              }
              a:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h3>Poet saved successfully!</h3>
              <a href="/">Create Another</a>
            </div>
          </body>
        </html>
      `);
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
