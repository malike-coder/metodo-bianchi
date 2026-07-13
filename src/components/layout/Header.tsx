import React, { useState } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Header: React.FC = () => {
  const { activeView, isDarkMode, setActiveView, toggleDarkMode } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleThemeToggle = () => {
    toggleDarkMode();
    document.body.classList.toggle('dark');
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '72px',
        background: 'rgba(240, 238, 233, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #D6D2CA',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(1rem, 4vw, 3.75rem)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#44403C',
            textDecoration: 'none',
          }}>
            Método Bianchi
          </span>
          <span style={{
            fontSize: '0.6rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#987557',
            marginTop: '3px',
            fontFamily: 'Jost, sans-serif',
            fontWeight: 500,
          }}>
            Mapa de Habitar
          </span>
        </div>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="header-desktop-nav">
          <div style={{
            display: 'flex',
            background: 'rgba(28, 25, 23, 0.04)',
            padding: '5px',
            borderRadius: '30px',
            border: '1px solid #D6D2CA',
          }}>
            {(['client', 'professional'] as const).map((view) => (
              <button key={view} type="button" onClick={() => setActiveView(view)} style={{
                border: 'none',
                background: activeView === view ? '#44403C' : 'transparent',
                color: activeView === view ? '#F0EEE9' : '#878179',
                padding: '8px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: 'Jost, sans-serif',
                fontSize: '0.82rem',
                fontWeight: 400,
                letterSpacing: '0.08em',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}>
                {view === 'client' ? 'App de Usuario' : 'Panel Bianchi Estudio'}
              </button>
            ))}
          </div>
          <button type="button" onClick={handleThemeToggle} style={{
            width: '38px', height: '38px',
            borderRadius: '50%',
            border: '1px solid #D6D2CA',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#44403C',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}>
            {isDarkMode ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile: only theme + hamburger */}
        <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="header-mobile-nav">
          <button type="button" onClick={handleThemeToggle} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            border: '1px solid #D6D2CA', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#44403C',
          }}>
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button type="button" onClick={() => setMenuOpen(!menuOpen)} style={{
            width: '34px', height: '34px', borderRadius: '50%',
            border: '1px solid #D6D2CA', background: 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#44403C',
          }}>
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '72px', left: 0, right: 0,
          background: 'rgba(240,238,233,0.98)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #D6D2CA',
          padding: '1rem',
          zIndex: 999,
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {(['client', 'professional'] as const).map((view) => (
            <button key={view} type="button"
              onClick={() => { setActiveView(view); setMenuOpen(false); }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 16px', borderRadius: '8px',
                border: 'none', cursor: 'pointer',
                background: activeView === view ? '#44403C' : 'rgba(0,0,0,0.03)',
                color: activeView === view ? '#F0EEE9' : '#44403C',
                fontFamily: 'Jost, sans-serif', fontSize: '0.9rem',
              }}>
              {view === 'client' ? 'App de Usuario' : 'Panel Bianchi Estudio'}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;
