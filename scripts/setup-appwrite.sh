#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$APPWRITE_PROJECT_ID" ] || [ -z "$APPWRITE_API_KEY" ]; then
    echo "Error: Required environment variables not set!"
    echo "Please set APPWRITE_PROJECT_ID and APPWRITE_API_KEY in your .env file"
    exit 1
fi

# Run the setup script
echo "Setting up Appwrite..."
npx ts-node scripts/setup-appwrite.ts

# Check if setup was successful
if [ $? -eq 0 ]; then
    echo "✅ Appwrite setup completed successfully!"
    echo "Please update your .env file with the IDs printed above"
else
    echo "❌ Appwrite setup failed!"
    exit 1
fi 