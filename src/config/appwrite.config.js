
const config = {
  // Option 1: Use environment variables (recommended for production)
  // These will be used if environment variables are available
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  markdownCollectionId: import.meta.env.VITE_APPWRITE_MARKDOWN_COLLECTION_ID,

}

// Validation function to ensure all required configs are present
export const validateConfig = () => {
  const requiredFields = ['projectId', 'endpoint', 'databaseId', 'markdownCollectionId']
  const missingFields = requiredFields.filter(field => !config[field])
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required Appwrite configuration: ${missingFields.join(', ')}`)
  }
  
  return true
}

// Export individual configs for easy access
export const {
  projectId,
  endpoint,
  databaseId,
  markdownCollectionId
} = config

// Export the full config object
export default config

// Configuration metadata
export const configInfo = {
  source: import.meta.env.VITE_APPWRITE_PROJECT_ID ? 'environment' : 'config file',
  timestamp: new Date().toISOString(),
  version: '1.0.0'
}

// Helper function to get configuration summary (useful for debugging)
export const getConfigSummary = () => {
  return {
    projectId: projectId ? `${projectId.substring(0, 8)}...` : 'NOT SET',
    endpoint: endpoint || 'NOT SET',
    databaseId: databaseId ? `${databaseId.substring(0, 8)}...` : 'NOT SET',
    markdownCollectionId: markdownCollectionId ? `${markdownCollectionId.substring(0, 8)}...` : 'NOT SET',
    source: configInfo.source,
    isValid: (() => {
      try {
        validateConfig()
        return true
      } catch {
        return false
      }
    })()
  }
}
