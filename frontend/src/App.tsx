import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UnifiedApp from './pages/UnifiedApp';
import TestPage from './pages/TestPage';
import UnifiedDashboard from './pages/UnifiedDashboard';
import { LandingPage } from './pages/LandingPage';
import { CinematicDashboard } from './pages/CinematicDashboard';
import { SimulationCanvas } from './pages/SimulationCanvas';
import { DebateView } from './pages/DebateView';
import { ReportBuilder } from './pages/ReportBuilder';
import { StreamingConsole } from './pages/StreamingConsole';
import { ProjectDetail } from './pages/ProjectDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UnifiedApp />} />
        <Route path="/old" element={<LandingPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/unified" element={<UnifiedDashboard />} />
        <Route path="/dashboard" element={<CinematicDashboard />} />
        <Route path="/app">
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<CinematicDashboard />} />
          <Route path="projects/:projectId" element={<ProjectDetail />} />
          <Route path="simulation/:simulationId?" element={<SimulationCanvas />} />
          <Route path="debate/:debateId?" element={<DebateView />} />
          <Route path="reports/:reportId?" element={<ReportBuilder />} />
          <Route path="console" element={<StreamingConsole />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;


