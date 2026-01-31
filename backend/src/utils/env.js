const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'STRIPE_SECRET_KEY'
];

for (const k of required) {
  if (!process.env[k]) {
    console.error('Missing env var: ' + k);
    process.exit(1);
  }
}

module.exports = {};
