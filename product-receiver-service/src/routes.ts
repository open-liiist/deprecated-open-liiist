/**
 * product-receiver-service/src/routes.ts
 */
import express, { Request, Response, NextFunction } from 'express';
import net from 'node:net';
import prisma from './prisma'; // your PrismaClient instance
import { z } from 'zod';      // validation library

const router = express.Router();

/* ------------------------------------------------------------------
 *                     VALIDATION MIDDLEWARE
 * ------------------------------------------------------------------ */

// Product schema
const productSchema = z.object({
  full_name: z.string().min(1, 'full_name is required'),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  discount: z.number().min(0).optional(),
  quantity: z.string().nullable().optional(),
  img_url: z.string().url().optional(),
  price_for_kg: z.number().min(0).optional(),
  localization: z.object({
    grocery: z.string().min(1, 'grocery is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    // also handle street in products
    street: z.string().min(1, 'street is required'),
  }),
});

// Store schema
const storeSchema = z.object({
  name: z.string().min(1, 'name is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  street: z.string().nullable().optional(),  // accepts string or null
  city: z.string().optional(),
  working_hours: z.string().optional(),
  picks_up_in_shop: z.boolean().optional(),
  zip_code: z.string().optional(),
});

// Validate product request
function validateProduct(req: Request, res: Response, next: NextFunction) {
  const result = productSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: result.error.format() 
    });
  }
  res.locals.productData = result.data;
  next();
}

// Validate store request
function validateStore(req: Request, res: Response, next: NextFunction) {
  const result = storeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: result.error.format() 
    });
  }
  res.locals.storeData = result.data;
  next();
}

/* ------------------------------------------------------------------
 *                           UTILS
 * ------------------------------------------------------------------ */

function sanitizeString(s: string): string {
  return s
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+$/g, '');
}

async function sendToLogstash(data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    const logstashHost = process.env.LOGSTASH_HOST || 'localhost';
    const logstashPort = parseInt(process.env.LOGSTASH_PORT || '50000', 10);

    client.connect(logstashPort, logstashHost, () => {
      client.write(JSON.stringify(data) + '\n');
      client.end();
    });

    client.on('error', (err) => reject(err));
    client.on('close', () => resolve());
  });
}

function renameLongToLng(data: any): any {
  const cloned = { ...data };
  if (cloned.localization?.long !== undefined) {
    cloned.localization.lng = cloned.localization.long;
    delete cloned.localization.long;
  }
  if (cloned.location?.long !== undefined) {
    cloned.location.lng = cloned.location.long;
    delete cloned.location.long;
  }
  return cloned;
}

/* ------------------------------------------------------------------
 *                     UP-SERT PRODUCTS
 * ------------------------------------------------------------------ */

/**
 * Performs an upsert for Product based on (name_id, localizationId).
 * First it creates/updates the Localization with the key (grocery_lat_lng_street).
 * In the product payload, if street is not provided, it must be supplied.
 */
async function upsertProductWithRetry(data: any, maxRetries = 3, retryDelay = 1000) {
  let attempt = 0;

  // Extract name_id from the provided full_name or name
  const name_id = sanitizeString(data.full_name || data.name);

  // Ensure street is provided; otherwise throw an error
  const streetForConstraint = data.localization?.street;
  if (!streetForConstraint) {
    throw new Error("Missing 'street' for product localization");
  }

  while (attempt < maxRetries) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1) Upsert the localization by (grocery, lat, lng, street)
        const loc = await tx.localization.upsert({
          where: {
            grocery_lat_lng_street: {
              grocery: data.localization.grocery,
              lat: data.localization.lat,
              lng: data.localization.lng,
              street: streetForConstraint,
            },
          },
          update: {
            // Update fields if necessary when record exists
          },
          create: {
            grocery: data.localization.grocery,
            lat: data.localization.lat,
            lng: data.localization.lng,
            street: streetForConstraint,
          },
        });

        // 2) Upsert product (key: name_id + localizationId)
        const existingProduct = await tx.product.findUnique({
          where: {
            name_id_localizationId: {
              name_id,
              localizationId: loc.id,
            },
          },
        });

        const product = await tx.product.upsert({
          where: {
            name_id_localizationId: {
              name_id,
              localizationId: loc.id,
            },
          },
          create: {
            name_id,
            full_name: data.full_name,
            discount: data.discount || 0.0,
            quantity: data.quantity || '',
            description: data.description || '',
            name: name_id,
            current_price: data.price,
            localizationId: loc.id,
            image_url: data.img_url,
            price_for_kg: data.price_for_kg,
          },
          update: {
            full_name: data.full_name,
            discount: data.discount,
            description: data.description || '',
            name: name_id,
            current_price: data.price,
            image_url: data.img_url,
            price_for_kg: data.price_for_kg,
            quantity: data.quantity || '',
          },
        });

        // 3) Insert a record in the ProductHistory
        await tx.productHistory.create({
          data: {
            productId: product.id,
            price: data.price,
            discount: product.discount,
          },
        });

        const action = existingProduct ? 'updated' : 'created';

        return { product, action };
      });
      return result;
    } catch (err: any) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, err);

      if (err.code === 'P2028') {
        console.warn('Timeout encountered, retrying...');
        await new Promise((r) => setTimeout(r, retryDelay));
      } else if (err.code === 'P2002') {
        console.warn('Unique key violation detected, retrying...');
        await new Promise((r) => setTimeout(r, retryDelay));
      } else {
        throw err;
      }
    }
  }

  return null;
}

