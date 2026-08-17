import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import SimulatorPage from './pages/SimulatorPage'
import CircuitsPage from './pages/CircuitsPage'
import TeamsPage from './pages/TeamsPage'
import CalendarPage from './pages/CalendarPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<SimulatorPage />} />
            <Route path="/circuits" element={<CircuitsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
