import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cpu,
  Factory,
  Gauge,
  HeartHandshake,
  Play,
  Radar,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  Trophy,
  Upload,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  Radar as RadarShape,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Track = 'industrial' | 'care'

type Robot = {
  id: string
  name: string
  vendor: string
  model: string
  track: Track
  status: string
  payloadKg: number
  heightCm: number
  batteryHr: number
  link: string
  scores: Record<'mobility' | 'manipulation' | 'autonomy' | 'safety' | 'endurance' | 'hri', number>
}

type Task = {
  id: string
  name: string
  weight: number
  difficulty: string
  target: string
}

const robots: Robot[] = [
  {
    id: 'apollo',
    name: 'Apptronik Apollo',
    vendor: 'Apptronik',
    model: 'Apollo',
    track: 'industrial',
    status: 'Pilot deployments',
    payloadKg: 25,
    heightCm: 173,
    batteryHr: 4,
    link: 'https://apptronik.com/apollo',
    scores: { mobility: 83, manipulation: 78, autonomy: 74, safety: 81, endurance: 69, hri: 58 },
  },
  {
    id: 'figure02',
    name: 'Figure 02',
    vendor: 'Figure',
    model: 'Figure 02',
    track: 'industrial',
    status: 'Factory pilots',
    payloadKg: 20,
    heightCm: 168,
    batteryHr: 5,
    link: 'https://www.figure.ai',
    scores: { mobility: 86, manipulation: 84, autonomy: 79, safety: 77, endurance: 74, hri: 61 },
  },
  {
    id: 'optimus',
    name: 'Tesla Optimus',
    vendor: 'Tesla',
    model: 'Optimus',
    track: 'industrial',
    status: 'Internal development',
    payloadKg: 20,
    heightCm: 173,
    batteryHr: 6,
    link: 'https://www.tesla.com/AI',
    scores: { mobility: 88, manipulation: 76, autonomy: 75, safety: 73, endurance: 81, hri: 57 },
  },
  {
    id: 'walker',
    name: 'UBTECH Walker S1',
    vendor: 'UBTECH',
    model: 'Walker S1',
    track: 'industrial',
    status: 'Automotive line trials',
    payloadKg: 15,
    heightCm: 172,
    batteryHr: 3.5,
    link: 'https://www.ubtrobot.com/en/humanoid/products/walker-s1',
    scores: { mobility: 79, manipulation: 75, autonomy: 71, safety: 78, endurance: 67, hri: 55 },
  },
  {
    id: 'gr3',
    name: 'Fourier GR-3',
    vendor: 'Fourier',
    model: 'GR-3',
    track: 'care',
    status: 'Showcase / pilot',
    payloadKg: 6,
    heightCm: 165,
    batteryHr: 2.5,
    link: 'https://www.fftai.com/products-gr3',
    scores: { mobility: 72, manipulation: 66, autonomy: 68, safety: 88, endurance: 58, hri: 87 },
  },
]

const benchmarkSuites: Record<Track, Task[]> = {
  industrial: [
    { id: 'bin-pick', name: 'Bin Picking', weight: 18, difficulty: 'High', target: 'Random cluttered part extraction' },
    { id: 'line-feed', name: 'Line Feeding', weight: 16, difficulty: 'Medium', target: 'Move totes to workstation under takt time' },
    { id: 'stair-ramp', name: 'Stair & Ramp Traverse', weight: 12, difficulty: 'Medium', target: 'Mobility across mixed terrain' },
    { id: 'tool-handover', name: 'Tool Handover', weight: 14, difficulty: 'Medium', target: 'Human-safe passing with force limits' },
    { id: 'fault-recovery', name: 'Fault Recovery', weight: 20, difficulty: 'High', target: 'Resume task after occlusion / slip / event' },
    { id: 'endurance-shift', name: 'Shift Endurance', weight: 20, difficulty: 'High', target: 'Long-run stability and energy efficiency' },
  ],
  care: [
    { id: 'room-navigation', name: 'Room Navigation', weight: 14, difficulty: 'Medium', target: 'Indoor traversal around furniture and people' },
    { id: 'med-reminder', name: 'Medication Reminder', weight: 15, difficulty: 'Low', target: 'Timely and intelligible prompting' },
    { id: 'assist-fetch', name: 'Assistive Fetch', weight: 18, difficulty: 'Medium', target: 'Bring requested household item safely' },
    { id: 'conversation', name: 'Conversation Quality', weight: 18, difficulty: 'Medium', target: 'Turn-taking, clarity, empathy proxy' },
    { id: 'fall-escalation', name: 'Fall / Alert Escalation', weight: 20, difficulty: 'High', target: 'Detect abnormal state and escalate correctly' },
    { id: 'proximity-safety', name: 'Proximity Safety', weight: 15, difficulty: 'High', target: 'Safe motion around vulnerable users' },
  ],
}

