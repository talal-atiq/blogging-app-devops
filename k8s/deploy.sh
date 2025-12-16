#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Blogging App - Kubernetes Deployment Script              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command_exists kubectl; then
    echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

if ! command_exists minikube; then
    echo -e "${RED}minikube is not installed. Please install minikube first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Check if Minikube is running
echo -e "${YELLOW}Checking Minikube status...${NC}"
if ! minikube status >/dev/null 2>&1; then
    echo -e "${YELLOW}Minikube is not running. Starting Minikube...${NC}"
    minikube start --driver=docker --cpus=2 --memory=3800mb
    
    echo -e "${YELLOW}Enabling metrics-server addon...${NC}"
    minikube addons enable metrics-server
    
    echo -e "${YELLOW}Enabling dashboard addon...${NC}"
    minikube addons enable dashboard
else
    echo -e "${GREEN}✓ Minikube is already running${NC}"
fi

echo ""
echo -e "${YELLOW}Minikube IP: $(minikube ip)${NC}"
echo ""

# Navigate to k8s directory
cd "$(dirname "$0")"

# Check if secrets.yaml has been configured
echo -e "${YELLOW}Checking secrets configuration...${NC}"
if grep -q "YOUR_MONGODB_ATLAS_CONNECTION_STRING" secrets.yaml; then
    echo -e "${RED}ERROR: Please configure secrets.yaml with your actual values!${NC}"
    echo -e "${YELLOW}Edit secrets.yaml and replace:${NC}"
    echo "  - YOUR_MONGODB_ATLAS_CONNECTION_STRING"
    echo "  - YOUR_JWT_SECRET_TOKEN"
    exit 1
fi

echo -e "${GREEN}✓ Secrets configured${NC}"
echo ""

# Apply secrets
echo -e "${YELLOW}Applying secrets...${NC}"
kubectl apply -f secrets.yaml
echo ""

# Deploy backend
echo -e "${YELLOW}Deploying backend...${NC}"
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
echo ""

# Deploy frontend
echo -e "${YELLOW}Deploying frontend...${NC}"
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
echo ""

# Apply HPA
echo -e "${YELLOW}Applying HorizontalPodAutoscaler...${NC}"
kubectl apply -f frontend-hpa.yaml
echo ""

# Wait for pods to be ready
echo -e "${YELLOW}Waiting for pods to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=blogging-backend --timeout=120s
kubectl wait --for=condition=ready pod -l app=blogging-frontend --timeout=120s
echo ""

# Display status
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Deployment Summary                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Pods:${NC}"
kubectl get pods
echo ""

echo -e "${YELLOW}Services:${NC}"
kubectl get svc
echo ""

echo -e "${YELLOW}Deployments:${NC}"
kubectl get deployments
echo ""

echo -e "${YELLOW}HPA:${NC}"
kubectl get hpa
echo ""

# Get service URLs
FRONTEND_URL=$(minikube service frontend-service --url)
BACKEND_URL=$(minikube service backend-service --url)

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Access URLs                                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Frontend:${NC} $FRONTEND_URL"
echo -e "${YELLOW}Backend:${NC}  $BACKEND_URL"
echo ""
echo -e "${YELLOW}Minikube IP:${NC} $(minikube ip)"
echo -e "${YELLOW}Frontend NodePort:${NC} 30000"
echo -e "${YELLOW}Backend NodePort:${NC}  30001"
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  Next Steps                                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "1. Start ngrok tunnel for frontend:"
echo -e "   ${YELLOW}ngrok http $(minikube ip):30000${NC}"
echo ""
echo "2. Start kubectl proxy for dashboard:"
echo -e "   ${YELLOW}kubectl proxy --address='0.0.0.0' --accept-hosts='.*' --port=8001 &${NC}"
echo ""
echo "3. Start ngrok tunnel for dashboard:"
echo -e "   ${YELLOW}ngrok http 8001${NC}"
echo ""
echo "4. Monitor HPA:"
echo -e "   ${YELLOW}kubectl get hpa --watch${NC}"
echo ""
echo "5. Generate load to test HPA:"
echo -e "   ${YELLOW}while true; do curl http://$(minikube ip):30000; sleep 0.1; done${NC}"
echo ""

echo -e "${GREEN}Deployment completed successfully! 🚀${NC}"
