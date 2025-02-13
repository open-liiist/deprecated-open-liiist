SELECT p.id, p.name, p.full_name, p.description, p.current_price, p.discount, p.quantity, p.image_url, p.price_for_kg, p.created_at, p.updated_at, l.grocery, l.lat, l.lng, l.street, l.city, l.zip_code, l.working_hours, l.picks_up_in_store 
FROM "Product" p 
JOIN "Localization" l ON p."localizationId" = l.id 
WHERE p."updated_at" > :sql_last_value
-- Temporaneamente rimuoviamo il filtro per reindicizzare tutto
-- WHERE p."updated_at" > :sql_last_value