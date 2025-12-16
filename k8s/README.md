# Kubernetes Deployment - Blogging Application

This directory contains all Kubernetes manifests and deployment scripts for the blogging application.

## 📁 Files Overview

### Deployment & Service Files
- **`backend-deployment.yaml`**: Backend deployment configuration (2 replicas)
- **`backend-service.yaml`**: Backend NodePort service (port 30001)
- **`frontend-deployment.yaml`**: Frontend deployment configuration (2 replicas)
- **`frontend-service.yaml`**: Frontend NodePort service (port 30000)
- **`mongodb-deployment.yaml`**: MongoDB deployment with PVC (reference only, uses Atlas)
- **`secrets.yaml`**: Kubernetes secrets for sensitive data (MongoDB URL, JWT token)

### Autoscaling
- **`frontend-hpa.yaml`**: HorizontalPodAutoscaler for frontend (2-10 replicas based on CPU/Memory)

### Scripts
- **`deploy.sh`**: Automated deployment script
- **`cleanup.sh`**: Cleanup script to remove all resources

### Documentation
- **`DEPLOYMENT-GUIDE.md`**: Comprehensive step-by-step deployment guide
- **`README.md`**: This file

## 🚀 Quick Start

### 1. Prerequisites
- AWS EC2 instance (t2.medium or larger)
- Docker, kubectl, and Minikube installed
- MongoDB Atlas connection string
- JWT secret token

### 2. Configure Secrets
Edit `secrets.yaml` and replace placeholder values:
```bash
nano secrets.yaml
```

Replace:
- `YOUR_MONGODB_ATLAS_CONNECTION_STRING` with your actual MongoDB Atlas URL
- `YOUR_JWT_SECRET_TOKEN` with your JWT secret
- `YOUR_MONGO_PASSWORD` with password (if using local MongoDB)

### 3. Deploy Application
```bash
# Make scripts executable
chmod +x deploy.sh cleanup.sh

# Run deployment script
./deploy.sh
```

### 4. Set Up External Access (ngrok)
```bash
# Terminal 1: Frontend tunnel
ngrok http $(minikube ip):30000

# Terminal 2: Dashboard tunnel
kubectl proxy --address='0.0.0.0' --accept-hosts='.*' --port=8001 &
ngrok http 8001
```

## 📊 Resource Specifications

### Backend
- **Image**: `talal123atiq/blogging-backend:latest`
- **Port**: 5000
- **Replicas**: 2
- **Resources**:
  - Requests: 100m CPU, 128Mi RAM
  - Limits: 500m CPU, 512Mi RAM

### Frontend
- **Image**: `talal123atiq/blogging-frontend:latest`
- **Port**: 80
- **Replicas**: 2-10 (HPA controlled)
- **Resources**:
  - Requests: 50m CPU, 64Mi RAM
  - Limits: 200m CPU, 256Mi RAM

### HPA Configuration
- **Min Replicas**: 2
- **Max Replicas**: 10
- **CPU Target**: 50%
- **Memory Target**: 70%

## 🔍 Monitoring Commands

```bash
# Watch all pods
kubectl get pods --watch

# Watch HPA in action
kubectl get hpa --watch

# Check resource usage
kubectl top pods
kubectl top nodes

# View logs
kubectl logs -l app=blogging-frontend --tail=50
kubectl logs -l app=blogging-backend --tail=50

# Describe resources
kubectl describe hpa frontend-hpa
kubectl describe deployment frontend-deployment
```

## 🧪 Test HPA Scaling

### Generate Load
```bash
# Method 1: Continuous curl
while true; do
  curl http://$(minikube ip):30000
  sleep 0.1
done

# Method 2: Apache Bench
ab -n 10000 -c 100 http://$(minikube ip):30000/

# Watch scaling happen
kubectl get hpa frontend-hpa --watch
kubectl get pods -l app=blogging-frontend --watch
```

## 🌐 Access URLs

### Local Access
- **Frontend**: `http://<MINIKUBE-IP>:30000`
- **Backend**: `http://<MINIKUBE-IP>:30001`
- **Dashboard**: `http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/`

### External Access (via ngrok)
- **Frontend**: `https://xxxx-xxxx-xxxx.ngrok-free.app`
- **Dashboard**: `https://yyyy-yyyy-yyyy.ngrok-free.app/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/`

## 🗑️ Cleanup

```bash
# Remove all resources
./cleanup.sh

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

## 📝 Manual Deployment (Alternative to deploy.sh)

```bash
# 1. Apply secrets
kubectl apply -f secrets.yaml

# 2. Deploy backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# 3. Deploy frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# 4. Apply HPA
kubectl apply -f frontend-hpa.yaml

# 5. Verify deployment
kubectl get all
kubectl get hpa
```

## 🛠️ Troubleshooting

### Pods not starting?
```bash
# Check pod status
kubectl get pods

# Describe pod
kubectl describe pod <POD-NAME>

# Check logs
kubectl logs <POD-NAME>
```

### HPA not working?
```bash
# Check metrics-server
kubectl get pods -n kube-system | grep metrics-server

# If not running, enable it
minikube addons enable metrics-server

# Check if metrics are available
kubectl top nodes
kubectl top pods
```

### Services not accessible?
```bash
# Check service endpoints
kubectl get endpoints

# Get service URLs
minikube service frontend-service --url
minikube service backend-service --url

# Test from inside cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -O- http://backend-service:5000
```

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [HPA Documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [ngrok Documentation](https://ngrok.com/docs)

## 🎯 Submission Checklist

- [ ] EC2 instance with Minikube running
- [ ] All pods in Running state
- [ ] HPA configured and active
- [ ] Frontend accessible via ngrok tunnel
- [ ] Dashboard accessible via ngrok tunnel
- [ ] Both ngrok URLs noted and kept active
- [ ] Screenshots of:
  - `kubectl get all`
  - `kubectl get hpa`
  - Dashboard showing deployments
  - HPA scaling in action
  - Application running via ngrok URL

## 📧 Contact

For issues or questions, contact: iamtalalatique@gmail.com

---

**Good luck with your deployment! 🚀**
