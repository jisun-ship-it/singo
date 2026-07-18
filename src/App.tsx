import { Landing } from './pages/Landing'
import { Settings } from './pages/Settings'

export function App() {
  const connected = new URLSearchParams(window.location.search).get('connected') === 'true'
  return connected ? <Settings /> : <Landing />
}
