import React, { useState, useEffect } from 'react';
import './index.css';

const API_BASE = "http://localhost:4000";

// --- Mock Data to ensure Demo NEVER looks empty ---
const DEMO_PAYOUTS = [
  { id: 'm1', zoneName: 'Velachery', trigger: 'Rainfall > 15mm', amount: 300, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', zoneName: 'Adyar', trigger: 'Premium Coverage', amount: 50, timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'm3', zoneName: 'Anna Nagar', trigger: 'Heatwave > 45C', amount: 250, timestamp: new Date(Date.now() - 10800000).toISOString() },
];

function App() {
  const [view, setView] = useState('landing');
  const [payouts, setPayouts] = useState(DEMO_PAYOUTS); // Start with demo data
  const [loading, setLoading] = useState(false);

  const fetchPayouts = async () => {
    try {
      const response = await fetch(`${API_BASE}/payouts`);
      if (response.ok) {
        const data = await response.json();
        // Combine real data with demo data for a full view
        if (data.length > 0) setPayouts([...data, ...DEMO_PAYOUTS]);
      }
    } catch (e) {
      console.warn("Backend not reached, using Simulation Mode.");
    }
  };

  useEffect(() => {
    if (view === 'rider-dashboard' || view === 'admin-dashboard') {
      fetchPayouts();
    }
  }, [view]);

  const triggerSimulation = async () => {
    // Add locally to UI instantly for the WOW effect
    const newSim = {
      id: Date.now(),
      zoneName: "T. Nagar",
      trigger: "SIMULATION: Heavy Rain",
      amount: 300,
      timestamp: new Date().toISOString()
    };
    setPayouts([newSim, ...payouts]);

    // Try to tell backend too
    try {
      await fetch(`${API_BASE}/admin/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: "T. Nagar (Simulated)",
          trigger: "Heavy Rain Alert",
          amount: 300,
          riderId: "DEMO_USER_1"
        })
      });
    } catch (e) { /* silent fail on backend simulation */ }
  };

  // --- Views ---

  const Landing = () => (
    <div className="landing">
      <div className="hero">
        <div className="logo-icon" style={{margin: '0 auto 20px'}}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h1>RiderShield</h1>
        <p>The first parametric safety net for Chennai's delivery heroes. Get automated payouts for extreme weather, instantly.</p>
        <div className="auth-options">
          <button className="refresh-btn" style={{width: 'auto'}} onClick={() => setView('rider-login')}>Rider Portal</button>
          <button className="btn-secondary" onClick={() => setView('admin-login')}>Admin Panel</button>
        </div>
      </div>
    </div>
  );

  const Login = ({ type }) => (
    <div className="auth-container">
      <div className="auth-card">
        <button className="btn-secondary" style={{marginBottom: '20px', padding: '8px 16px'}} onClick={() => setView('landing')}>← Back</button>
        <h2>{type === 'rider' ? 'Rider Login' : 'Admin Portal'}</h2>
        <p>Enter your credentials to continue.</p>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="name@company.com" defaultValue={type === 'rider' ? 'rider@zomato.com' : 'admin@ridershield.com'} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" defaultValue="password123" />
        </div>
        <button className="refresh-btn" onClick={() => setView(type === 'rider' ? 'rider-dashboard' : 'admin-dashboard')}>
          Login to {type === 'rider' ? 'Shield' : 'Command Center'}
        </button>
      </div>
    </div>
  );

  const RiderDashboard = () => (
    <div className="dashboard">
      <header>
        <button onClick={() => setView('landing')} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'white', marginRight: '10px'}}>←</button>
        <div className="logo-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <h1>RiderShield</h1>
      </header>
      <div className="status-card">
        <div className="status-badge">● Currently Protected</div>
        <h2>Active Cover</h2>
        <p>Plan: Chennai Monsoon Shield (₹50/wk)</p>
      </div>
      <div className="weather-row">
        <div className="weather-stat"><label>Local Rain</label><div className="value">12.4 mm</div></div>
        <div className="weather-stat"><label>Target</label><div className="value">15.0 mm</div></div>
      </div>
      <section>
        <h3>Your Payout History</h3>
        <div className="payout-list">
          {payouts.map(p => (
            <div key={p.id} className="payout-item">
              <div className="info"><span className="reason">{p.trigger}</span><span className="date">{p.zoneName}</span></div>
              <div className="amount">+₹{p.amount}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const AdminDashboard = () => (
    <div className="dashboard" style={{maxWidth: '800px'}}>
      <header>
        <button onClick={() => setView('landing')} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'white', marginRight: '10px'}}>←</button>
        <h1>Admin Center</h1>
        <button className="refresh-btn" style={{width: 'auto', marginLeft: 'auto', padding: '8px 16px', fontSize: '12px'}} onClick={triggerSimulation}>
           Trigger Demo Simulation
        </button>
      </header>
      <div className="admin-stats">
        <div className="stat-box"><span className="label">Active Riders</span><div className="number">1,240</div></div>
        <div className="stat-box"><span className="label">Zones Protected</span><div className="number">12</div></div>
        <div className="stat-box"><span className="label">Total Payouts</span><div className="number">₹{payouts.reduce((acc, curr) => acc + curr.amount, 0)}</div></div>
      </div>
      <div className="map-mock" style={{height: '350px'}}>
        <iframe 
          title="Chennai Operational Map"
          width="100%" 
          height="100%" 
          src="https://maps.google.com/maps?q=chennai&t=&z=11&ie=UTF8&iwloc=&output=embed" 
          frameBorder="0"
          style={{borderRadius: '24px', filter: 'invert(90%) hue-rotate(180deg)' }}
        ></iframe>
      </div>
      <section>
        <h3>Global Payout Log</h3>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
          <thead>
            <tr style={{textAlign: 'left', color: '#94a3b8', fontSize: '12px'}}>
              <th style={{padding: '12px 0'}}>ZONE</th>
              <th>TRIGGER</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map(p => (
              <tr key={p.id} style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                <td style={{padding: '12px 0'}}>{p.zoneName}</td>
                <td>{p.trigger}</td>
                <td style={{color: '#10b981'}}>₹{p.amount}</td>
                <td><span style={{fontSize: '11px', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '10px'}}>Processed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );

  // --- Router ---
  if (view === 'landing') return <Landing />;
  if (view === 'rider-login') return <Login type="rider" />;
  if (view === 'admin-login') return <Login type="admin" />;
  if (view === 'rider-dashboard') return <RiderDashboard />;
  if (view === 'admin-dashboard') return <AdminDashboard />;

  return <Landing />;
}

export default App;
