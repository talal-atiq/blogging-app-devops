# Kubernetes Deployment Guide - Blogging Application

## Prerequisites
- AWS EC2 instance (t2.medium or larger recommended)
- Docker images pushed to Docker Hub
- MongoDB Atlas connection string
- Your application's JWT token

---

## Step 1: Launch AWS EC2 Instance

### 1.1 Create EC2 Instance
```bash
# Launch a new EC2 instance with these specifications:
- AMI: Ubuntu 22.04 LTS
- Instance Type: t2.medium (2 vCPU, 4GB RAM - minimum for Minikube)
- Storage: 20GB minimum
- Security Group: Open ports 22 (SSH), 30000-30002 (NodePort), 80, 443
```

### 1.2 Connect to EC2
```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

---

## Step 2: Install Docker, Minikube, and kubectl

### 2.1 Update System
```bash
sudo apt-get update -y
sudo apt-get upgrade -y
```

### 2.2 Install Docker
```bash
# Install Docker
sudo apt-get install -y docker.io

# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify Docker installation
docker --version
```

### 2.3 Install kubectl
```bash
# Download kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Make it executable
chmod +x kubectl

# Move to PATH
sudo mv kubectl /usr/local/bin/

# Verify installation
kubectl version --client
```

### 2.4 Install Minikube
```bash
# Download Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# Install Minikube
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Verify installation
minikube version
```

---

## Step 3: Start Minikube Cluster

### 3.1 Start Minikube with Docker Driver
```bash
# Start Minikube
minikube start --driver=docker --cpus=2 --memory=3800mb

# Verify cluster is running
minikube status

# Check nodes
kubectl get nodes
```

### 3.2 Enable Metrics Server (Required for HPA)
```bash
# Enable metrics-server addon
minikube addons enable metrics-server

# Verify metrics-server is running
kubectl get pods -n kube-system | grep metrics-server
```

---

## Step 4: Clone Repository and Prepare Files

### 4.1 Clone Your Repository
```bash
cd ~
git clone https://github.com/talal-atiq/blogging-app-devops.git
cd blogging-app-devops/k8s
```

### 4.2 Update Secrets File
```bash
# Edit secrets.yaml with your actual values
nano secrets.yaml

# Replace:
# - YOUR_MONGODB_ATLAS_CONNECTION_STRING with your MongoDB Atlas URL
# - YOUR_JWT_SECRET_TOKEN with your JWT token
# - YOUR_MONGO_PASSWORD (if using local MongoDB)
```

Example secrets.yaml:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  mongodb-url: "mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"
  jwt-token: "your-super-secret-jwt-token-here"
  mongo-password: "admin123"
```

---

## Step 5: Build and Push Docker Images

### 5.1 Login to Docker Hub
```bash
docker login
# Enter your Docker Hub username and password
```

### 5.2 Build Backend Image
```bash
cd ~/blogging-app-devops/server

# Build image
docker build -t talal123atiq/blogging-backend:latest .

# Push to Docker Hub
docker push talal123atiq/blogging-backend:latest
```

### 5.3 Build Frontend Image
```bash
cd ~/blogging-app-devops/client

# Build the frontend
npm install
npm run build

# Build image
docker build -t talal123atiq/blogging-frontend:latest .

# Push to Docker Hub
docker push talal123atiq/blogging-frontend:latest
```

---

## Step 6: Deploy Application to Minikube

### 6.1 Apply Secrets
```bash
cd ~/blogging-app-devops/k8s
kubectl apply -f secrets.yaml

# Verify secrets created
kubectl get secrets
```

### 6.2 Deploy Backend
```bash
# Apply backend deployment
kubectl apply -f backend-deployment.yaml

# Apply backend service
kubectl apply -f backend-service.yaml

# Check backend pods
kubectl get pods -l app=blogging-backend

# Check backend service
kubectl get svc backend-service
```

### 6.3 Deploy Frontend
```bash
# Apply frontend deployment
kubectl apply -f frontend-deployment.yaml

# Apply frontend service
kubectl apply -f frontend-service.yaml

# Check frontend pods
kubectl get pods -l app=blogging-frontend

# Check frontend service
kubectl get svc frontend-service
```

