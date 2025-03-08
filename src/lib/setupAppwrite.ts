import { storage, client } from './appwrite';
import { ID, Storage, Databases } from 'appwrite';
import { APPWRITE_LISTINGS_BUCKET_ID, APPWRITE_AVATARS_BUCKET_ID } from './config';

/**
 * Ensures all required Appwrite resources exist
 * This should be called once when the app initializes
 */
export async function setupAppwriteResources() {
  try {
    console.log('Setting up Appwrite resources...');
    
    // We need to use the Storage service to create and check buckets
    const storageService = new Storage(client);
    
    await ensureBucketExists(
      storageService, 
      APPWRITE_LISTINGS_BUCKET_ID, 
      'Listings Bucket', 
      ['image/jpeg', 'image/png', 'image/webp']
    );
    
    await ensureBucketExists(
      storageService,
      APPWRITE_AVATARS_BUCKET_ID, 
      'Avatars Bucket', 
      ['image/jpeg', 'image/png', 'image/webp']
    );
    
    console.log('Appwrite resources setup complete');
  } catch (error) {
    console.error('Error setting up Appwrite resources:', error);
  }
}

/**
 * Ensures a bucket exists in Appwrite storage
 * If the bucket doesn't exist, it will be created
 */
async function ensureBucketExists(
  storageService: Storage,
  bucketId: string, 
  name: string, 
  allowedMimeTypes: string[]
) {
  try {
    // Try to get the bucket to see if it exists
    console.log(`Checking if bucket ${bucketId} exists...`);
    await storageService.getBucket(bucketId);
    console.log(`Bucket ${bucketId} already exists.`);
  } catch (error) {
    // Bucket doesn't exist, create it
    console.log(`Bucket ${bucketId} doesn't exist, creating...`);
    try {
      // Create the bucket with appropriate permissions
      await storageService.createBucket(
        bucketId, 
        name,
        'bucket',
        [
          // Allow read access to anyone
          'read("any")',
          // Allow write access to authenticated users
          'write("user:{{user.$id}}")'
        ],
        true, // File security - enable antivirus scanning
        10 * 1024 * 1024, // Maximum file size: 10MB
        allowedMimeTypes
      );
      console.log(`Bucket ${bucketId} created successfully.`);
    } catch (createError) {
      console.error(`Error creating bucket ${bucketId}:`, createError);
      throw createError;
    }
  }
} 