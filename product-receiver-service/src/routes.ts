import express, { Request, Response } from 'express';
import prisma from './prisma';
import net from 'node:net'

const router = express.Router();

type ProductData = {
	name_id: string;
	full_name: string;
	name: string;
	description: string | null;
	price: number;
	discount: number;
	document_id: string;
	localization: {
		grocery: string;
		lat: number;
		lon: number;
	};
	location: {
		lat: number;
		lon: number;
	};
	img_url?: string;
	price_for_kg?: number;
};

function sanitizeString(fullName: string) {
	return fullName
		.toString()							 	// Convert to string
		.toLowerCase()                          // Convert to lowercase
		.replace(/[^a-z0-9\s]/g, '')            // Remove special characters except spaces
		.replace(/\s+/g, '_')                   // Replace spaces with underscores
		.replace(/_+$/g, '');                   // Remove trailing underscores (if any)
}

function sendToLogstash(productData: ProductData): Promise<void> {
	return new Promise((resolve, reject) => {
		const client = new net.Socket();

		client.connect(50000, 'logstash', function() {
			console.log('Connected to logstash');
			client.write(JSON.stringify(productData) + '\n');
			client.end();
		});

		client.on('error', (err) => {
			console.error('Error connecting to logstash', err);
			reject(err);
		});

		client.on('close', () => {
			console.log('Connection to logstash closed');
			resolve();
		});
	});
}

router.post('/product', async (req: Request, res: Response) => {

	try {
		const {
			full_name,
			name,
			description,
			discounted_price: discount,
			localization,
			img_url,
			price,
			price_for_kg,
		} = req.body;

		if (!full_name || !price || !localization || !localization.grocery) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		console.log('typeof full_name', typeof full_name);

		if (typeof full_name !== 'string' || typeof description !== 'string' || typeof price !== 'number') {
			res.status(400).json({ error: 'Invalid data types' });
			return;
		}

		const name_id = sanitizeString(full_name);

		const prismaTransaction = await prisma.$transaction(async (prisma) => {
			const product = await prisma.product.upsert({
				where: { name_id },
				create: {
					name_id, full_name, discount,
					description: description || '',
					name: name_id,
					current_price: price,
					localization: {
						connectOrCreate: {
							where: {
								grocery_lat_lng: {
									grocery: localization.grocery,
									lat: localization.lat,
									lng: localization.long,
								}
							},
							create: {
								grocery: localization.grocery,
								lat: localization.lat,
								lng: localization.long,
							}
						}
					}
				},
				update: {
					full_name, discount,
					description: description || '',
					name: name_id,
					current_price: price,
					image_url: img_url,
					price_for_kg,
				}
			});

			await prisma.productHistory.create({
				data: {
					productId: product.id,
					price, discount
				}
			});

			// prepare data to send to elasticsearch via logstash
			const productData: ProductData = {
				full_name, name, description, price, discount, name_id,
				document_id: `${name_id}_${sanitizeString(localization.grocery)
					}_${sanitizeString(localization.lat)
					}_${sanitizeString(localization.long)
					}`,
				localization: {
					grocery: localization.grocery,
					lat: localization.lat,
					lon: localization.long,
				},
				location: { lat: localization.lat, lon: localization.long },
			}

			try {
				await sendToLogstash(productData);
				console.log('Product saved in RDBMS and sent to logstash', productData);
				return product;
			} catch (err) {
				console.error('Failed to send data to logstash, rolling back transaction', err);
			}
		});


		if (!prismaTransaction) {
			res.status(500).json({ error: 'Failed to save product' });
			return;
		}
		res.status(201).json({ message: 'Product saved', prismaTransaction });
	} catch (error) {
		console.error('Failed to save product', error);
		res.status(500).json({ error: 'Failed to save product', details: error });
	}
});

router.post('/store', async (req: Request, res: Response) => {
	try {
		const {
			name,
			lat,
			long,
			street,
			city,
			working_hours,
			picks_up_in_shop,
			zip_code
		} = req.body;

		if (!name || !lat || !long) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		if (typeof name !== 'string' || typeof lat !== 'number' || typeof long !== 'number') {
			res.status(400).json({ error: 'Invalid data types' });
			return;
		}

		const store = await prisma.localization.create({
			data: {
				grocery: name,
				lat,
				lng: long,
				street,
				city,
				working_hours,
				picks_up_in_store: picks_up_in_shop,
				zip_code,
			}
		});

		res.status(201).json({ message: 'Store saved', store });
	} catch (error) {
		console.error('Failed to save store', error);
		res.status(500).json({ error: 'Failed to save store', details: error });
	}
})

router.get('/store', async (_: Request, res: Response) => {
	try {
		const stores = await prisma.localization.findMany();
		res.status(200).json({ stores });
	} catch (error) {
		console.error('Failed to fetch stores', error);
		res.status(500).json({ error: 'Failed to fetch stores', details: error });
	}
})

router.get('/store/:grocery/:city', async (req: Request, res: Response) => {
	try {
		const { grocery, city } = req.params;

		if (!grocery || !city) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		const stores = await prisma.localization.findMany({
			where: {
				grocery,
				city
			}
		});

		res.status(200).json({ stores });
	} catch (error) {
		console.error('Failed to fetch stores', error);
		res.status(500).json({ error: 'Failed to fetch stores', details: error });
	}
})

export default router;
