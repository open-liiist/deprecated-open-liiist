import { Localization } from '@/types';
import SupermarketInfoCard from './SupermarketInfoCard';
import SupermarketProducts from './SupermarketProducts';

async function getLocalizationData(localizationId: string): Promise<Localization | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL non è definito.');
    }

    try {
        const res = await fetch(`${apiUrl}/api/supermarket/${localizationId}`, { cache: 'no-store' });
        if (!res.ok) {
            console.error(`Errore API: ${res.status} ${res.statusText}`);
            return null;
        }

        const data: Localization = await res.json();
        return data;
    } catch (error) {
        console.error('Errore durante la chiamata API:', error);
        return null;
    }
}

export default async function SupermarketPage({ params }: { params: { supermarketId: string } }) {
    const localizationId = parseInt(params.supermarketId, 10);
    if (isNaN(localizationId)) {
        return (
            <div className="p-8">
                <p className="text-center text-gray-500 text-xl">ID Supermercato non valido</p>
            </div>
        );
    }

    const localization = await getLocalizationData(params.supermarketId);

    if (!localization) {
        return (
            <div className="p-8">
                <p className="text-center text-gray-500 text-xl">Supermercato non trovato</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <SupermarketInfoCard supermarket={localization} />
            <SupermarketProducts products={localization.products} />
        </div>
    );
}
