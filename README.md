# Bulk-whatsapp-Manager-Backend

## API Docs (Swagger UI)

- Visit `/api-docs` once the server is running to view and try the APIs.
- Local example: `http://localhost:3000/api-docs` (or your `PORT`).

### Auth in Swagger

- Use the Authorize button and paste a bearer token: `Bearer <ACCESS_TOKEN>`.
- Or set the `Authorization` header in each request with `Bearer <ACCESS_TOKEN>`.

### Required environment variables

- Server: `PORT`, `CORS_ORIGIN`
- MongoDB: `MONGODB_URI` (and DB name is appended in code), `DB_NAME`
- JWT: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, optional `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`
- WhatsApp/Meta: `META_GRAPH_VERSION`, `WHATSAPP_TOKEN`, `WA_PHONE_NUMBER_ID`, `WABA_ID`, `WEBHOOK_VERIFY_TOKEN`
- Crypto (optional helpers): `TOKEN_ENC_SECRET` (base64 32-byte)
