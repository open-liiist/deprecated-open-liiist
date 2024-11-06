import express, { Request, Response } from 'express';
import prisma from './prisma';
import net from 'node:net'

const router = express.Router();

type ProductData = {
	name_id: string;
	full_name: string;
	name: string;
	description: string;
	price: number;
	discount: number;
	document_id: string;
	localization: {
		grocery: string;
		lat: number;
		lng: number;
	};
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
		const { full_name, name, description, price, discount, localization } = req.body;

		if (!full_name || !description || !price || 
			!localization || !localization.grocery || !localization.lat || !localization.long) {
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
					name_id, full_name, name, description, discount,
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
					full_name, name, description, discount,
					current_price: price,
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
				document_id: `${name_id}_${
					sanitizeString(localization.grocery)
				}_${
					sanitizeString(localization.lat)
				}_${
					sanitizeString(localization.long)
				}`,
				localization: {
					grocery: localization.grocery,
					lat: localization.lat,
					lng: localization.long,
				},
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

export default router;
