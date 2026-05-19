import { LayoutDashboard, CheckSquare, Rocket } from 'lucide-react'

function Sidebar({ activeView, setActiveView, projectCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Rocket size={18} />
        </div>
        <h1>AirDrop Mgr</h1>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeView === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveView('projects')}
        >
          <LayoutDashboard size={18} />
          <span>Projects</span>
          {projectCount > 0 && <span className="nav-badge">{projectCount}</span>}
        </button>
        <button
          className={`nav-item ${activeView === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveView('checklist')}
        >
          <CheckSquare size={18} />
          <span>Daily Tasks</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <p>AirDrop Manager v1.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
