import { useAppContext } from "../context/Appcomponet.jsx";

function Taskeditor() {

    const{activeTab, setActiveTab,
      darkMode, setDarkMode,
      searchQuery, setSearchQuery,
      selectedDate, setSelectedDate,
      selectedTag, setSelectedTag,
      showEditor, setShowEditor,
      editingEntry, setEditingEntry,
      showTaskEditor, setShowTaskEditor,
      editingTask, setEditingTask,
      journalEntries, setJournalEntries,
      tasks, setTasks,
      newEntry, setNewEntry,
      newTask, setNewTask,
      extractTags,
      countWords,
      allTags,
      filteredEntries,
      filteredTasks,
      saveEntry,
      deleteEntry,
      editEntry,
      saveTask,
      deleteTask,
      toggleTask,
      editTask,
      exportData,
      themeClasses,
      cardClasses,
      inputClasses,}=useAppContext();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardClasses} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className={`w-full p-3 border rounded-lg ${inputClasses}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                  className={`w-full h-24 p-3 border rounded-lg resize-none ${inputClasses}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className={`w-full p-3 border rounded-lg ${inputClasses}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`w-full p-3 border rounded-lg ${inputClasses}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTask.tags.join(', ')}
                  onChange={(e) => setNewTask({ 
                    ...newTask, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                  })}
                  placeholder="work, urgent, personal"
                  className={`w-full p-3 border rounded-lg ${inputClasses}`}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTaskEditor(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', tags: [] });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTask ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
  )
}

export default Taskeditor;
