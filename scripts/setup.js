import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const storage = new Storage(client);

async function createDatabase() {
    try {
        // First try to find an existing database
        const { databases: existingDatabases } = await databases.list();
        const existingDb = existingDatabases.find(db => db.name === 'CollegeMate Market');
        
        if (existingDb) {
            console.log('ℹ️ Using existing database:', existingDb.name);
            return existingDb.$id;
        }
        
        // If no existing database found, try to create one
        const database = await databases.create(ID.unique(), 'CollegeMate Market');
        console.log('✅ Database created successfully');
        return database.$id;
    } catch (error) {
        if (error.code === 403 && error.type === 'additional_resource_not_allowed') {
            // If we hit the database limit, use the first available database
            const { databases: existingDatabases } = await databases.list();
            if (existingDatabases.length > 0) {
                console.log('ℹ️ Using first available database:', existingDatabases[0].name);
                return existingDatabases[0].$id;
            }
        }
        console.error('❌ Error creating/finding database:', error);
        throw error;
    }
}

async function createCollections(databaseId) {
    try {
        // Profiles Collection
        const profilesCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Profiles',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]
        );

        // Create profile attributes
        await Promise.all([
            databases.createStringAttribute(
                databaseId,
                profilesCollection.$id,
                'user_id',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                profilesCollection.$id,
                'full_name',
                255,
                false
            ),
            databases.createStringAttribute(
                databaseId,
                profilesCollection.$id,
                'avatar_url',
                255,
                false
            ),
            databases.createDatetimeAttribute(
                databaseId,
                profilesCollection.$id,
                'created_at',
                true
            ),
            databases.createDatetimeAttribute(
                databaseId,
                profilesCollection.$id,
                'updated_at',
                true
            )
        ]);

        console.log('✅ Profiles collection created successfully');

        // Listings Collection
        const listingsCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Listings',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]
        );

        // Create listing attributes
        await Promise.all([
            databases.createStringAttribute(
                databaseId,
                listingsCollection.$id,
                'title',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                listingsCollection.$id,
                'description',
                65535,
                true
            ),
            databases.createFloatAttribute(
                databaseId,
                listingsCollection.$id,
                'price',
                true
            ),
            databases.createStringAttribute(
                databaseId,
                listingsCollection.$id,
                'category',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                listingsCollection.$id,
                'condition',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                listingsCollection.$id,
                'seller_id',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                listingsCollection.$id,
                'status',
                255,
                true
            ),
            databases.createDatetimeAttribute(
                databaseId,
                listingsCollection.$id,
                'created_at',
                true
            ),
            databases.createDatetimeAttribute(
                databaseId,
                listingsCollection.$id,
                'updated_at',
                true
            ),
            databases.createStringAttribute(
                databaseId,
                listingsCollection.$id,
                'images',
                65535,
                false,
                undefined,
                true // isArray
            )
        ]);

        console.log('✅ Listings collection created successfully');

        // Messages Collection
        const messagesCollection = await databases.createCollection(
            databaseId,
            ID.unique(),
            'Messages',
            [
                Permission.read(Role.users()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]
        );

        // Create message attributes
        await Promise.all([
            databases.createStringAttribute(
                databaseId,
                messagesCollection.$id,
                'sender_id',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                messagesCollection.$id,
                'receiver_id',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                messagesCollection.$id,
                'listing_id',
                255,
                true
            ),
            databases.createStringAttribute(
                databaseId,
                messagesCollection.$id,
                'message',
                65535,
                true
            ),
            databases.createDatetimeAttribute(
                databaseId,
                messagesCollection.$id,
                'created_at',
                true
            )
        ]);

        console.log('✅ Messages collection created successfully');

        return {
            profilesCollectionId: profilesCollection.$id,
            listingsCollectionId: listingsCollection.$id,
            messagesCollectionId: messagesCollection.$id,
        };
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ Collections already exist');
            // Get existing collections
            const { collections } = await databases.listCollections(databaseId);
            return {
                profilesCollectionId: collections.find(c => c.name === 'Profiles')?.$id,
                listingsCollectionId: collections.find(c => c.name === 'Listings')?.$id,
                messagesCollectionId: collections.find(c => c.name === 'Messages')?.$id,
            };
        } else {
            console.error('❌ Error creating collections:', error);
            throw error;
        }
    }
}

async function createBuckets() {
    try {
        // Listings Bucket
        await storage.createBucket(
            ID.unique(),
            'Listings',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ],
            false, // fileSecurity
            true, // enabled
            30 * 1024 * 1024, // maximumFileSize (30MB)
            ['jpg', 'jpeg', 'png', 'webp'] // allowedFileExtensions
        );
        console.log('✅ Listings bucket created successfully');

        // Avatars Bucket
        await storage.createBucket(
            ID.unique(),
            'Avatars',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ],
            false, // fileSecurity
            true, // enabled
            5 * 1024 * 1024, // maximumFileSize (5MB)
            ['jpg', 'jpeg', 'png', 'webp'] // allowedFileExtensions
        );
        console.log('✅ Avatars bucket created successfully');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ Buckets already exist');
        } else {
            console.error('❌ Error creating buckets:', error);
            throw error;
        }
    }
}

async function main() {
    try {
        const databaseId = await createDatabase();
        const collections = await createCollections(databaseId);
        await createBuckets();
        
        // Update config file with the IDs
        console.log('\nUpdate your config.ts with these values:');
        console.log('databaseId:', databaseId);
        console.log('profilesCollectionId:', collections.profilesCollectionId);
        console.log('listingsCollectionId:', collections.listingsCollectionId);
        console.log('messagesCollectionId:', collections.messagesCollectionId);
        
        console.log('\n✅ Setup completed successfully');
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

main(); 