// filepath: C:\Users\saipo\OneDrive\Desktop\guideWire\frontend\src\components\Dashboard.js
import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [payouts, setPayouts] = useState([]);
  useEffect(() => {
    fetch((process.env.REACT_APP_BACKEND_URL || "http://localhost:4000") + "/payouts")
      .then(r => r.json())
      .then(setPayouts)
      .catch(console.error);
  }, []);
  return (
    <div>
      <h3>Recent Payouts / Triggers</h3>
      <table border="1" cellPadding="6">
        <thead><tr><th>Time</th><th>Zone</th><th>Trigger</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {payouts.map(p => (
            <tr key={p.id}>
              <td>{new Date(p.createdAt?.seconds ? p.createdAt.seconds * 1000 : p.createdAt).toLocaleString()}</td>
              <td>{p.zoneName}</td>
              <td>{p.trigger} ({p.rainfallMm ?? "-" } mm)</td>
              <td>₹{p.amount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
