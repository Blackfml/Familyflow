#!/bin/bash
set -e

echo "🚀 FamilyFlow — Deploy para Cloud Run"
echo "======================================"

# Check prerequisites
if ! command -v gcloud &> /dev/null; then
  echo "❌ gcloud CLI not found. Install it from: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null)}
if [ -z "$PROJECT_ID" ]; then
  echo "❌ No Google Cloud project set."
  echo "   Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

SERVICE_NAME="familyflow"
REGION="us-west1"

echo ""
echo "📦 Building and deploying $SERVICE_NAME to $REGION..."
echo "   Project: $PROJECT_ID"
echo ""

# Build locally first to catch errors
echo "🔨 Running local build..."
npm run build

# Deploy to Cloud Run using buildpacks
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --concurrency 80 \
  --timeout 300

echo ""
echo "✅ Deploy complete!"
echo "   URL: https://$SERVICE_NAME-$PROJECT_ID-$REGION.run.app"
