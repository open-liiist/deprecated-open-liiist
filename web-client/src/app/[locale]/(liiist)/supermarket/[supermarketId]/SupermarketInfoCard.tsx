import { Supermarket } from '@/types';

export default function SupermarketInfoCard({ supermarket }: { supermarket: Supermarket }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-2">{supermarket.name}</h1>
            <p className="text-gray-600 mb-1">{supermarket.street}, {supermarket.city}</p>
            <p className="text-gray-600">CAP: {supermarket.zip_code}</p>
            <p className="text-gray-600 mb-1">Orari di apertura: {supermarket.working_hours}</p>
            <p className="text-gray-600 mb-4">Ritiro in negozio: {supermarket.pickup_available ? 'Sì' : 'No'}</p>
        </div>
    );
}
