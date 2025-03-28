// hooks/useSEO.js
import { useEffect } from 'react';

// Exemplu corect de implementare useSEO
const useSEO = ({ title, description }) => {
  useEffect(() => {
    if (title) document.title = title;
    // ... alte operații SEO
  }, [title, description]);
};

export default useSEO;