### 6.4 Apply HorizontalPodAutoscaler
```bash
# Apply HPA
kubectl apply -f frontend-hpa.yaml

# Check HPA status
kubectl get hpa

# Describe HPA for details
kubectl describe hpa frontend-hpa
```

### 6.5 Verify All Resources
```bash
# Check all pods
kubectl get pods

# Check all services
kubectl get svc

# Check all deployments
kubectl get deployments

# Check HPA
kubectl get hpa
```

---

## Step 7: Access Application Locally (Test)

### 7.1 Get Minikube IP
```bash
minikube ip
# Note this IP address (e.g., 192.168.49.2)
```

### 7.2 Access Services
```bash
# Frontend: http://<MINIKUBE-IP>:30000
# Backend: http://<MINIKUBE-IP>:30001

# Test backend
curl http://$(minikube ip):30001

# Or use minikube service command
minikube service frontend-service --url
minikube service backend-service --url
```

---

## Step 8: Set Up ngrok Tunnels

### 8.1 Install ngrok
```bash
# Download ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz

# Extract
tar xvzf ngrok-v3-stable-linux-amd64.tgz

# Move to PATH
sudo mv ngrok /usr/local/bin/

# Verify installation
ngrok version
```

### 8.2 Configure ngrok with Auth Token
```bash
# Sign up at https://ngrok.com and get your auth token
ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
```

### 8.3 Create Tunnel for Frontend Application
```bash
# In a new terminal/tmux session
ngrok http $(minikube ip):30000

# Note the forwarding URL (e.g., https://xxxx-xxxx-xxxx.ngrok-free.app)
# Keep this terminal open!
```

### 8.4 Create Tunnel for Minikube Dashboard
```bash
# First, start the Minikube dashboard in background
kubectl proxy --address='0.0.0.0' --accept-hosts='.*' --port=8001 &

# In another terminal/tmux session
ngrok http 8001

# Note the forwarding URL for dashboard
# Keep this terminal open too!
```

### 8.5 Using tmux for Persistent Sessions
```bash
# Install tmux
sudo apt-get install -y tmux

# Create first session for frontend tunnel
tmux new-session -d -s frontend-tunnel 'ngrok http $(minikube ip):30000'

# Create second session for dashboard tunnel
tmux new-session -d -s dashboard-tunnel 'ngrok http 8001'

# View ngrok URLs
curl http://localhost:4040/api/tunnels

# List tmux sessions
tmux ls

# Attach to a session to see URLs
tmux attach -t frontend-tunnel
# Press Ctrl+B then D to detach without closing
```

---

## Step 9: Access Minikube Dashboard

### 9.1 Enable Dashboard
```bash
# Enable dashboard addon
minikube addons enable dashboard

# Enable metrics-server if not already enabled
minikube addons enable metrics-server
```

### 9.2 Start Dashboard
```bash
# Start dashboard with proxy
kubectl proxy --address='0.0.0.0' --accept-hosts='.*' --port=8001 &

# Dashboard URL (local):
# http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/
```

### 9.3 Access via ngrok
```bash
# Use the ngrok URL created in Step 8.4
# Format: https://xxxx-xxxx.ngrok-free.app/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/
```

---

## Step 10: Test HorizontalPodAutoscaler

### 10.1 Check Initial State
```bash
# Check current replicas
kubectl get hpa frontend-hpa

# Watch HPA in real-time
kubectl get hpa frontend-hpa --watch
```

### 10.2 Generate Load to Trigger Scaling
```bash
# Install stress testing tool
sudo apt-get install -y apache2-utils

# Generate load (run in separate terminal)
while true; do
  curl http://$(minikube ip):30000
  sleep 0.1
done

# Or use Apache Bench
ab -n 10000 -c 100 http://$(minikube ip):30000/

# Watch pods scale up
kubectl get pods -l app=blogging-frontend --watch
```

### 10.3 Monitor Metrics
```bash
# Check pod resource usage
kubectl top pods

# Check node resource usage
kubectl top nodes

# Describe HPA for detailed events
kubectl describe hpa frontend-hpa
```

