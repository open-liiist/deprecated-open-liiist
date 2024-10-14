import { MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
	const locale = 'en';
	const t = await getTranslations({ locale, namespace: 'manifest' });

	return {
		name: t('name'),
		start_url: '/',
	}
}
