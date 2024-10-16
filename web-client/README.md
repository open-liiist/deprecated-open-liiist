# GrocyGo Web Client

## Development

First, run the development server and the necessary services:

```bash
docker compose build && docker compose up db auth-service web-client
```

* `db` is a PostgreSQL database.
* `auth-service` is a service that provides authentication.
* `web-client` is the Next.js web client.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
