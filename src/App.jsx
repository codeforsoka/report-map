import { useState } from 'react';
import ReportForm from './components/ReportForm';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [view, setView] = useState('report');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <header style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)'
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0
          }}>
            草加市 報告システム
          </h1>
          <nav>
            <button
              onClick={() => setView('report')}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                marginRight: 'var(--spacing-sm)',
                backgroundColor: view === 'report' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: view === 'report' ? 'var(--color-surface)' : 'var(--color-text)',
                border: view === 'report' ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 'var(--font-size-base)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (view !== 'report') {
                  e.target.style.backgroundColor = 'var(--color-primary-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (view !== 'report') {
                  e.target.style.backgroundColor = 'var(--color-surface)';
                }
              }}
            >
              報告する
            </button>
            <button
              onClick={() => setView('admin')}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                backgroundColor: view === 'admin' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: view === 'admin' ? 'var(--color-surface)' : 'var(--color-text)',
                border: view === 'admin' ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 'var(--font-size-base)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (view !== 'admin') {
                  e.target.style.backgroundColor = 'var(--color-primary-light)';
                }
              }}
              onMouseLeave={(e) => {
                if (view !== 'admin') {
                  e.target.style.backgroundColor = 'var(--color-surface)';
                }
              }}
            >
              管理画面
            </button>
          </nav>
        </div>
      </header>

      <main>
        {view === 'report' ? <ReportForm /> : <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
