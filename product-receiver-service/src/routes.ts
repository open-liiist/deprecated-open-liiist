import express, { Request, Response } from 'express';
import prisma from './prisma';

const router = express.Router();

router.post('/product', async (req: Request, res: Response) => {

	try {
		const { full_name, name, description, price, discount, localization } = req.body;

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
		console.log('Product saved', product);
		res.status(201).json({ message: 'Product saved', product });
	} catch (error) {
		console.error('Failed to save product', error);
		res.status(500).json({ error: 'Failed to save product', details: error });
	}
});

export default router;
