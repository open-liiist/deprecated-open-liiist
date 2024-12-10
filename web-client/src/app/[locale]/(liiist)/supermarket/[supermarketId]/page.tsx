import { Supermarket } from '@/types';
import SupermarketInfoCard from './SupermarketInfoCard';
import SupermarketProducts from './SupermarketProducts';

async function getSupermarketData(supermarketId: string): Promise<Supermarket | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL non è definito.');
    }

    const res = await fetch(`${apiUrl}/api/supermarket/${supermarketId}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
}

export default async function SupermarketPage({ params }: { params: { supermarketId: string } }) {
    const supermarket = await getSupermarketData(params.supermarketId);

    if (!supermarket) {
        return (
            <div className="p-8">
                <p className="text-center text-gray-500 text-xl">Supermercato non trovato</p>
            </div>
        );
    }

    // Passiamo i dati al componente di visualizzazione
    return (
        <div className="p-8 space-y-8">
            {/* Info Supermercato */}
            <SupermarketInfoCard supermarket={supermarket} />

            {/* Sezione Prodotti con ricerca e paginazione */}
            <SupermarketProducts products={supermarket.products} />
        </div>
    );
}
