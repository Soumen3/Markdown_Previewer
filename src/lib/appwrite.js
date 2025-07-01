import { Client, Account, Databases } from 'appwrite';
import { endpoint, projectId, validateConfig } from '../config/appwrite.config.js';

// Validate configuration before initializing client
try {
  validateConfig();
} catch (error) {
  console.error('Appwrite configuration error:', error.message);
  throw error;
}

export const client = new Client();

client
    .setEndpoint(endpoint) // Using endpoint from config file
    .setProject(projectId); // Using project ID from config file

export const account = new Account(client);
export const databases = new Databases(client);
export { ID, Query } from 'appwrite';
