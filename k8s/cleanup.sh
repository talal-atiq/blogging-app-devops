#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║     Blogging App - Kubernetes Cleanup Script                 ║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Navigate to k8s directory
cd "$(dirname "$0")"

echo -e "${YELLOW}Deleting HorizontalPodAutoscaler...${NC}"
kubectl delete -f frontend-hpa.yaml 2>/dev/null || echo "HPA already deleted"
echo ""

echo -e "${YELLOW}Deleting frontend deployment and service...${NC}"
kubectl delete -f frontend-service.yaml 2>/dev/null || echo "Frontend service already deleted"
kubectl delete -f frontend-deployment.yaml 2>/dev/null || echo "Frontend deployment already deleted"
echo ""

echo -e "${YELLOW}Deleting backend deployment and service...${NC}"
kubectl delete -f backend-service.yaml 2>/dev/null || echo "Backend service already deleted"
kubectl delete -f backend-deployment.yaml 2>/dev/null || echo "Backend deployment already deleted"
echo ""

echo -e "${YELLOW}Deleting secrets...${NC}"
kubectl delete -f secrets.yaml 2>/dev/null || echo "Secrets already deleted"
echo ""

echo -e "${YELLOW}Checking remaining resources...${NC}"
kubectl get all
echo ""

echo -e "${GREEN}Cleanup completed!${NC}"
echo ""
echo -e "${YELLOW}To stop Minikube cluster, run:${NC}"
echo "  minikube stop"
echo ""
echo -e "${YELLOW}To delete Minikube cluster completely, run:${NC}"
echo "  minikube delete"
