import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TransitionContext = createContext();

export const useTransition = () => useContext(TransitionContext);

export const TransitionProvider = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [transitionProducts, setTransitionProducts] = useState([]);
  const [zoomPhase, setZoomPhase] = useState(false);
  const navigate = useNavigate();

  const triggerTransition = async (category, targetUrl) => {
    if (!targetUrl) return;

    try {
      const { data } = await axios.get(`http://localhost:5000/api/products?category=${encodeURIComponent(category)}&limit=6`);
      setTransitionProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch transition products', error);
      setTransitionProducts([]);
    }
    
    setActiveCategory(category);
    setZoomPhase(false);
    
    // Start the "Zoom Inside" effect after 1.8s
    setTimeout(() => {
      setZoomPhase(true);
    }, 1800);

    // Wait for the sequence to complete before navigating
    setTimeout(() => {
      navigate(targetUrl);
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Cleanup after new page renders
      setTimeout(() => {
        setActiveCategory(null);
        setTransitionProducts([]);
        setZoomPhase(false);
      }, 500);
    }, 2300);
  };

  return (
    <TransitionContext.Provider value={{ activeCategory, transitionProducts, zoomPhase, triggerTransition }}>
      {children}
    </TransitionContext.Provider>
  );
};
