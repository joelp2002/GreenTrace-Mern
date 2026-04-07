require('dotenv').config();
console.log('PORT from .env:', process.env.PORT);
console.log('MONGODB_URI from .env:', process.env.MONGODB_URI ? 'Set' : 'Not set');