/* ------------------------------------------------------------------
 *                    PRODUCT & STORE HANDLERS
 * ------------------------------------------------------------------ */

async function createOrUpdateProductHandler(req: Request, res: Response) {
  try {
    console.log('Received product data:', req.body);
    const data = renameLongToLng(res.locals.productData);

    const result = await upsertProductWithRetry(data);
    if (!result) {
      return res.status(500).json({ error: 'Failed to save product' });
    }
    const { product, action } = result;
    console.info(`Product ${action}: ${product.full_name}`);
    await sendToLogstash({
      id: product.id,  
      ...data,
      name_id: product.name_id,
      name: product.name,  // Ensure 'name' is included
      action,
    });

    return res.status(201).json({ message: 'Product saved', product, action });
  } catch (error: any) {
    console.error('Error saving product:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function createOrUpdateStoreHandler(req: Request, res: Response) {
  try {
    console.log('Received store data:', req.body);
    const data = renameLongToLng(res.locals.storeData);

    // If street is null/undefined, fallback to empty string
    const streetForConstraint = data.street || '';

    const result = await prisma.$transaction(async (tx) => {
      // 1) Search for a record with (grocery, lat, lng, street)
      const existingStore = await tx.localization.findUnique({
        where: {
          grocery_lat_lng_street: {
            grocery: data.name,
            lat: data.lat,
            lng: data.lng,
            street: streetForConstraint,
          },
        },
      });

      // 2) Upsert
      const store = await tx.localization.upsert({
        where: {
          grocery_lat_lng_street: {
            grocery: data.name,
            lat: data.lat,
            lng: data.lng,
            street: streetForConstraint,
          },
        },
        update: {
          street: data.street ?? '',
          city: data.city,
          working_hours: data.working_hours,
          picks_up_in_store: data.picks_up_in_shop,
          zip_code: data.zip_code,
        },
        create: {
          grocery: data.name,
          lat: data.lat,
          lng: data.lng,
          street: streetForConstraint,
          city: data.city,
          working_hours: data.working_hours,
          picks_up_in_store: data.picks_up_in_shop,
          zip_code: data.zip_code,
        },
      });

      const action = existingStore ? 'updated' : 'created';
      return { store, action };
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to save store' });
    }

    const { store, action } = result;
    console.info(`Store ${action}: ${store.grocery}`);

    return res.status(201).json({
      message: 'Store saved',
      store,
      action,
    });
  } catch (error: any) {
    console.error('Error saving store:', error);
    return res.status(500).json({ error: error.message });
  }
}

/* ------------------------------------------------------------------
 *                             ROUTES
 * ------------------------------------------------------------------ */

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

// POST /product
router.post('/product', validateProduct, createOrUpdateProductHandler);

// POST /store
router.post('/store', validateStore, createOrUpdateStoreHandler);

// GET /store
router.get('/store', async (_req, res) => {
  try {
    const stores = await prisma.localization.findMany();
    return res.status(200).json({ stores });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch stores', details: error.message });
  }
});

// GET /store/:grocery/:city
router.get('/store/:grocery/:city', async (req, res) => {
  try {
    const { grocery, city } = req.params;
    if (!grocery || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const stores = await prisma.localization.findMany({
      where: { grocery, city },
    });
    return res.status(200).json({ stores });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch stores', details: error.message });
  }
});

export default router;
