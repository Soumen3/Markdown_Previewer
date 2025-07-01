import { databases, ID, Query } from '../lib/appwrite'
import { databaseId, markdownCollectionId } from '../config/appwrite.config.js'

// Database and Collection IDs from configuration file
const DATABASE_ID = databaseId
const MARKDOWN_COLLECTION_ID = markdownCollectionId

/**
 * Create a new markdown document
 * @param {Object} documentData - The document data
 * @param {string} documentData.title - Document title
 * @param {string} documentData.content - Document content
 * @param {string} documentData.userId - User ID who owns the document
 * @returns {Promise<Object>} Created document
 */
export const createMarkdownDocument = async (documentData) => {
  try {
    const data = {
      title: documentData.title,
      content: documentData.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: documentData.userId
    }

    const response = await databases.createDocument(
      DATABASE_ID,
      MARKDOWN_COLLECTION_ID,
      ID.unique(),
      data
    )

    return response
  } catch (error) {
    console.error('Failed to create document:', error)
    throw new Error(`Failed to create document: ${error.message}`)
  }
}

/**
 * Get a markdown document by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document data
 */
export const getMarkdownDocument = async (documentId) => {
  try {
    const document = await databases.getDocument(
      DATABASE_ID,
      MARKDOWN_COLLECTION_ID,
      documentId
    )

    return document
  } catch (error) {
    console.error('Failed to get document:', error)
    throw new Error(`Failed to load document: ${error.message}`)
  }
}

/**
 * Update an existing markdown document
 * @param {string} documentId - Document ID
 * @param {Object} updateData - Data to update
 * @param {string} updateData.title - Document title
 * @param {string} updateData.content - Document content
 * @returns {Promise<Object>} Updated document
 */
export const updateMarkdownDocument = async (documentId, updateData) => {
  try {
    const data = {
      title: updateData.title,
      content: updateData.content,
      updatedAt: new Date().toISOString()
    }

    const response = await databases.updateDocument(
      DATABASE_ID,
      MARKDOWN_COLLECTION_ID,
      documentId,
      data
    )

    return response
  } catch (error) {
    console.error('Failed to update document:', error)
    throw new Error(`Failed to save document: ${error.message}`)
  }
}

/**
 * Delete a markdown document
 * @param {string} documentId - Document ID
 * @returns {Promise<void>}
 */
export const deleteMarkdownDocument = async (documentId) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      MARKDOWN_COLLECTION_ID,
      documentId
    )
  } catch (error) {
    console.error('Failed to delete document:', error)
    throw new Error(`Failed to delete document: ${error.message}`)
  }
}

/**
 * Get all markdown documents for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of documents
 */
export const getUserMarkdownDocuments = async (userId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      MARKDOWN_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('updatedAt')
      ]
    )

    return response.documents
  } catch (error) {
    console.error('Failed to fetch user documents:', error)
    throw new Error(`Failed to load documents: ${error.message}`)
  }
}

/**
 * Duplicate a markdown document
 * @param {string} documentId - Original document ID
 * @param {string} userId - User ID who will own the duplicate
 * @param {string} newTitle - Title for the duplicate (optional)
 * @returns {Promise<Object>} New duplicated document
 */
export const duplicateMarkdownDocument = async (documentId, userId, newTitle = null) => {
  try {
    // First, get the original document
    const originalDocument = await getMarkdownDocument(documentId)
    
    // Check if the document belongs to the current user
    if (originalDocument.userId !== userId) {
      throw new Error('You do not have permission to duplicate this document')
    }
    
    // Create the duplicate with new title
    const duplicateTitle = newTitle || `${originalDocument.title} (Copy)`
    
    const duplicateData = {
      title: duplicateTitle,
      content: originalDocument.content,
      userId: userId
    }
    
    const newDocument = await createMarkdownDocument(duplicateData)
    return newDocument
  } catch (error) {
    console.error('Failed to duplicate document:', error)
    throw new Error(`Failed to duplicate document: ${error.message}`)
  }
}

/**
 * Check if a user has permission to access a document
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has permission
 */
export const checkDocumentPermission = async (documentId, userId) => {
  try {
    const document = await getMarkdownDocument(documentId)
    return document.userId === userId
  } catch (error) {
    console.error('Failed to check document permission:', error)
    return false
  }
}

/**
 * Search markdown documents by title or content
 * @param {string} userId - User ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching documents
 */
export const searchMarkdownDocuments = async (userId, searchTerm) => {
  try {
    // Note: Appwrite doesn't support full-text search by default
    // This is a basic implementation that searches by title
    // For more advanced search, you might need to implement client-side filtering
    const response = await databases.listDocuments(
      DATABASE_ID,
      MARKDOWN_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.search('title', searchTerm),
        Query.orderDesc('updatedAt')
      ]
    )

    return response.documents
  } catch (error) {
    // If search fails, fall back to getting all documents and filtering client-side
    console.warn('Search query failed, falling back to client-side filtering:', error)
    
    try {
      const allDocuments = await getUserMarkdownDocuments(userId)
      const searchTermLower = searchTerm.toLowerCase()
      
      return allDocuments.filter(doc => 
        doc.title.toLowerCase().includes(searchTermLower) ||
        doc.content.toLowerCase().includes(searchTermLower)
      )
    } catch (fallbackError) {
      console.error('Failed to search documents:', fallbackError)
      throw new Error(`Failed to search documents: ${fallbackError.message}`)
    }
  }
}

/**
 * Get document statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
export const getUserDocumentStats = async (userId) => {
  try {
    const documents = await getUserMarkdownDocuments(userId)
    
    const stats = {
      totalDocuments: documents.length,
      totalCharacters: documents.reduce((sum, doc) => sum + (doc.content?.length || 0), 0),
      lastModified: documents.length > 0 ? new Date(documents[0].updatedAt) : null,
      averageLength: documents.length > 0 
        ? Math.round(documents.reduce((sum, doc) => sum + (doc.content?.length || 0), 0) / documents.length)
        : 0
    }
    
    return stats
  } catch (error) {
    console.error('Failed to get document statistics:', error)
    throw new Error(`Failed to get statistics: ${error.message}`)
  }
}
