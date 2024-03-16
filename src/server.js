const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to SQLite database
const db = new sqlite3.Database('tasks.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to database');
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            completed BOOLEAN DEFAULT 'Incomplete'
        )`, (err) => {
            if (err) {
                console.error('Error creating tasks table:', err.message);
            } else {
                console.log('Tasks table created successfully');
            }
        });
    }
});


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON request bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Routes...

// Get all tasks
app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tasks", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.patch('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    // Ensure completed is a valid boolean value
    if (typeof completed !== 'integer') {
        return res.status(400).json({ error: 'Invalid value for completed field' });
    }

    // Update the task's completion status in the database
    db.run("UPDATE tasks SET completed=? WHERE id=?", [completed, id], function(err) {
        if (err) {
            console.error('Error updating task:', err.message);
            return res.status(500).json({ error: 'Failed to update task' });
        }
        res.json({ message: "Task updated successfully" });
    });
});
// Create a new task
app.post('/tasks', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Task name is required" });
    }
    db.run("INSERT INTO tasks (name) VALUES (?)", [name], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name });
    });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM tasks WHERE id=?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Task deleted successfully" });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
