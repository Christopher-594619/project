import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import FeaturedTutors from './components/FeaturedTutors';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Hero />
      <FeaturedTutors />
    </div>
  );
};

export default Landing;