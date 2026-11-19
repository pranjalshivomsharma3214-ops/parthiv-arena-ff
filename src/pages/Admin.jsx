import "./Admin.css";
import CreateTournament from "./CreateTournament";
import CreateMatchRoom from "./CreateMatchRoom";
function Admin({ user }) {
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p>PARTHIV ARENA FF</p>
          <h1>Admin <span>Control Center</span></h1>
          <small>Manage your community platform</small>
        </div>
        <div className="admin-status">ADMIN PANEL</div>
      </header>

      <section className="admin-welcome">
        <p>WELCOME TO THE CONTROL CENTER</p>
        <h2>Manage your arena.</h2>
        <p>
          Tournament management and community tools
          will be available here.
        </p>
      </section>

      <section className="admin-grid">
        <article className="admin-card">
          <span>01</span>
          <h3>Tournaments</h3>
          <p>Create and manage free tournaments.</p>
        </article>

        <article className="admin-card">
          <span>02</span>
          <h3>Players</h3>
          <p>View and manage player accounts.</p>
        </article>

        <article className="admin-card">
          <span>03</span>
          <h3>Results</h3>
          <p>Review screenshots and verify results.</p>
        </article>

        <article className="admin-card">
          <span>04</span>
          <h3>Announcements</h3>
          <p>Publish important community updates.</p>
        </article>
            </section>

      <CreateTournament user={user} />

<CreateMatchRoom user={user} />

    </main>
  );
}

export default Admin;