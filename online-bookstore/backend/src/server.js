require('dotenv').config();

const app = require('./app');
const { logger } = require('./config/env');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`BookWorm server running on port ${PORT}`);
});
