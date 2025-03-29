// src/hooks/useSEO.js
import { useEffect } from 'react';

export default function useSEO({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    // Gestionează meta description
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag && description) {
      metaTag = document.createElement('meta');
      metaTag.name = 'description';
      document.head.appendChild(metaTag);
    }
    if (metaTag && description) {
      metaTag.content = description;
    }

    // Cleanup la unmount
    return () => {
      document.title = 'BookShop'; // Titlul implicit
      if (metaTag) {
        metaTag.content = ''; // Resetează description
      }
    };
  }, [title, description]); // Elimină dependența de context
}
