import { useEffect } from 'react'
import App from './App'
import { LandingPage } from './landing/LandingPage'

function isAppPath(path: string): boolean {
  return path === '/app' || path.startsWith('/app/')
}

export function Root() {
  const app = isAppPath(window.location.pathname)

  useEffect(() => {
    document.title = app
      ? '今日待办 · Daily Calm'
      : '今日待办 · Daily Calm｜清新治愈的待办应用'
  }, [app])

  return app ? <App /> : <LandingPage />
}
