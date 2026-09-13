import { TaskInput } from './components/TaskInput'
import { TaskItem } from './components/TaskItem'
import { useTasks } from './hooks/useTasks'

function App() {
  const {
    activeTasks,
    completedTasks,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
  } = useTasks()

  const isEmpty = activeTasks.length === 0 && completedTasks.length === 0

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.35em] text-ink-soft/80">DAILY CALM</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">今日待办</h1>
          <p className="mt-2 text-sm text-ink-soft">慢慢来，一件一件完成就好</p>
        </header>

        <div className="rounded-3xl border border-white/60 bg-white/40 p-4 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.5)] backdrop-blur-xl sm:p-6">
          <TaskInput onAdd={addTask} />

          <div className="mt-5">
            {isEmpty ? (
              <EmptyState />
            ) : (
              <div className="space-y-5">
                {activeTasks.length > 0 && (
                  <ul className="space-y-1">
                    {activeTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onEdit={editTask}
                        onDelete={deleteTask}
                      />
                    ))}
                  </ul>
                )}

                {completedTasks.length > 0 && (
                  <section>
                    <h2 className="px-3 pb-1 text-xs font-medium tracking-wider text-ink-soft/80">
                      已完成 · {completedTasks.length}
                    </h2>
                    <ul className="space-y-1">
                      {completedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onEdit={editTask}
                          onDelete={deleteTask}
                        />
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-soft/70">
          双击任务即可编辑 · 数据保存在本机
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-sage-soft/50">
        <svg viewBox="0 0 24 24" className="size-7 text-sage" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 10 17.5 19 7" />
        </svg>
      </div>
      <p className="mt-4 text-sm text-ink-soft">今天还没有任务，享受这份清净吧</p>
    </div>
  )
}

export default App
