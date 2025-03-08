import { Account, ID, Client, Storage } from 'appwrite';
import { client, storage } from './appwrite';
import { 
    APPWRITE_LISTINGS_BUCKET_ID, 
    APPWRITE_AVATARS_BUCKET_ID,
    APPWRITE_ENDPOINT,
    APPWRITE_PROJECT_ID
} from './config';

/**
 * Check if the storage bucket exists
 * @param bucketId The bucket ID to check
 */
const checkBucketExists = async (bucketId: string): Promise<boolean> => {
    try {
        await storage.listFiles(bucketId);
        console.log(`Bucket ${bucketId} exists.`);
        return true;
    } catch (error: any) {
        // If the error is a 404, the bucket doesn't exist
        if (error?.code === 404) {
            console.log(`Bucket ${bucketId} does not exist.`);
            return false;
        }
        
        // For other errors, log and assume the bucket might exist
        console.error(`Error checking bucket ${bucketId}:`, error);
        return false;
    }
};

/**
 * Sets up Appwrite resources needed for the application
 * This creates storage buckets if they don't exist through the console UI
 */
export async function setupAppwriteResources() {
    // Check if buckets exist
    const listingsBucketExists = await checkBucketExists(APPWRITE_LISTINGS_BUCKET_ID);
    const avatarsBucketExists = await checkBucketExists(APPWRITE_AVATARS_BUCKET_ID);
    
    // If any bucket doesn't exist, show an instruction message
    if (!listingsBucketExists || !avatarsBucketExists) {
        console.warn(`
⚠️ MISSING STORAGE BUCKETS ⚠️
Some Appwrite storage buckets are missing. Please create them in the Appwrite Console:

1. Go to https://cloud.appwrite.io/console/${APPWRITE_PROJECT_ID}/storage
2. Create the following buckets:
${!listingsBucketExists ? `   - ID: ${APPWRITE_LISTINGS_BUCKET_ID}, Name: Listings Bucket, Allowed file extensions: .jpg, .jpeg, .png, .webp\n` : ''}
${!avatarsBucketExists ? `   - ID: ${APPWRITE_AVATARS_BUCKET_ID}, Name: Avatars Bucket, Allowed file extensions: .jpg, .jpeg, .png, .webp\n` : ''}
3. Set appropriate permissions for each bucket
   - Users should have read access
   - Authenticated users should have write access

After creating these buckets, refresh the application.
        `);
    } else {
        console.log('All required Appwrite resources are ready!');
    }
} 