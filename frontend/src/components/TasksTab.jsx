import RoleGuard from './RoleGuard';

// TasksTab: shows the project roadmap with role-based controls.
// - Clients see task status as a read-only badge
// - Developers and Admins can change task status via a dropdown
// - Only Admins can delete tasks

export default function TasksTab({
  currentUser,
  tasks,
  taskTitle,
  setTaskTitle,
  onCreateTask,
  onUpdateStatus,
  onDeleteTask,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-xl font-bold text-slate-900">Project Roadmap</h3>
      </div>

      {/* Only team members (admin + developer) can add tasks */}
      <RoleGuard allow={['admin', 'developer']}>
        <form onSubmit={onCreateTask} className="flex gap-3 mb-8 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <input
            type="text"
            placeholder="Add a new milestone or task..."
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
            className="flex-1 px-3 py-2 outline-none bg-transparent text-sm"
          />
          <button type="submit" className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
            Add Task
          </button>
        </form>
      </RoleGuard>

      <ul className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-sm">
            Project roadmap is currently empty.
          </div>
        ) : (
          tasks.map((task) => (
            <li key={task._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 transition-colors group flex items-center justify-between gap-4">
              <div className="flex-1">
                <strong className="text-slate-900 font-semibold block mb-1">{task.title}</strong>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Assigned to: {task.assignee ? task.assignee.name : 'Unassigned'}
                </p>
              </div>

              {/* Clients see a read-only status badge */}
              <RoleGuard
                allow={['client']}
                fallback={
                  /* Team members see a status dropdown + admin delete button */
                  <div className="flex items-center gap-3">
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateStatus(task._id, e.target.value, task.title)}
                      className="text-xs font-medium rounded-md px-2.5 py-1.5 border cursor-pointer outline-none bg-white"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    {/* Only admins can delete */}
                    <RoleGuard allow={['admin']}>
                      <button
                        onClick={() => onDeleteTask(task._id)}
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-md hover:bg-slate-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        ✕
                      </button>
                    </RoleGuard>
                  </div>
                }
              >
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${task.status === 'Done' ? 'bg-green-100 text-green-700' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  {task.status}
                </span>
              </RoleGuard>

            </li>
          ))
        )}
      </ul>
    </div>
  );
}
