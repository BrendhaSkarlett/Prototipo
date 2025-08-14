import React, { useState } from 'react';

const KanbanForm = ({ onAddTask }) => {
    const [task, setTask] = useState('');
    const [category, setCategory] = useState('To Do');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (task.trim()) {
            onAddTask({ task, category });
            setTask('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="kanban-form">
            <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter task"
                required
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
            </select>
            <button type="submit">Add Task</button>
        </form>
    );
};

export default KanbanForm;