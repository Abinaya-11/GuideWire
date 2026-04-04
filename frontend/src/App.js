import React, { useState, useEffect, useCallback } from 'react';
import './index.css';

const API_BASE = "http://localhost:4000";

function getTriggerTypeLabel(p) {
  const t = p.triggerType;
  if (t === 'rainfall') return 'Rainfall Payout';
  if (t === 'temperature') return 'Heatwave Payout';
  if (t === 'aqi') return 'AQI Payout';
  const text = (p.trigger || '').toLowerCase();
  if (text.includes('rain') || text.includes('mm')) return 'Rainfall Payout';
  if (text.includes('heat') || text.includes('temp') || text.includes('°c')) return 'Heatwave Payout';
  if (text.includes('aqi') || text.includes('air quality')) return 'AQI Payout';
  return 'Payout';
}

const DEMO_PAYOUTS = [
  { id: 'm1', zoneName: 'Velachery', trigger: 'Rainfall > 15mm', triggerType: 'rainfall', amount: 300, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', zoneName: 'Adyar', trigger: 'Premium Coverage', amount: 50, timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'm3', zoneName: 'Anna Nagar', trigger: 'Heatwave > 45C', triggerType: 'temperature', amount: 250, timestamp: new Date(Date.now() - 10800000).toISOString() },
];

const parametricBadgeStyle = {
  fontSize: '9px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  background: 'rgba(16, 185, 129, 0.15)',
  color: '#6ee7b7',
  padding: '4px 8px',
  borderRadius: '8px',
  whiteSpace: 'nowrap',
  border: '1px solid rgba(16, 185, 129, 0.25)',
};

function RiderDashboard({ payouts, onBack }) {
  const [weeklyPremium, setWeeklyPremium] = useState(null);
  const [premiumLoading, setPremiumLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setPremiumLoading(true);
    fetch(`${API_BASE}/premium/calculate?zone=Velachery`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && data && typeof data.weeklyPremium === 'number') {
          setWeeklyPremium(data.weeklyPremium);
        }
      })
      .catch(() => {
        if (!cancelled) setWeeklyPremium(null);
      })
      .finally(() => {
        if (!cancelled) setPremiumLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard">
      <header>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            marginRight: '10px',
          }}
        >
          ←
        </button>
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1>RiderShield</h1>
      </header>
      <div className="status-card">
        <div className="status-badge">● Currently Protected</div>
        <h2>Active Cover</h2>
        <p style={{ marginBottom: '12px', opacity: 0.9 }}>Plan: Chennai Monsoon Shield · Zone: Velachery</p>
        <p
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            margin: 0,
            color: '#f8fafc',
          }}
        >
          Your Weekly Premium:{' '}
          {premiumLoading ? (
            <span style={{ opacity: 0.5 }}>Loading…</span>
          ) : weeklyPremium != null ? (
            <>₹{weeklyPremium}</>
          ) : (
            <span style={{ opacity: 0.6 }}>—</span>
          )}
        </p>
      </div>

      <section style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '15px', color: '#e2e8f0' }}>Live System Status</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}
        >
          {[
            { title: 'Rainfall Monitor', detail: 'Parametric rain threshold' },
            { title: 'Heatwave Sensor', detail: 'Extreme heat detection' },
            { title: 'AQI Tracker', detail: 'Air quality index watch' },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '14px 16px',
                background: 'rgba(15, 23, 42, 0.6)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{item.title}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', lineHeight: 1.35 }}>{item.detail}</div>
              <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 600, color: '#34d399' }}>● Live</div>
            </div>
          ))}
        </div>
      </section>

      <div className="weather-row" style={{ marginTop: '20px' }}>
        <div className="weather-stat">
          <label>Local Rain</label>
          <div className="value">12.4 mm</div>
        </div>
        <div className="weather-stat">
          <label>Target</label>
          <div className="value">15.0 mm</div>
        </div>
      </div>
      <section>
        <h3>Your Payout History</h3>
        <div className="payout-list">
          {payouts.map((p) => (
            <div key={p.id} className="payout-item">
              <div className="info">
                <span className="reason">{getTriggerTypeLabel(p)}</span>
                <span className="date">
                  {p.trigger}
                  {p.zoneName ? ` · ${p.zoneName}` : ''}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span className="amount" style={{ margin: 0 }}>
                  +₹{p.amount}
                </span>
                <span style={parametricBadgeStyle}>Verified by Parametric Trigger</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function App() {
  const [view, setView] = useState('landing');
  const [payouts, setPayouts] = useState(DEMO_PAYOUTS);

  const fetchPayouts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/payouts`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) setPayouts([...data, ...DEMO_PAYOUTS]);
      }
    } catch (e) {
      console.warn("Backend not reached, using Simulation Mode.");
    }
  }, []);

  useEffect(() => {
    if (view === 'rider-dashboard' || view === 'admin-dashboard') {
      fetchPayouts();
    }
  }, [view, fetchPayouts]);

  const triggerSimulation = async () => {
    const scenarios = [
      {
        triggerType: 'rainfall',
        trigger: 'Heavy Rain Alert',
        amount: 300,
        zoneName: 'T. Nagar (Simulated)',
        desc: 'SIMULATION: Heavy Rain',
      },
      {
        triggerType: 'temperature',
        trigger: 'Heatwave Alert',
        amount: 200,
        zoneName: 'T. Nagar (Simulated)',
        desc: 'SIMULATION: Heatwave',
      },
      {
        triggerType: 'aqi',
        trigger: 'Severe Air Quality Alert',
        amount: 150,
        zoneName: 'T. Nagar (Simulated)',
        desc: 'SIMULATION: AQI Spike',
      },
    ];
    const s = scenarios[Math.floor(Math.random() * scenarios.length)];
    const ts = new Date().toISOString();
    const newSim = {
      id: Date.now(),
      zoneName: s.zoneName,
      trigger: s.desc,
      triggerType: s.triggerType,
      amount: s.amount,
      timestamp: ts,
    };
    setPayouts((prev) => [newSim, ...prev]);

    try {
      await fetch(`${API_BASE}/admin/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zoneName: s.zoneName,
          trigger: s.trigger,
          triggerType: s.triggerType,
          amount: s.amount,
          riderId: 'DEMO_USER_1',
          timestamp: ts,
        }),
      });
    } catch (e) {
      /* silent fail on backend simulation */
    }
  };

  const Landing = () => (
    <div className="landing">
      <div className="hero">
        <div className="logo-icon" style={{ margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1>RiderShield</h1>
        <p>
          The first parametric safety net for Chennai&apos;s delivery heroes. Get automated payouts for extreme weather,
          instantly.
        </p>
        <div className="auth-options">
          <button type="button" className="refresh-btn" style={{ width: 'auto' }} onClick={() => setView('rider-login')}>
            Rider Portal
          </button>
          <button type="button" className="btn-secondary" onClick={() => setView('admin-login')}>
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );

  const Login = ({ type }) => (
    <div className="auth-container">
      <div className="auth-card">
        <button type="button" className="btn-secondary" style={{ marginBottom: '20px', padding: '8px 16px' }} onClick={() => setView('landing')}>
          ← Back
        </button>
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
        <button type="button" className="refresh-btn" onClick={() => setView(type === 'rider' ? 'rider-dashboard' : 'admin-dashboard')}>
          Login to {type === 'rider' ? 'Shield' : 'Command Center'}
        </button>
      </div>
    </div>
  );

  const AdminDashboard = () => (
    <div className="dashboard" style={{ maxWidth: '800px' }}>
      <header>
        <button
          type="button"
          onClick={() => setView('landing')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', marginRight: '10px' }}
        >
          ←
        </button>
        <h1>Admin Center</h1>
        <button type="button" className="refresh-btn" style={{ width: 'auto', marginLeft: 'auto', padding: '8px 16px', fontSize: '12px' }} onClick={triggerSimulation}>
          Trigger Demo Simulation
        </button>
      </header>
      <div className="admin-stats">
        <div className="stat-box">
          <span className="label">Active Riders</span>
          <div className="number">1,240</div>
        </div>
        <div className="stat-box">
          <span className="label">Zones Protected</span>
          <div className="number">12</div>
        </div>
        <div className="stat-box">
          <span className="label">Total Payouts</span>
          <div className="number">₹{payouts.reduce((acc, curr) => acc + curr.amount, 0)}</div>
        </div>
      </div>
      <div className="map-mock" style={{ height: '350px' }}>
        <iframe
          title="Chennai Operational Map"
          width="100%"
          height="100%"
          src="https://maps.google.com/maps?q=chennai&t=&z=11&ie=UTF8&iwloc=&output=embed"
          frameBorder="0"
          style={{ borderRadius: '24px', filter: 'invert(90%) hue-rotate(180deg)' }}
        />
      </div>
      <section>
        <h3>Global Payout Log</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94a3b8', fontSize: '12px' }}>
              <th style={{ padding: '12px 0' }}>ZONE</th>
              <th>TYPE</th>
              <th>TRIGGER</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px 0' }}>{p.zoneName}</td>
                <td style={{ fontSize: '12px', color: '#cbd5e1' }}>{getTriggerTypeLabel(p)}</td>
                <td>{p.trigger}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#10b981' }}>₹{p.amount}</span>
                    <span style={parametricBadgeStyle}>Verified by Parametric Trigger</span>
                  </div>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: '11px',
                      background: 'rgba(16,185,129,0.1)',
                      color: '#10b981',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    Processed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );

  if (view === 'landing') return <Landing />;
  if (view === 'rider-login') return <Login type="rider" />;
  if (view === 'admin-login') return <Login type="admin" />;
  if (view === 'rider-dashboard') return <RiderDashboard payouts={payouts} onBack={() => setView('landing')} />;
  if (view === 'admin-dashboard') return <AdminDashboard />;

  return <Landing />;
}

export default App;
