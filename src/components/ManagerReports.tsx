import React, { useState } from 'react';
import { reportsApi } from '../services/api';
import type { ManagerSalesReport, DailySales, ItemSales } from '../types/types';

const ManagerReports: React.FC = () => {
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [days, setDays] = useState<number | ''>(30);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ManagerSalesReport | null>(null);
  const [daily, setDaily] = useState<DailySales[] | null>(null);
  const [topItems, setTopItems] = useState<ItemSales[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchSales() {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (start) params.start = start;
      if (end) params.end = end;
      if (days) params.days = days;

      const res = await reportsApi.sales(params);
      setReport(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDaily() {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (start) params.start = start;
      if (end) params.end = end;
      if (days) params.days = days;

      const res = await reportsApi.daily(params);
      setDaily(res.daily);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch daily report');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTop() {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (start) params.start = start;
      if (end) params.end = end;
      if (days) params.days = days;

      const res = await reportsApi.topItems(params);
      setTopItems(res.top);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch top items');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Manager Reports</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <label>
          Start:
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>

        <label>
          End:
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>

        <label>
          Days (if empty, uses start/end):
          <input
            type="number"
            min={1}
            value={days === '' ? '' : String(days)}
            onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>

        <button onClick={fetchSales} disabled={loading}>
          Generate Sales Summary
        </button>

        <button onClick={fetchDaily} disabled={loading}>
          Daily Series
        </button>

        <button onClick={fetchTop} disabled={loading}>
          Top Items
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {report && (
        <section style={{ marginTop: 12 }}>
          <h3>Sales Summary</h3>
          <div>Range: {report.range.start} → {report.range.end}</div>
          <div>Total Orders: {report.summary.totalOrders}</div>
          <div>Total Revenue: {String(report.summary.totalRevenue)}</div>

          <h4>Items</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Item</th>
                <th>Qty</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((it) => (
                <tr key={it.menuItemId}>
                  <td>{it.itemName}</td>
                  <td style={{ textAlign: 'center' }}>{it.quantitySold}</td>
                  <td style={{ textAlign: 'right' }}>{String(it.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {daily && (
        <section style={{ marginTop: 12 }}>
          <h3>Daily Sales</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((d) => (
                <tr key={d.day}>
                  <td>{d.day}</td>
                  <td style={{ textAlign: 'center' }}>{d.orders}</td>
                  <td style={{ textAlign: 'right' }}>{String(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {topItems && (
        <section style={{ marginTop: 12 }}>
          <h3>Top Items</h3>
          <ol>
            {topItems.map((t) => (
              <li key={t.menuItemId}>{t.itemName} — Qty: {t.quantitySold} — Revenue: {String(t.revenue)}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};

export default ManagerReports;
