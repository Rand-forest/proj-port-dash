import { useState, type ReactNode } from 'react'

type IconProps = { children: ReactNode; size?: number }

function Icon({ children, size = 20 }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {children}
    </svg>
  )
}

const icons = {
  overview: <Icon><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></Icon>,
  milestones: <Icon><path d="M5 21V4m0 1h12l-2.5 4L17 13H5"/></Icon>,
  updates: <Icon><path d="M21 11.5a8.5 8.5 0 1 1-2.5-6M21 4v6h-6"/></Icon>,
  risks: <Icon><path d="M12 3 2.7 20h18.6L12 3Z"/><path d="M12 9v4m0 3h.01"/></Icon>,
  team: <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Icon>,
  settings: <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.6.66 1 1.27 1H21v4h-.08c-.61 0-1.14.4-1.52 1Z"/></Icon>,
}

const navItems = [
  ['Overview', icons.overview], ['Milestones', icons.milestones], ['Updates', icons.updates],
  ['Risks & issues', icons.risks], ['Team', icons.team], ['Settings', icons.settings],
] as const

const milestoneData = [
  { date: 'Aug 12', title: 'Beta launch', detail: 'Release to pilot customers', tone: 'blue' },
  { date: 'Aug 21', title: 'Feedback review', detail: 'Synthesize pilot learnings', tone: 'purple' },
  { date: 'Sep 04', title: 'Public launch', detail: 'General availability', tone: 'green' },
]

export function App() {
  const isDevelopment = import.meta.env.VITE_APP_ENV === 'development'
  const [activeNav, setActiveNav] = useState('Overview')

  return (
    <div className="app-shell">
      {isDevelopment && <div className="environment-banner">DEVELOPMENT ENVIRONMENT</div>}
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">P</span><span>Pulse</span></div>
        <nav aria-label="Primary navigation">
          {navItems.map(([label, icon]) => (
            <button className={activeNav === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => setActiveNav(label)} type="button">
              {icon}<span>{label}</span>{label === 'Risks & issues' && <span className="nav-badge">3</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="profile" type="button" aria-label="Open profile menu">
            <span className="avatar avatar-photo">AM</span><span><strong>Alex Morgan</strong><small>Project lead</small></span><span className="dots">•••</span>
          </button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">P</span> Pulse</div>
          <div className="project-switcher"><span className="project-icon">N</span><span><small>Project</small><strong>Nova Platform</strong></span><span className="chevron">⌄</span></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Search" type="button"><Icon><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon></button>
            <button className="icon-button notification" aria-label="Notifications" type="button"><Icon><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></Icon></button>
            <button className="share-button" type="button"><Icon size={17}><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5m-8 7 8 5"/></Icon> Share update</button>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div><p className="eyebrow">MONDAY, AUGUST 10</p><h1>Good morning, Alex</h1><p>Here’s what’s happening with Nova Platform.</p></div>
            <div className="last-updated"><span className="status-dot"/>Last updated 12 min ago</div>
          </section>

          <section className="metric-grid" aria-label="Project summary">
            <article className="metric-card"><div className="metric-top"><span>Overall progress</span><span className="trend good">↗ 4%</span></div><div className="metric-value">68<span>%</span></div><div className="progress-track"><span style={{ width: '68%' }}/></div><p>On track for Sep 04</p></article>
            <article className="metric-card"><div className="metric-top"><span>Budget used</span><span className="trend neutral">On plan</span></div><div className="metric-value">$184<span>k</span></div><div className="progress-track violet"><span style={{ width: '61%' }}/></div><p>$116k remaining</p></article>
            <article className="metric-card"><div className="metric-top"><span>Open tasks</span><span className="trend good">↓ 8</span></div><div className="metric-value">24</div><div className="task-breakdown"><span><i className="dot blue"/>12 in progress</span><span><i className="dot gray"/>12 to do</span></div></article>
            <article className="metric-card"><div className="metric-top"><span>Project health</span><span className="trend good">Stable</span></div><div className="health-value"><span className="health-ring">A</span><div><strong>On track</strong><p>All systems healthy</p></div></div></article>
          </section>

          <div className="dashboard-grid">
            <section className="card progress-card">
              <div className="card-heading"><div><h2>Progress overview</h2><p>Planned vs. completed work</p></div><select aria-label="Progress timeframe" defaultValue="6 months"><option>6 months</option><option>3 months</option></select></div>
              <div className="chart" aria-label="Line chart showing planned and actual progress from March to August">
                <div className="y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
                <div className="plot"><div className="grid-lines"><i/><i/><i/><i/><i/></div>
                  <svg preserveAspectRatio="none" viewBox="0 0 600 200"><path className="area" d="M0 188 C70 175 95 150 150 143 S245 115 300 104 S390 80 450 65 S545 42 600 24 L600 200 L0 200Z"/><path className="planned" d="M0 180 C80 160 100 140 150 132 S240 102 300 91 S395 66 450 51 S550 25 600 10"/><path className="actual" d="M0 188 C70 175 95 150 150 143 S245 115 300 104 S390 80 450 65 S545 42 600 24"/><circle cx="600" cy="24" r="5"/></svg>
                  <div className="x-labels"><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div>
                </div>
              </div>
              <div className="legend"><span><i className="line solid"/>Actual</span><span><i className="line dashed"/>Planned</span></div>
            </section>

            <section className="card milestones-card"><div className="card-heading"><div><h2>Upcoming milestones</h2><p>Next 30 days</p></div><button className="link-button" type="button">View all →</button></div>
              <div className="milestone-list">{milestoneData.map((item, index) => <article className="milestone" key={item.title}><div className={`date-box ${item.tone}`}><strong>{item.date.split(' ')[1]}</strong><span>{item.date.split(' ')[0]}</span></div><div className="milestone-copy"><strong>{item.title}</strong><p>{item.detail}</p><span>{index === 0 ? 'In 2 days' : index === 1 ? 'In 11 days' : 'In 25 days'}</span></div>{index === 0 && <span className="pill">On track</span>}</article>)}</div>
            </section>

            <section className="card updates-card"><div className="card-heading"><div><h2>Latest updates</h2><p>What the team has been working on</p></div><button className="link-button" type="button">View all →</button></div>
              <div className="update-list">
                <article className="update"><span className="avatar avatar-coral">SK</span><div><div className="update-title"><strong>Sarah Kim</strong><span>2 hours ago</span></div><p>Completed the new onboarding flow and handed it off for QA. Early usability feedback has been really positive.</p><span className="tag">Design</span><span className="reaction">👏 6</span></div></article>
                <article className="update"><span className="avatar avatar-blue">JD</span><div><div className="update-title"><strong>Jordan Diaz</strong><span>Yesterday</span></div><p>API performance improved by 34% after the latest caching update. We’re now comfortably within our launch target.</p><span className="tag engineering">Engineering</span><span className="reaction">🚀 9</span></div></article>
              </div>
            </section>

            <section className="card attention-card"><div className="card-heading"><div><h2>Needs attention</h2><p>Risks and blockers</p></div><span className="count-badge">3 open</span></div>
              <div className="risk-list"><article><span className="risk-icon high">!</span><div><strong>Vendor security review</strong><p>Waiting on final compliance documents</p><span>High priority · Owner: Alex</span></div></article><article><span className="risk-icon medium">!</span><div><strong>Mobile QA capacity</strong><p>Additional testing support needed</p><span>Medium priority · Owner: Jordan</span></div></article></div><button className="risk-button" type="button">Review all risks <span>→</span></button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
