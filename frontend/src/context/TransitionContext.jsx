import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TransitionContext = createContext();

export const useTransition = () => useContext(TransitionContext);

export const TransitionProvider = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const navigate = useNavigate();

  const triggerTransition = (category, targetUrl) => {
    // Only trigger if a target URL is provided
    if (!targetUrl) return;
    
    setActiveCategory(category);
    
    // Wait 1.2s for the entry animation (covering screen)
    setTimeout(() => {
      navigate(targetUrl);
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Wait another 0.8s for the exit animation (revealing new page)
      setTimeout(() => {
        setActiveCategory(null);
      }, 800);
    }, 1200);
  };

  return (
    <TransitionContext.Provider value={{ activeCategory, triggerTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};
