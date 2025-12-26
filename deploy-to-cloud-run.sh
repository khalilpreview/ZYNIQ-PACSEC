#!/bin/bash

# ============================================
# PACSEC - Google Cloud Run Deployment Script
# ============================================

set -e  # Exit on any error

# Configuration
PROJECT_ID="gen-lang-client-0609245045"
SERVICE_NAME="pacsec"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           PACSEC - Cloud Run Deployment                   ║"
echo "║           Project: ${PROJECT_ID}             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Load API key from .env.local
ENV_FILE=".env.local"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}Found .env.local - loading GEMINI_API_KEY...${NC}"
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    API_KEY="${GEMINI_API_KEY}"
    if [ -n "$API_KEY" ]; then
        echo -e "${GREEN}✓ GEMINI_API_KEY loaded successfully${NC}"
    fi
else
    echo -e "${YELLOW}WARNING: .env.local not found${NC}"
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}ERROR: gcloud CLI is not installed.${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}ERROR: Docker is not installed.${NC}"
    echo "Install it from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Step 1: Authenticate and set project
echo -e "${YELLOW}[1/6] Setting up Google Cloud project...${NC}"
gcloud config set project ${PROJECT_ID}

# Step 2: Enable required APIs
echo -e "${YELLOW}[2/6] Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com containerregistry.googleapis.com run.googleapis.com --quiet

# Step 3: Configure Docker for GCR
echo -e "${YELLOW}[3/6] Configuring Docker for Google Container Registry...${NC}"
gcloud auth configure-docker --quiet

# Step 4: Build the Docker image
echo -e "${YELLOW}[4/6] Building Docker image with API key...${NC}"
docker build --build-arg GEMINI_API_KEY="${API_KEY}" -t ${IMAGE_NAME}:latest .

# Step 5: Push to Google Container Registry
echo -e "${YELLOW}[5/6] Pushing image to GCR...${NC}"
docker push ${IMAGE_NAME}:latest

# Step 6: Deploy to Cloud Run
echo -e "${YELLOW}[6/6] Deploying to Cloud Run...${NC}"

# API key is baked into the build, no need to pass as env var
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME}:latest \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --quiet

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              DEPLOYMENT SUCCESSFUL! 🚀                    ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Service URL:${NC} ${SERVICE_URL}"
echo ""
echo -e "${YELLOW}To update the API_KEY later, run:${NC}"
echo "gcloud run services update ${SERVICE_NAME} --region ${REGION} --set-env-vars=\"API_KEY=your_key\""
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "gcloud run logs read ${SERVICE_NAME} --region ${REGION}"
echo ""
