const path = require('path');

module.exports = ({ env }) => ({
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'STSTEST'),
        user: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', ''),
        schema: env('DATABASE_SCHEMA', 'public'),
        pool: {
          min: 0, // ← this line is important
        }
     // Not required
        // ssl: {
        //   rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
        // },
      },
      debug: false,
    },
});

// host: env('DATABASE_HOST', '10.1.1.246'),
// port: env.int('DATABASE_PORT', 5432),
// database: env('DATABASE_NAME', 'STS'),
// user: env('DATABASE_USERNAME', 'postgres'),
// password: env('DATABASE_PASSWORD', '93RRQmAa'),
// schema: env('DATABASE_SCHEMA', 'public'),

