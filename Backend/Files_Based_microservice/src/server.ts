import dotenv from 'dotenv';
dotenv.config();  
import app from './app';
import logger from './utils/logger';
import { deleteExpiredFiles } from './services/file.service';

const PORT = process.env.PORT || 8001;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Cleanup expired files on startup
deleteExpiredFiles().catch(err => {
  logger.error(`Error during initial file cleanup: ${err}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});console.log("server run on the port http://localhost:8001")

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});

export default server;