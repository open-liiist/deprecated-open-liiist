"use client";

import { Product } from '@/types';
import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

const PRODUCTS_PER_PAGE = 16;

// Definizione delle opzioni di ordinamento
type SortOption = 'DEFAULT' | 'DISCOUNT' | 'PRICE_DESC' | 'PRICE_ASC';

export default function SupermarketProducts({ products }: { products: Product[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');

    // Inizializza Fuse.js
    const fuse = useMemo(() => {
        return new Fuse(products, {
            keys: ['full_name', 'description'],
            threshold: 0.4, // Regola la sensibilità della ricerca fuzzy
        });
    }, [products]);

    // Filtraggio e Ordinamento dei prodotti
    const filteredAndSortedProducts = useMemo(() => {
        let filtered: Product[];

        if (searchTerm.trim() !== '') {
            const fuseResults = fuse.search(searchTerm);
            filtered = fuseResults.map(result => result.item);
        } else {
            filtered = [...products];
        }

        switch (sortOption) {
            case 'DISCOUNT':
                filtered.sort((a, b) => {
                    if (a.discount && !b.discount) return -1;
                    if (!a.discount && b.discount) return 1;
                    return 0;
                });
                break;
            case 'PRICE_DESC':
                filtered.sort((a, b) => b.current_price - a.current_price);
                break;
            case 'PRICE_ASC':
                filtered.sort((a, b) => a.current_price - b.current_price);
                break;
            case 'DEFAULT':
            default:
                filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
                break;
        }

        return filtered;
    }, [fuse, products, searchTerm, sortOption]);

    // Calcolo prodotti della pagina corrente
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const currentProducts = useMemo(() => {
        return filteredAndSortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    }, [filteredAndSortedProducts, startIndex]);

    // Numero totale di pagine
    const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Resetta alla prima pagina su nuova ricerca
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOption(e.target.value as SortOption);
        setCurrentPage(1); // Resetta alla prima pagina su nuovo ordinamento
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSortOption('DEFAULT');
        setCurrentPage(1);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            {/* Barra di ricerca e ordinamento */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Barra di ricerca */}
                <div className="flex items-center flex-1">
                    <input
                        type="text"
                        placeholder="Cerca prodotti..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="flex-1 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Ordinamento */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="sort" className="text-gray-700">Ordina per:</label>
                    <select
                        id="sort"
                        value={sortOption}
                        onChange={handleSortChange}
                        className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="DEFAULT">Default</option>
                        <option value="DISCOUNT">Prodotti in sconto</option>
                        <option value="PRICE_DESC">Prezzo: più caro</option>
                        <option value="PRICE_ASC">Prezzo: meno caro</option>
                    </select>
                    <button
                        onClick={resetFilters}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Azzera filtri
                    </button>
                </div>
            </div>

            {/* Lista prodotti */}
            {currentProducts.length === 0 ? (
                <p className="text-gray-500">Nessun prodotto trovato.</p>
            ) : (
                <>
                    <p className="text-gray-700">Trovati {filteredAndSortedProducts.length} prodotti.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {currentProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                                <img 
                                    src={product.image_url ?? '/placeholder.jpg'} 
                                    alt={product.full_name}
                                    className="w-full h-40 object-cover rounded mb-2"
                                />
                                <h3 className="font-semibold text-lg mb-1">{product.full_name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                <div className="mt-auto">
                                    <p className="text-gray-800">
                                        Prezzo: <span className="font-bold">€{product.current_price.toFixed(2)}</span>
                                    </p>
                                    {product.discount && (
                                        <p className="text-green-600">
                                            Sconto: <span className="font-bold">{product.discount}%</span>
                                        </p>
                                    )}
                                    {product.price_for_kg && (
                                        <p className="text-gray-500">
                                            Prezzo al kg: <span>€{product.price_for_kg.toFixed(2)}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Paginazione */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4 mt-4">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                    >
                        Previous
                    </button>
                    <span>Pagina {currentPage} di {totalPages}</span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
