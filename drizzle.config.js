module.exports = {
  schema: './shared/schema.ts',
  out: './drizzle',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  dialect: 'postgresql',
};