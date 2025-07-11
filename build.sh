#!/bin/bash

# Build the frontend
echo "Building frontend..."
npm run build

# Create netlify functions directory if it doesn't exist
mkdir -p netlify/functions

# Build the serverless function
echo "Building serverless function..."
esbuild netlify/functions/api.js --platform=node --packages=external --bundle --format=esm --outdir=netlify/functions --outfile=netlify/functions/api.js

echo "Build completed!"