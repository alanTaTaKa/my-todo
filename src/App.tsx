import { useState } from 'react'
import { AuthPanel } from './components/AuthPanel'
import { FilterBar } from './components/FilterBar'
import { Pagination } from './components/Pagination'
import { RecycleBin } from './components/RecycleBin'
import { StatsPanel } from './components/StatsPanel'
import { TagManager } from './components/TagManager'
import { TaskInput } from './components/TaskInput'
import { TaskItem } from './components/TaskItem'
import { ThemePanel } from './components/ThemePanel'
import { VersionPanel } from './components/VersionPanel'
import { useAuth } from './hooks/useAuth'
import { useSync } from './hooks/useSync'
import { useTags } from './hooks/useTags'
import { useTasks } from './hooks/useTasks'
import { useTheme } from './hooks/useTheme'
import { matchesDateFilter } from './lib/date'
import { sortTasks } from './lib/sort'
import { CURRENT_VERSION } from './lib/version'
import type { DateFilter, SortDirection, SortKey, StatusFilter, Task } from './types'

function App() {
  const {
    activeTasks,
    completedTasks,
    deletedTasks,
    allTasks,
    addTask,
    toggleTask,
    updateTask,
    detachTag,
    deleteTask,
    restoreTask,
    purgeTask,
    emptyTrash,
    mergeTasks,
  } = useTasks()
  const { tags, allTags, addTag, renameTag, deleteTag, mergeTags } = useTags()
  const {
    themeId,
    setThemeId,
    customPalette,
    applyCustomTheme,
    savedPalettes,
    addSavedPalette,
    renameSavedPalette,
    deleteSavedPalette,
  } = useTheme()

  const { user, loading: authLoading, register, login, logout } = useAuth()

  const {
    status: syncStatus,
    lastSyncedAt,
    error: syncError,
    syncNow,
  } = useSync({ user, tasks: allTasks, tags: allTags, mergeTasks, mergeTags })

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [tagsOpen, setTagsOpen] = useState(false)
  const [binOpen, setBinOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [versionOpen, setVersionOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filterSignature = [
    query,
    status,
    dateFilter,
    activeTagId,
    sortKey,
    sortDirection,
    pageSize,
  ].join('|')
  const [prevSignature, setPrevSignature] = useState(filterSignature)
  if (prevSignature !== filterSignature) {
    setPrevSignature(filterSignature)
    setPage(1)
  }

  const handleDeleteTag = (id: string) => {
    deleteTag(id)
    detachTag(id)
    if (activeTagId === id) setActiveTagId(null)
  }

  const handleSortKeyChange = (key: SortKey) => {
    setSortKey(key)
    setSortDirection(key === 'dueDate' ? 'asc' : 'desc')
  }

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  const keyword = query.trim().toLowerCase()
  const matches = (task: Task) => {
    if (status === 'active' && task.completed) return false
    if (status === 'completed' && !task.completed) return false
    if (activeTagId && !task.tagIds.includes(activeTagId)) return false
    if (!matchesDateFilter(task.dueDate, dateFilter, task.completed)) return false
    if (keyword && !task.title.toLowerCase().includes(keyword)) return false
    return true
  }

  const filteredActive = activeTasks.filter(matches)
  const filteredCompleted = completedTasks.filter(matches)

  const sortedActive = sortTasks(filteredActive, sortKey, sortDirection)
  const sortedCompleted = sortTasks(filteredCompleted, sortKey, sortDirection)

  const ordered = [...sortedActive, ...sortedCompleted]
  const totalItems = ordered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const pageItems = ordered.slice(start, start + pageSize)
  const pageActive = pageItems.filter((task) => !task.completed)
  const pageCompleted = pageItems.filter((task) => task.completed)

  const isEmpty = activeTasks.length === 0 && completedTasks.length === 0
  const hasNoMatches = !isEmpty && totalItems === 0

  const statsTasks = [...activeTasks, ...completedTasks]

  return (
    <div className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-8 text-center">
          <p className="text-xs tracking-[0.35em] text-ink-soft/80">DAILY CALM</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">今日待办</h1>
          <p className="mt-2 text-sm text-ink-soft">慢慢来，一件一件完成就好</p>
        </header>

        <div className="rounded-3xl border border-line bg-surface p-4 shadow-[0_24px_70px_-35px_rgba(122,101,60,0.5)] backdrop-blur-xl sm:p-6">
          <TaskInput onAdd={addTask} />

          <FilterBar
            query={query}
            onQueryChange={setQuery}
            status={status}
            onStatusChange={setStatus}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            tags={tags}
            activeTagId={activeTagId}
            onTagChange={setActiveTagId}
            sortKey={sortKey}
            onSortKeyChange={handleSortKeyChange}
            sortDirection={sortDirection}
            onToggleSortDirection={toggleSortDirection}
            tagsOpen={tagsOpen}
            onToggleTags={() => setTagsOpen((prev) => !prev)}
          />

          {tagsOpen && (
            <div className="mt-3">
              <TagManager
                tags={tags}
                onAdd={addTag}
                onRename={renameTag}
                onDelete={handleDeleteTag}
              />
            </div>
          )}

          <div className="mt-5">
            {isEmpty ? (
              <EmptyState />
            ) : hasNoMatches ? (
              <NoMatchState />
            ) : (
              <>
                <div className="space-y-5">
                  {pageActive.length > 0 && (
                    <ul className="space-y-1">
                      {pageActive.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          tags={tags}
                          onToggle={toggleTask}
                          onUpdate={updateTask}
                          onDelete={deleteTask}
                        />
                      ))}
                    </ul>
                  )}

                  {pageCompleted.length > 0 && (
                    <section>
                      <h2 className="flex items-center gap-1.5 px-3 pb-1 text-xs font-medium tracking-wider text-ink-soft/80">
                        <span className="size-1.5 rounded-full bg-sage" />
                        已完成 · {filteredCompleted.length}
                      </h2>
                      <ul className="space-y-1">
                        {pageCompleted.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            tags={tags}
                            onToggle={toggleTask}
                            onUpdate={updateTask}
                            onDelete={deleteTask}
                          />
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-center text-xs text-ink-soft/70">
            双击任务即可编辑 · 数据保存在本机
          </p>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setStatsOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink-soft transition hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
              </svg>
              统计
            </button>
            <button
              type="button"
              onClick={() => setBinOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink-soft transition hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
              回收站{deletedTasks.length > 0 && ` · ${deletedTasks.length}`}
            </button>
            <button
              type="button"
              onClick={() => setThemeOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink-soft transition hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-6.9-9-6.9Z" />
                <circle cx="7.5" cy="11" r="1" fill="currentColor" />
                <circle cx="10.5" cy="7.5" r="1" fill="currentColor" />
                <circle cx="15" cy="8" r="1" fill="currentColor" />
              </svg>
              主题
            </button>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink-soft transition hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
              </svg>
              账号
              {user && <span className="size-1.5 rounded-full bg-sage" />}
            </button>
            <button
              type="button"
              onClick={() => setVersionOpen(true)}
              aria-label={`当前版本 v${CURRENT_VERSION}，查看更新内容`}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink-soft transition hover:text-ink"
            >
              v{CURRENT_VERSION}
            </button>
          </div>
        </div>
      </div>

      {versionOpen && (
        <VersionPanel onClose={() => setVersionOpen(false)} />
      )}

      {themeOpen && (
        <ThemePanel
          themeId={themeId}
          customPalette={customPalette}
          savedPalettes={savedPalettes}
          onSelect={setThemeId}
          onSelectCustom={applyCustomTheme}
          onAddSavedPalette={addSavedPalette}
          onRenameSavedPalette={renameSavedPalette}
          onDeleteSavedPalette={deleteSavedPalette}
          onClose={() => setThemeOpen(false)}
        />
      )}

      {accountOpen && (
        <AuthPanel
          user={user}
          loading={authLoading}
          syncStatus={syncStatus}
          lastSyncedAt={lastSyncedAt}
          syncError={syncError}
          onLogin={login}
          onRegister={register}
          onLogout={logout}
          onSync={syncNow}
          onClose={() => setAccountOpen(false)}
        />
      )}

      {statsOpen && (
        <StatsPanel
          tasks={statsTasks}
          tags={tags}
          onClose={() => setStatsOpen(false)}
        />
      )}

      {binOpen && (
        <RecycleBin
          tasks={deletedTasks}
          onClose={() => setBinOpen(false)}
          onRestore={restoreTask}
          onPurge={purgeTask}
          onEmpty={emptyTrash}
        />
      )}
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

function NoMatchState() {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-ink-soft">没有找到匹配的任务</p>
      <p className="mt-1 text-xs text-ink-soft/70">试试换个关键词或筛选条件</p>
    </div>
  )
}

export default App
