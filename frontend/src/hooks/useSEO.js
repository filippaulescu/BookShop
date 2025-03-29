// src/hooks/useSEO.js
import { useEffect } from 'react';
import { useContext } from 'react';
import { StoreContext } from '../contexts/Store'; // PROBLEMA ESTE AICI!

export default function useSEO({ title, description }) {
  const { state } = useContext(StoreContext); // ACEASTĂ LINIE CAUZEAZĂ RECURSIVITATEA

  useEffect(() => {
    if (title) document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.content = description;
    }
  }, [title, description, state]); // DEPENDENȚA DE 'state' E PROBLEMATICĂ
}
