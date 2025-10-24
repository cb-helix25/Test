import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeIcons } from '@fluentui/react';
import CallHub from './pages/callhub/CallHub';
import './index.css';
import { ThemeProvider, useTheme } from './ThemeContext';

// Initialize FluentUI icons
initializeIcons();

// Floating theme toggle button
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        background: 'var(--button-background)',
        color: 'var(--button-text)',
        border: 'none',
        borderRadius: 20,
        padding: '8px 16px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
      aria-label="Toggle light/dark mode"
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeToggle />
      <CallHub />
    </ThemeProvider>
  </React.StrictMode>,
);