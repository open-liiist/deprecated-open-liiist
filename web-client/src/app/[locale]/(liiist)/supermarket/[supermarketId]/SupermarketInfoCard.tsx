import { Localization } from '@/types';

export default function SupermarketInfoCard({ supermarket }: { supermarket: Localization }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-2">{supermarket.grocery}</h1>
            <p className="text-gray-600 mb-1">{supermarket.street ?? 'Non disponibile'}, {supermarket.city ?? 'Non disponibile'}</p>
            <p className="text-gray-600">CAP: {supermarket.zip_code ?? 'Non disponibile'}</p>
            <p className="text-gray-600 mb-1">Orari di apertura: {supermarket.working_hours ?? 'Non disponibile'}</p>
            <p className="text-gray-600 mb-4">Ritiro in negozio: {supermarket.picks_up_in_store ? 'Sì' : 'No'}</p>
        </div>
    );
}
