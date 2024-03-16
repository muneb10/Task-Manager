document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const tasksList = document.getElementById('tasksList');

    // Function to fetch tasks from the server and display them
// Function to fetch tasks from the server and display them
const fetchTasks = async () => {
    try {
        const response = await fetch('http://localhost:3000/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const tasks = await response.json();
        tasksList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            // Create task item elements
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed; // Set checkbox state based on task completion
            checkbox.dataset.taskId = task.id; // Set dataset attribute for task ID
            const span = document.createElement('span');
            span.textContent = task.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            
            // Add event listener for checkbox change
            tasksList.addEventListener('change', async (event) => {
                if (event.target.classList.contains('taskCheckbox')) {
                    const taskId = event.target.dataset.taskId; // Retrieve task ID from data attribute
                    const completed = event.target.checked;
            
                    try {
                        // Send a PATCH request to update task completion status
                        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, { 
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ completed })
                        });
                        if (!response.ok) {
                            throw new Error('Failed to update task');
                        }
                    } catch (error) {
                        console.error('Error updating task:', error.message);
                    }
                }
            });

            // Add event listener for delete button click
            deleteButton.addEventListener('click', async () => {
                const taskId = checkbox.dataset.taskId;
                try {
                    // Send a DELETE request to delete the task
                    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, { method: 'DELETE' });
                    if (!response.ok) {
                        throw new Error('Failed to delete task');
                    }
                    li.remove(); // Remove task item from the list
                } catch (error) {
                    console.error('Error deleting task:', error.message);
                }
            });

            // Append elements to task item
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteButton);
            tasksList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
    }
};

// Event listener for form submission
taskForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    const taskName = taskInput.value.trim();
    if (taskName === '') return; // Ignore empty task names

    try {
        // Send a POST request to add a new task
        const response = await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: taskName })
        });
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        await fetchTasks(); // Fetch and display updated task list
    } catch (error) {
        console.error('Error adding task:', error.message);
    }

    taskInput.value = ''; // Clear the input field
});

// Fetch and display initial tasks
fetchTasks();

});
