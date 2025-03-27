import { useEffect } from 'react';

const useSEO = ({ title }) => {
  useEffect(() => {
    // Afișează DOAR titlul primit sau "BookShop" dacă title este undefined
    document.title = title || 'BookShop';
  }, [title]);
};

export default useSEO;
