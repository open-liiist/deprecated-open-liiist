import express, { Request, Response } from 'express';
import prisma from './prisma';
import net from 'node:net'

const router = express.Router();

type ProductData = {
	full_name: string;
	name: string;
	description: string;
	price: number;
	discount: number;
	localization: {
		grocery: string;
		lat: number;
		lng: number;
	};
};

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

		const prismaTransaction = await prisma.$transaction(async (prisma) => {
			const product = await prisma.product.create({
				data: {
					full_name,
					name,
					description,
					price,
					discount,
					localization: {
						create: {
							grocery: localization.grocery,
							lat: localization.lat,
							lng: localization.long,
						},
					},
				},
			});

			// prepare data to send to elasticsearch via logstash
			const productData: ProductData = {
				full_name, name, description, price, discount,
				localization: {
					grocery: localization.grocery,
					lat: localization.lat,
					lng: localization.long,
				}
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
