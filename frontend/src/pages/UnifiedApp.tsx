import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronDown, MapPin, Zap, Users, Play, Upload, 
  Activity, TrendingUp, FileText, MessageSquare, BarChart3
} from 'lucide-react';
import { EnhancedMapView } from '../components/EnhancedMapView';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { CreateAgentModal } from '../components/CreateAgentModal';
import { AddAgentModal } from '../components/AddAgentModal';
import { UploadPolicyModal } from '../components/UploadPolicyModal';
import { projectsApi, agentsApi, simulationsApi } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function UnifiedApp() {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedLayers, setSelectedLayers] = useState(['buildings', 'traffic']);
  const [city, setCity] = useState('San Francisco, CA');
  const [runningSimulation, setRunningSimulation] = useState<string | null>(null);
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const { data: projects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectsApi.list();
      return res.data;
    }
  });

  const { data: agents, refetch: refetchAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await agentsApi.list();
      return res.data;
    }
  });

  const { messages } = useWebSocket();

  // Listen to WebSocket messages and update simulation results
  useEffect(() => {
    if (!runningSimulation) return;

    const simMessages = messages.filter(
      (m) => m.channel === `simulation:${runningSimulation}`
    );

    if (simMessages.length > 0) {
      const latestMessage = simMessages[simMessages.length - 1];
      if (latestMessage.data.results) {
        setSimulationResults(latestMessage.data.results);
      }
      if (latestMessage.data.status === 'completed') {
        setRunningSimulation(null);
      }
    }
  }, [messages, runningSimulation]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSimulation = async () => {
    if (!selectedProject) {
      alert('⚠️ Please select a project first!');
      return;
    }
    try {
      setSimulationResults(null);
      const response = await simulationsApi.create({
        projectId: selectedProject,
        city,
        timeHorizon: 10
      });
      setRunningSimulation(response.data.id);
      
      // Scroll to map to watch it
      scrollToSection('map');
      
      alert('✅ Simulation started! Scroll to map to watch live updates!');
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('❌ Simulation failed to start. Check console for details.');
    }
  };

  return (
    <div className="relative bg-black">
      {/* SECTION 1: HERO LANDING */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-8 max-w-6xl">
          <div className="mb-8 inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/50 animate-pulse">
              <MapPin className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-8xl font-black text-white mb-6 tracking-tight">
            URBAN
          </h1>
          
          <p className="text-3xl text-white/70 mb-4 font-light tracking-wide">
            AI-Powered Policy Simulation
          </p>
          
          <div className="relative inline-block mb-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
            <div className="relative bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl px-12 py-6">
              <p className="text-white/90 text-xl font-light leading-relaxed max-w-3xl">
                Simulate government policies with AI agents. <br/>
                Real data. Real impact. Real-time analysis.
              </p>
            </div>
          </div>

          <div className="flex gap-6 justify-center mb-16">
            <button
              onClick={() => scrollToSection('map')}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 px-12 py-5 rounded-2xl font-bold text-xl text-white flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                Explore Map
              </div>
            </button>

            <button
              onClick={() => scrollToSection('projects')}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-green-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-black border-2 border-white/30 px-12 py-5 rounded-2xl font-bold text-xl text-white flex items-center gap-3 hover:border-white/60 transition">
                <Zap className="w-6 h-6" />
                Get Started
              </div>
            </button>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={() => scrollToSection('map')}
            className="animate-bounce"
          >
            <ChevronDown className="w-12 h-12 text-white/50 mx-auto" />
          </button>
        </div>
      </section>

      {/* SECTION 2: FULL-SCREEN MAP */}
      <section id="map" className="relative h-screen">
        <div className="absolute inset-0">
          <EnhancedMapView
            city={city}
            layers={selectedLayers}
            simulationData={simulationResults}
          />
        </div>

        {/* Live Simulation Feed - RIGHT SIDE */}
        {runningSimulation && (
          <div className="absolute top-8 right-8 z-20 w-96">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
              <div className="relative bg-black/90 backdrop-blur-3xl border border-white/30 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-500"></div>
                  <h3 className="text-white font-bold text-xl">🔬 SIMULATION RUNNING</h3>
                </div>
                
                {/* Live Messages */}
                <div className="space-y-2 max-h-96 overflow-auto font-mono text-sm">
                  {messages
                    .filter((m) => m.channel === `simulation:${runningSimulation}`)
                    .slice(-15)
                    .map((msg, i) => (
                      <div key={i} className="text-green-300 flex items-start gap-2 animate-in fade-in slide-in-from-right duration-300">
                        <span className="text-green-400 mt-1">▶</span>
                        <span>{msg.data.message || msg.data.token || 'Processing...'}</span>
                      </div>
                    ))}
                </div>

                {/* Results Preview */}
                {simulationResults && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                      📊 Live Metrics
                    </h4>
                    <div className="space-y-2">
                      {simulationResults.metrics && Object.entries(simulationResults.metrics.changes || {}).slice(0, 3).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-white/70 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className={`font-bold ${value.percentage > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {value.percentage > 0 ? '+' : ''}{value.percentage?.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls */}
        <div className="absolute top-8 left-8 z-20 space-y-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-75"></div>
            <div className="relative bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-purple-400" />
                Location
              </h3>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-80 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="Enter city..."
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75"></div>
            <div className="relative bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-xl mb-4">Layers</h3>
              <div className="space-y-2">
                {[
                  { id: 'buildings', label: '3D Buildings', emoji: '🏢' },
                  { id: 'traffic', label: 'Traffic', emoji: '🚗' },
                  { id: 'housing', label: 'Housing', emoji: '🏠' },
                  { id: 'emissions', label: 'Air Quality', emoji: '🌱' },
                ].map((layer) => (
                  <label
                    key={layer.id}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLayers.includes(layer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLayers([...selectedLayers, layer.id]);
                        } else {
                          setSelectedLayers(selectedLayers.filter(l => l !== layer.id));
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <span className="text-2xl">{layer.emoji}</span>
                    <span className="text-white font-semibold">{layer.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to Next */}
        <button
          onClick={() => scrollToSection('projects')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce"
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full p-4">
            <ChevronDown className="w-8 h-8 text-white" />
          </div>
        </button>
      </section>

      {/* SECTION 3: PROJECTS */}
      <section id="projects" className="relative min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black text-white mb-6">Your Projects</h2>
            <p className="text-2xl text-white/60">Manage policy simulations and scenarios</p>
          </div>

          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowProjectModal(true)}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-2xl font-bold text-lg text-white flex items-center gap-3">
                <Activity className="w-6 h-6" />
                Create New Project
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects?.map((project: any) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project.id)}
                className={`group relative cursor-pointer ${
                  selectedProject === project.id ? 'ring-4 ring-purple-500' : ''
                }`}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-0 group-hover:opacity-75 transition"></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                    📁
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{project.name}</h3>
                  <p className="text-white/60 mb-4">{project.description}</p>
                  <div className="flex items-center gap-4 text-white/50">
                    <span>{project._count?.agents || 0} agents</span>
                    <span>•</span>
                    <span>{project._count?.simulations || 0} sims</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedProject && (
            <div className="mt-12 text-center space-x-6">
              <button
                onClick={() => setShowAddAgentModal(true)}
                className="group relative inline-block"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition"></div>
                <div className="relative bg-black border-2 border-white/30 px-8 py-4 rounded-2xl font-bold text-lg text-white flex items-center gap-3 hover:border-white/60 transition">
                  <Users className="w-6 h-6" />
                  Add Agents
                </div>
              </button>

              <button
                onClick={() => setShowUploadModal(true)}
                className="group relative inline-block"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition"></div>
                <div className="relative bg-black border-2 border-white/30 px-8 py-4 rounded-2xl font-bold text-lg text-white flex items-center gap-3 hover:border-white/60 transition">
                  <Upload className="w-6 h-6" />
                  Upload Policy
                </div>
              </button>

              <button
                onClick={startSimulation}
                className="group relative inline-block"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition"></div>
                <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4 rounded-2xl font-bold text-lg text-white flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  Run Simulation
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Scroll to Next */}
        <button
          onClick={() => scrollToSection('agents')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full p-4">
            <ChevronDown className="w-8 h-8 text-white" />
          </div>
        </button>
      </section>

      {/* SECTION 4: AI AGENTS */}
      <section id="agents" className="relative min-h-screen bg-gradient-to-b from-black via-blue-950/20 to-black py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-6xl font-black text-white mb-6">AI Agents</h2>
            <p className="text-2xl text-white/60">Intelligent policy analysis and simulation</p>
          </div>

          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowAgentModal(true)}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-4 rounded-2xl font-bold text-lg text-white flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Create New Agent
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {agents?.map((agent: any) => (
              <div key={agent.id} className="group relative">
                <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-0 group-hover:opacity-75 transition ${
                  agent.type === 'SIMULATION' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                  agent.type === 'DEBATE' ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                  agent.type === 'AGGREGATOR' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                  'bg-gradient-to-r from-blue-600 to-cyan-600'
                }`}></div>
                <div className="relative bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${
                      agent.type === 'SIMULATION' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      agent.type === 'DEBATE' ? 'bg-gradient-to-br from-orange-500 to-red-500' :
                      agent.type === 'AGGREGATOR' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      {agent.type === 'SIMULATION' ? '🔬' :
                       agent.type === 'DEBATE' ? '💬' :
                       agent.type === 'AGGREGATOR' ? '📄' : '🎯'}
                    </div>
                    <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                      agent.status === 'ACTIVE'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{agent.name}</h3>
                  <p className="text-white/60 mb-4">{agent.role}</p>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm font-medium">
                      {agent.type}
                    </span>
                    <span className="text-white/50 text-sm">
                      {agent._count?.simulations || 0} runs
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll to Top */}
        <button
          onClick={() => scrollToSection('hero')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-full p-4 rotate-180">
            <ChevronDown className="w-8 h-8 text-white" />
          </div>
        </button>
      </section>

      {/* MODALS */}
      {showProjectModal && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onSuccess={() => {
            refetchProjects();
            setShowProjectModal(false);
          }}
        />
      )}

      {showAgentModal && (
        <CreateAgentModal
          onClose={() => setShowAgentModal(false)}
          onSuccess={() => {
            refetchAgents();
            setShowAgentModal(false);
          }}
        />
      )}

      {selectedProject && showAddAgentModal && (
        <AddAgentModal
          projectId={selectedProject}
          onClose={() => setShowAddAgentModal(false)}
          onSuccess={() => {
            setShowAddAgentModal(false);
            alert('✅ Agents added to project successfully!');
          }}
        />
      )}

      {selectedProject && showUploadModal && (
        <UploadPolicyModal
          projectId={selectedProject}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            alert('✅ Policy document uploaded successfully!');
          }}
        />
      )}
    </div>
  );
}