const adoptionTrend = [
  { month: 'M1', submissions: 4, certified: 0, activeUsers: 8 },
  { month: 'M2', submissions: 11, certified: 2, activeUsers: 20 },
  { month: 'M3', submissions: 19, certified: 5, activeUsers: 34 },
  { month: 'M4', submissions: 28, certified: 9, activeUsers: 49 },
  { month: 'M5', submissions: 39, certified: 14, activeUsers: 66 },
  { month: 'M6', submissions: 53, certified: 21, activeUsers: 88 },
  { month: 'M7', submissions: 71, certified: 30, activeUsers: 117 },
  { month: 'M8', submissions: 94, certified: 42, activeUsers: 150 },
]

const arenaPhases = [
  'Scenario loaded',
  'Robot initialized',
  'Perception calibration',
  'Task execution',
  'Recovery / exception check',
  'Audit log generated',
]

function scoreRobot(robot: Robot, weights: Record<string, number>) {
  const s = robot.scores
  return Math.round(
    s.mobility * weights.mobility +
      s.manipulation * weights.manipulation +
      s.autonomy * weights.autonomy +
      s.safety * weights.safety +
      s.endurance * weights.endurance +
      s.hri * weights.hri,
  )
}

function buildTaskResults(robot: Robot, track: Track, suite: Task[]) {
  return suite.map((task, i) => {
    const base =
      track === 'industrial'
        ? (robot.scores.manipulation + robot.scores.mobility + robot.scores.autonomy) / 3
        : (robot.scores.hri + robot.scores.safety + robot.scores.autonomy) / 3
    const variance = ((i + 1) * 7 + robot.name.length) % 13
    const success = Math.max(48, Math.min(97, Math.round(base + variance - 8)))
    const latency = Math.max(1.2, Number((8.8 - base / 18 + i * 0.35).toFixed(1)))
    const safety = Math.max(55, Math.min(98, Math.round((robot.scores.safety + robot.scores.hri) / 2 + (12 - variance))))
    const robustness = Math.max(44, Math.min(96, Math.round((robot.scores.endurance + robot.scores.autonomy) / 2 + variance - 4)))
    return { ...task, success, latency, safety, robustness }
  })
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button className={`tab-button ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: typeof Bot; label: string; value: string; sub: string }) {
  return (
    <div className="metric-card">
      <div className="metric-icon"><Icon size={16} /></div>
      <div>
        <div className="eyebrow">{label}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-sub">{sub}</div>
      </div>
    </div>
  )
}

function App() {
  const [tab, setTab] = useState<'dashboard' | 'runner' | 'leaderboard' | 'compare' | 'workflow'>('dashboard')
  const [track, setTrack] = useState<Track>('industrial')
  const [selectedRobotId, setSelectedRobotId] = useState('apollo')
  const [query, setQuery] = useState('')
  const [running, setRunning] = useState(false)
  const [runProgress, setRunProgress] = useState(0)
  const [runStep, setRunStep] = useState(0)
  const [weights, setWeights] = useState({
    mobility: 0.18,
    manipulation: 0.22,
    autonomy: 0.18,
    safety: 0.17,
    endurance: 0.13,
    hri: 0.12,
  })

  const filteredTrackRobots = useMemo(() => robots.filter((r) => r.track === track), [track])

  useEffect(() => {
    if (!filteredTrackRobots.find((r) => r.id === selectedRobotId)) {
      setSelectedRobotId(filteredTrackRobots[0]?.id ?? 'apollo')
    }
  }, [filteredTrackRobots, selectedRobotId])

  const selectedRobot = robots.find((r) => r.id === selectedRobotId) ?? robots[0]
  const suite = benchmarkSuites[track]

  const leaderboard = useMemo(
    () =>
      robots
        .filter((r) => r.track === track)
        .map((r) => ({ ...r, total: scoreRobot(r, weights) }))
        .sort((a, b) => b.total - a.total),
    [track, weights],
  )

  const visibleLeaderboard = useMemo(
    () => leaderboard.filter((r) => `${r.name} ${r.vendor} ${r.model}`.toLowerCase().includes(query.toLowerCase())),
    [leaderboard, query],
  )

  const taskResults = useMemo(() => buildTaskResults(selectedRobot, track, suite), [selectedRobot, track, suite])

  const radarData = useMemo(() => {
    const leader = leaderboard[0] ?? selectedRobot
    return [
      { metric: 'Mobility', selected: selectedRobot.scores.mobility, leader: leader.scores.mobility },
      { metric: 'Manipulation', selected: selectedRobot.scores.manipulation, leader: leader.scores.manipulation },
      { metric: 'Autonomy', selected: selectedRobot.scores.autonomy, leader: leader.scores.autonomy },
      { metric: 'Safety', selected: selectedRobot.scores.safety, leader: leader.scores.safety },
      { metric: 'Endurance', selected: selectedRobot.scores.endurance, leader: leader.scores.endurance },
      { metric: 'HRI', selected: selectedRobot.scores.hri, leader: leader.scores.hri },
    ]
  }, [selectedRobot, leaderboard])

  const categoryWeights = [
    { key: 'mobility', label: 'Mobility' },
    { key: 'manipulation', label: 'Manipulation' },
    { key: 'autonomy', label: 'Autonomy' },
    { key: 'safety', label: 'Safety' },
    { key: 'endurance', label: 'Endurance' },
    { key: 'hri', label: 'HRI / Care' },
  ] as const

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setRunProgress((p) => {
        const next = Math.min(100, p + 4 + Math.random() * 7)
        const phaseIndex = Math.min(arenaPhases.length - 1, Math.floor((next / 100) * arenaPhases.length))
        setRunStep(phaseIndex)
        if (next >= 100) {
          window.clearInterval(timer)
          window.setTimeout(() => setRunning(false), 300)
        }
        return next
      })
    }, 240)
    return () => window.clearInterval(timer)
  }, [running])

  const startRun = () => {
    setRunning(true)
    setRunProgress(0)
    setRunStep(0)
    setTab('runner')
  }

  const totalScore = scoreRobot(selectedRobot, weights)

  return (
    <div className="app-shell">
      <div className="container">
        <section className="hero glass-panel">
          <div className="hero-copy">
            <div className="badge-row">
              <span className="badge dark">Humanoid Benchmark Platform</span>
              <span className="badge">Simulation + hybrid-ready</span>
              <span className="badge">Interactive MVP</span>
            </div>
            <h1>A working benchmark product for industrial and care humanoid robots.</h1>
            <p>
              Define suites, run benchmark jobs, compare robots, inspect task logs, and visualize how rankings change under
              different buyer priorities.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={startRun}><Play size={16} /> Run benchmark</button>
              <button className="secondary-button" onClick={() => setTab('workflow')}><Upload size={16} /> Submission workflow</button>
            </div>
            <div className="metrics-grid">
              <MetricCard icon={Bot} label="Robots tracked" value="5" sub="Humanoid profiles" />
              <MetricCard icon={ClipboardList} label="Benchmark tasks" value="12" sub="Two suites" />
              <MetricCard icon={ShieldCheck} label="Audit logs" value="100%" sub="Run-level traceability" />
              <MetricCard icon={Trophy} label="Certification tiers" value="3" sub="Bronze / Silver / Gold" />
            </div>
          </div>
          <div className="arena-card dark-panel">
            <div className="panel-head">
              <div>
                <div className="panel-title"><Activity size={18} /> Arena monitor</div>
                <div className="panel-desc">Mock live run with task execution, recovery, and audit generation.</div>
              </div>
            </div>
            <div className="arena-stage">
              <div className="zone zone-square" />
              <div className="zone zone-circle" />
              <motion.div
                className="robot-token"
                animate={running ? { x: [0, 46, 82, 128], y: [0, -2, 3, 0] } : { x: 0, y: 0 }}
                transition={{ duration: 4.2, repeat: running ? Infinity : 0, ease: 'easeInOut' }}
              >
                <div className="robot-head" />
                <div className="robot-body" />
              </motion.div>
              <div className="stage-labels">
                <span>Task zone</span>
                <span>Obstacle field</span>
                <span>Audit sensors</span>
              </div>
            </div>
            <div className="progress-row">
              <span>{running ? arenaPhases[runStep] : 'Ready'}</span>
              <span>{Math.round(runProgress)}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${runProgress}%` }} /></div>
            <div className="phase-list">
              {arenaPhases.map((phase, idx) => (
                <div key={phase} className="phase-item">
                  <span>{phase}</span>
                  {idx < runStep || (!running && runProgress === 100) ? (
                    <CheckCircle2 size={16} color="#34d399" />
                  ) : idx === runStep && running ? (
                    <span className="pulse-dot" />
                  ) : (
                    <span className="idle-dot" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="tabs-row glass-panel">
          <div className="tabs-list">
            <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</TabButton>
            <TabButton active={tab === 'runner'} onClick={() => setTab('runner')}>Runner</TabButton>
            <TabButton active={tab === 'leaderboard'} onClick={() => setTab('leaderboard')}>Leaderboard</TabButton>
            <TabButton active={tab === 'compare'} onClick={() => setTab('compare')}>Compare</TabButton>
            <TabButton active={tab === 'workflow'} onClick={() => setTab('workflow')}>Workflow</TabButton>
          </div>
        </section>

        {tab === 'dashboard' && (
          <section className="content-grid two-col">
            <div className="glass-panel section-card">
              <div className="section-head row-between">
                <div>
                  <h2>Suite explorer</h2>
                  <p>Switch benchmark lanes and inspect test modules.</p>
                </div>
                <div className="segmented-control">
                  <button className={track === 'industrial' ? 'active' : ''} onClick={() => setTrack('industrial')}>Industrial</button>
                  <button className={track === 'care' ? 'active' : ''} onClick={() => setTrack('care')}>Care</button>
                </div>
              </div>
              <div className="stack-list">
                {suite.map((task) => (
                  <motion.div key={task.id} whileHover={{ y: -2 }} className="tile">
                    <div>
                      <div className="tile-title">{task.name}</div>
                      <div className="tile-sub">{task.target}</div>
                    </div>
                    <div className="tile-meta">
                      <span className="pill">{task.difficulty}</span>
                      <span>Weight {task.weight}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="glass-panel section-card chart-card">
              <div className="section-head">
                <h2>Adoption trend</h2>
                <p>Mock platform growth with submissions and certifications.</p>
              </div>
              <div className="chart-wrap large">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adoptionTrend}>
                    <defs>
                      <linearGradient id="submissionsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="submissions" stroke="#3b82f6" fill="url(#submissionsFill)" strokeWidth={2} />
                    <Line type="monotone" dataKey="certified" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="activeUsers" stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {tab === 'runner' && (
          <section className="content-grid two-col-runner">
            <div className="glass-panel section-card">
              <div className="section-head">
                <h2>Benchmark runner</h2>
                <p>Select track, choose a robot profile, and simulate a scored run.</p>
              </div>
              <div className="form-stack">
                <label>
                  <span>Track</span>
                  <select value={track} onChange={(e) => setTrack(e.target.value as Track)}>
                    <option value="industrial">Industrial humanoid suite</option>
                    <option value="care">Care humanoid suite</option>
                  </select>
                </label>
                <label>
                  <span>Robot</span>
                  <select value={selectedRobotId} onChange={(e) => setSelectedRobotId(e.target.value)}>
                    {robots.filter((r) => r.track === track).map((robot) => (
                      <option key={robot.id} value={robot.id}>{robot.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="profile-box">
                <div className="row-between">
                  <div>
                    <div className="eyebrow">Current profile</div>
                    <div className="profile-title">{selectedRobot.name}</div>
                  </div>
                  <span className="badge dark">Score {totalScore}</span>
                </div>
                <div className="mini-grid three">
                  <div className="mini-tile"><div className="eyebrow">Payload</div><strong>{selectedRobot.payloadKg} kg</strong></div>
                  <div className="mini-tile"><div className="eyebrow">Height</div><strong>{selectedRobot.heightCm} cm</strong></div>
                  <div className="mini-tile"><div className="eyebrow">Battery</div><strong>{selectedRobot.batteryHr} h</strong></div>
                </div>
              </div>
              <button className="primary-button full-width" onClick={startRun}><Play size={16} /> Start simulated run</button>
            </div>
            <div className="glass-panel section-card">
              <div className="section-head">
                <h2>Task results</h2>
                <p>Mock run output with per-task metrics and audit-friendly breakdown.</p>
              </div>
              <div className="stack-list">
                {taskResults.map((task) => (
                  <div key={task.id} className="tile task-tile">
                    <div className="row-between start">
                      <div>
                        <div className="tile-title">{task.name}</div>
                        <div className="tile-sub">{task.target}</div>
                      </div>
                      <span className="pill">Weight {task.weight}%</span>
                    </div>
                    <div className="mini-grid four">
                      <div className="mini-tile"><div className="eyebrow">Success</div><strong>{task.success}%</strong></div>
                      <div className="mini-tile"><div className="eyebrow">Latency</div><strong>{task.latency}s</strong></div>
                      <div className="mini-tile"><div className="eyebrow">Safety</div><strong>{task.safety}</strong></div>
                      <div className="mini-tile"><div className="eyebrow">Robustness</div><strong>{task.robustness}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'leaderboard' && (
          <section className="content-grid two-col">
            <div className="glass-panel section-card">
              <div className="section-head row-between wrap-gap">
                <div>
                  <h2>Leaderboard</h2>
                  <p>Filterable results browser with rank, status, and total score.</p>
                </div>
                <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search robot / vendor / model" />
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Robot</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLeaderboard.map((robot, index) => (
                      <tr key={robot.id} onClick={() => setSelectedRobotId(robot.id)}>
                        <td>#{index + 1}</td>
                        <td>
                          <div className="table-title">{robot.name}</div>
                          <div className="table-sub">{robot.vendor} · {robot.model}</div>
                        </td>
                        <td><span className="pill">{robot.status}</span></td>
                        <td><strong>{robot.total}</strong></td>
                        <td><button className="ghost-button">Inspect <ChevronRight size={15} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass-panel section-card chart-card">
              <div className="section-head">
                <h2>Category score breakdown</h2>
                <p>{selectedRobot.name} under the current benchmark weighting model.</p>
              </div>
              <div className="chart-wrap large">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryWeights.map((c) => ({ metric: c.label, score: selectedRobot.scores[c.key] }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="metric" angle={-8} textAnchor="end" height={64} interval={0} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[10, 10, 0, 0]} fill="#0f172a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {tab === 'compare' && (
          <section className="content-grid two-col">
            <div className="glass-panel section-card">
              <div className="section-head">
                <h2>Weighting engine</h2>
                <p>Adjust benchmark priorities and watch rankings update in real time.</p>
              </div>
              <div className="slider-stack">
                {categoryWeights.map((item) => (
                  <label key={item.key} className="slider-label">
                    <div className="row-between">
                      <span>{item.label}</span>
                      <strong>{Math.round(weights[item.key] * 100)}%</strong>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={35}
                      step={1}
                      value={Math.round(weights[item.key] * 100)}
                      onChange={(e) => setWeights((prev) => ({ ...prev, [item.key]: Number(e.target.value) / 100 }))}
                    />
                  </label>
                ))}
              </div>
              <div className="info-box">
                This MVP uses dynamic weighted scoring to show how an industrial buyer and a care buyer can rank the same robot very differently.
              </div>
            </div>
            <div className="stack-split">
              <div className="glass-panel section-card chart-card">
                <div className="section-head">
                  <h2>Selected vs current leader</h2>
                  <p>Radar comparison under the active track.</p>
                </div>
                <div className="chart-wrap medium">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <Tooltip />
                      <RadarShape name={selectedRobot.name} dataKey="selected" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                      <RadarShape name={leaderboard[0]?.name ?? 'Leader'} dataKey="leader" fill="#10b981" stroke="#10b981" fillOpacity={0.2} strokeWidth={2} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-panel section-card">
                <div className="section-head">
                  <h2>Robot cards</h2>
                  <p>Interactive catalog for the active benchmark lane.</p>
                </div>
                <div className="robot-grid">
                  {robots.filter((r) => r.track === track).map((robot) => {
                    const active = robot.id === selectedRobotId
                    return (
                      <button key={robot.id} className={`robot-card ${active ? 'active' : ''}`} onClick={() => setSelectedRobotId(robot.id)}>
                        <div className="row-between">
                          <div className="tile-title">{robot.name}</div>
                          <span className={`badge ${active ? 'light' : 'dark'}`}>{scoreRobot(robot, weights)}</span>
                        </div>
                        <div className="table-sub">{robot.vendor} · {robot.model}</div>
                        <div className="mini-grid three compact">
                          <div className="mini-tile"><div className="eyebrow">Payload</div><strong>{robot.payloadKg}kg</strong></div>
                          <div className="mini-tile"><div className="eyebrow">Battery</div><strong>{robot.batteryHr}h</strong></div>
                          <div className="mini-tile"><div className="eyebrow">Status</div><strong>Live</strong></div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === 'workflow' && (
          <section className="stack-split large-gap">
            <div className="steps-grid">
              {[
                { icon: Upload, title: 'Submit', text: 'Upload Docker image, model package, metadata, and claimed runtime profile.' },
                { icon: Cpu, title: 'Evaluate', text: 'Run hidden seeds, randomized scenarios, and compute-budget-constrained inference.' },
                { icon: ShieldCheck, title: 'Audit', text: 'Generate replay logs, action traces, exceptions, and compliance outputs.' },
                { icon: Trophy, title: 'Publish', text: 'Push certified results to the public leaderboard with versioned benchmark tags.' },
              ].map((step, i) => (
                <div key={step.title} className="glass-panel step-card">
                  <div className="icon-box"><step.icon size={18} /></div>
                  <div className="eyebrow">Step {i + 1}</div>
                  <div className="tile-title">{step.title}</div>
                  <div className="tile-sub">{step.text}</div>
                </div>
              ))}
            </div>
            <section className="content-grid two-col">
              <div className="glass-panel section-card">
                <div className="section-head">
                  <h2>Benchmark architecture</h2>
                  <p>The core modules a real deployment would expose.</p>
                </div>
                <div className="robot-grid architecture-grid">
                  {[
                    [Factory, 'Arena & scenarios', 'Isaac / MuJoCo task worlds, hidden seeds, randomized terrain and clutter.'],
                    [SlidersHorizontal, 'Scoring engine', 'Versioned rules, per-track weighting, traceable score composition.'],
                    [Route, 'Replay & audit', 'Exception logs, event timeline, run artifacts, tamper checks.'],
                    [HeartHandshake, 'Certification layer', 'Bronze / Silver / Gold issuance, buyer-facing summaries.'],
                  ].map(([Icon, title, text]) => (
                    <div key={title as string} className="tile architecture-tile">
                      <div className="icon-box soft"><Icon size={18} /></div>
                      <div className="tile-title">{title as string}</div>
                      <div className="tile-sub">{text as string}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel section-card">
                <div className="section-head">
                  <h2>What makes this useful</h2>
                  <p>Designed to feel like a product, not a concept page.</p>
                </div>
                <div className="stack-list">
                  {[
                    [Gauge, 'Dynamic scoring', 'Different buyer priorities can immediately produce different rankings.'],
                    [Radar, 'Comparative views', 'Radar, bars, and task tables make strengths and weaknesses obvious.'],
                    [Timer, 'Run simulation', 'Users can launch a mock job and inspect progress rather than just read text.'],
                    [BarChart3, 'Result browser', 'Searchable leaderboard and category charts mirror mature benchmark products.'],
                  ].map(([Icon, title, text]) => (
                    <div key={title as string} className="tile horizontal">
                      <div className="icon-box soft"><Icon size={16} /></div>
                      <div>
                        <div className="tile-title">{title as string}</div>
                        <div className="tile-sub">{text as string}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </section>
        )}
      </div>
    </div>
  )
}

export default App
