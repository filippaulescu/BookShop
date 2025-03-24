import { useParams } from 'react-router-dom';
import data from '../data';

function ProductScreen() {
  const { slug } = useParams();
  const product = data.products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <h1 className="text-center text-red-600 text-2xl mt-10">
        Produsul nu a fost găsit!
      </h1>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 shadow-lg rounded-lg mt-10 border border-gray-300">
      {/* Titlul produsului */}
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
        {product.name}
      </h1>

      <div className="flex flex-col md:flex-row bg-white p-6 rounded-lg shadow">
        {/* Imaginea produsului */}
        <div className="flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-64 h-auto rounded-lg shadow-md border border-gray-300"
          />
        </div>

        {/* Detalii produs */}
        <div className="ml-0 md:ml-8 mt-6 md:mt-0 flex-1">
          <p className="text-lg text-gray-700 mt-2">
            <span className="font-bold">Categorie:</span> {product.category}
          </p>
          <p className="text-gray-600 mt-2">
            <span className="font-bold">Brand:</span> {product.brand}
          </p>

          <div className="mt-4">
            <p className="text-xl font-bold text-green-600">
              Preț: ${product.price}
            </p>
            <p className="text-gray-700 mt-2">
              <span className="font-bold">Descriere:</span>{' '}
              {product.description}
            </p>
          </div>

          {/* Buton de adăugare în coș */}
          <button className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition">
            Adaugă în coș
          </button>

          {/* Secțiunea de rating */}
          <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-inner flex flex-col items-center">
            <p className="text-lg font-semibold text-gray-700 mb-2">Rating:</p>
            <div className="flex space-x-1">
              <span className="text-yellow-500 text-2xl">★</span>
              <span className="text-yellow-500 text-2xl">★</span>
              <span className="text-yellow-500 text-2xl">★</span>
              <span className="text-gray-400 text-2xl">★</span>
              <span className="text-gray-400 text-2xl">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductScreen;
