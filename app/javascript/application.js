// Entry point for the build script in your package.json
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/HomePage';
import Buildings from './components/Buildings';

function AppRouter() {
  return (
    <BrowserRouter>
      <div>
        <img src="https://cdn.prod.website-files.com/67f688c51cfd3832cdf1ef92/67f688c51cfd3832cdf1f02d___perchwell_logo_type_electric_mint.png" alt="Perchwell Logo" style={{ width: '200px' }} />
      </div>
      <div style={{ padding: '16px' }}>
        <nav style={{ marginBottom: '16px' }}>
          <Link to="/" style={{ marginRight: '12px' }}>Home</Link>
          <Link to="/buildings">Buildings</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buildings" element={<Buildings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('react-root');
  if (node) {
    const root = createRoot(node);
    root.render(<AppRouter />);
  }
});
