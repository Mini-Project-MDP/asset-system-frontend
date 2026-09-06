import { AppProvider } from './app/providers/AppProvider'
import { Router } from './app/router'
import './App.css'

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}

export default App
