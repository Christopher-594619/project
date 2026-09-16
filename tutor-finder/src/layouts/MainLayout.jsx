// src/layouts/MainLayout.jsx
import React from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen w-50 overflow-x-hidden">
      <Navbar />

      <main className="flex-grow w-full min-w-0">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;