---

## Step 11: Verification Commands

### 11.1 Check All Resources
```bash
# All pods
kubectl get pods -o wide

# All services
kubectl get svc

# All deployments
kubectl get deployments

# HPA status
kubectl get hpa

# Persistent Volume Claims (if using MongoDB locally)
kubectl get pvc

# Secrets
kubectl get secrets
```

### 11.2 Check Logs
```bash
# Backend logs
kubectl logs -l app=blogging-backend --tail=50

# Frontend logs
kubectl logs -l app=blogging-frontend --tail=50

# Specific pod logs
kubectl logs <POD-NAME>
```

### 11.3 Describe Resources
```bash
# Describe deployment
kubectl describe deployment frontend-deployment

# Describe service
kubectl describe svc frontend-service

# Describe HPA
kubectl describe hpa frontend-hpa
```

---

## Step 12: Troubleshooting

### 12.1 Pod Issues
```bash
# Check pod status
kubectl get pods

# Describe problematic pod
kubectl describe pod <POD-NAME>

# Check pod logs
kubectl logs <POD-NAME>

# Get events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### 12.2 Service Issues
```bash
# Check endpoints
kubectl get endpoints

# Test service connectivity from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://backend-service:5000
```

### 12.3 Restart Minikube
```bash
# Stop Minikube
minikube stop

# Delete and recreate cluster
minikube delete
minikube start --driver=docker --cpus=2 --memory=3800mb

# Reapply all resources
cd ~/blogging-app-devops/k8s
kubectl apply -f secrets.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f frontend-hpa.yaml
```

---

## Step 13: Clean Up (After Submission)

### 13.1 Delete Resources
```bash
# Delete HPA
kubectl delete -f frontend-hpa.yaml

# Delete frontend
kubectl delete -f frontend-service.yaml
kubectl delete -f frontend-deployment.yaml

# Delete backend
kubectl delete -f backend-service.yaml
kubectl delete -f backend-deployment.yaml

# Delete secrets
kubectl delete -f secrets.yaml

# Or delete all at once
kubectl delete -f .
```

### 13.2 Stop Minikube
```bash
# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

### 13.3 Stop ngrok Tunnels
```bash
# Kill tmux sessions
tmux kill-session -t frontend-tunnel
tmux kill-session -t dashboard-tunnel

# Or press Ctrl+C in ngrok terminals
```

---

## Important URLs to Submit

After completing the deployment, note down these URLs:

1. **Application URL** (ngrok tunnel):
   - Example: https://xxxx-xxxx-xxxx.ngrok-free.app

2. **Minikube Dashboard URL** (ngrok tunnel):
   - Example: https://yyyy-yyyy-yyyy.ngrok-free.app/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/

3. **EC2 Instance Public IP**:
   - Your EC2 public IP address

---

## Quick Reference Commands

```bash
# Check cluster status
minikube status
kubectl cluster-info

# Get all resources
kubectl get all

# Watch HPA
kubectl get hpa --watch

# Watch pods
kubectl get pods --watch

# Get Minikube IP
minikube ip

# Get service URLs
minikube service frontend-service --url
minikube service backend-service --url

# View ngrok tunnels
curl http://localhost:4040/api/tunnels | jq

# Check metrics
kubectl top nodes
kubectl top pods
```

---

## Notes

- Minikube must remain running during evaluation
- ngrok tunnels must remain active during evaluation
- Keep both tmux sessions running or ngrok terminals open
- Monitor EC2 costs - remember to stop/terminate instance after submission
- t2.medium instance is recommended (t2.micro may not have enough resources)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   ngrok Tunnel (HTTPS)                  │
│              https://xxxx.ngrok-free.app                │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    AWS EC2 Instance                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Minikube Cluster                     │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  Frontend Pods (2-10 replicas) - Port 30000│ │  │
│  │  │         HPA: CPU/Memory based scaling      │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  Backend Pods (2 replicas) - Port 30001    │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  Kubernetes Dashboard - Port 8001          │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │   MongoDB Atlas        │
            │   (Cloud Database)     │
            └────────────────────────┘
```

Good luck with your assignment! 🚀
