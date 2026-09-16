import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MesaPage } from './pages/MesaPage';
import { DashboardPage } from './pages/DashboardPage';
import { QRGeneratorPage } from './pages/QRGeneratorPage';

function App() {
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/mesa/:mesaId" element={<MesaPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/qr" element={<QRGeneratorPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
