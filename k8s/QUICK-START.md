# Kubernetes Assignment - Quick Summary

## ✅ What Has Been Created

All Kubernetes manifests and deployment scripts are now in the `k8s/` folder:

### YAML Files Created:
1. ✅ **backend-deployment.yaml** - Backend deployment (2 replicas)
2. ✅ **backend-service.yaml** - Backend NodePort service (port 30001)
3. ✅ **frontend-deployment.yaml** - Frontend deployment (2 replicas)
4. ✅ **frontend-service.yaml** - Frontend NodePort service (port 30000)
5. ✅ **frontend-hpa.yaml** - HorizontalPodAutoscaler (2-10 replicas, CPU/Memory based)
6. ✅ **mongodb-deployment.yaml** - MongoDB with PVC (reference only)
7. ✅ **secrets.yaml** - Kubernetes secrets template

### Scripts Created:
1. ✅ **deploy.sh** - Automated deployment script
2. ✅ **cleanup.sh** - Resource cleanup script

### Documentation Created:
1. ✅ **DEPLOYMENT-GUIDE.md** - Complete step-by-step guide
2. ✅ **README.md** - Quick reference

---

## 🚀 Step-by-Step Execution Plan

### Phase 1: EC2 Setup (30-45 minutes)

1. **Launch EC2 Instance**
   - Type: t2.medium (2 vCPU, 4GB RAM)
   - OS: Ubuntu 22.04 LTS
   - Storage: 20GB
   - Security: Open ports 22, 30000-30002

2. **Connect to EC2**
   ```bash
   ssh -i your-key.pem ubuntu@<EC2-IP>
   ```

3. **Install Prerequisites**
   ```bash
   # Update system
   sudo apt-get update -y
   sudo apt-get upgrade -y
   
   # Install Docker
   sudo apt-get install -y docker.io
   sudo usermod -aG docker $USER
   newgrp docker
   
   # Install kubectl
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x kubectl
   sudo mv kubectl /usr/local/bin/
   
   # Install Minikube
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   ```

4. **Start Minikube**
   ```bash
   minikube start --driver=docker --cpus=2 --memory=3800mb
   minikube addons enable metrics-server
   minikube addons enable dashboard
   ```

---

### Phase 2: Prepare Docker Images (15-20 minutes)

1. **Clone Repository**
   ```bash
   cd ~
   git clone https://github.com/talal-atiq/blogging-app-devops.git
   cd blogging-app-devops
   ```

2. **Login to Docker Hub**
   ```bash
   docker login
   ```

3. **Build and Push Backend**
   ```bash
   cd server
   docker build -t talal123atiq/blogging-backend:latest .
   docker push talal123atiq/blogging-backend:latest
   ```

4. **Build and Push Frontend**
   ```bash
   cd ../client
   npm install
   npm run build
   docker build -t talal123atiq/blogging-frontend:latest .
   docker push talal123atiq/blogging-frontend:latest
   ```

---

### Phase 3: Configure and Deploy (10-15 minutes)

1. **Configure Secrets**
   ```bash
   cd ~/blogging-app-devops/k8s
   nano secrets.yaml
   ```
   
   Replace with your actual values:
   - MongoDB Atlas connection string
   - JWT secret token

2. **Make Scripts Executable**
   ```bash
   chmod +x deploy.sh cleanup.sh
   ```

3. **Deploy Application**
   ```bash
   ./deploy.sh
   ```

4. **Verify Deployment**
   ```bash
   kubectl get all
   kubectl get hpa
   kubectl get pods --watch
   ```

---

### Phase 4: Setup External Access (10-15 minutes)

1. **Install ngrok**
   ```bash
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
   tar xvzf ngrok-v3-stable-linux-amd64.tgz
   sudo mv ngrok /usr/local/bin/
   ngrok config add-authtoken YOUR_NGROK_AUTH_TOKEN
   ```

2. **Install tmux (for persistent sessions)**
   ```bash
   sudo apt-get install -y tmux
   ```

3. **Create Frontend Tunnel**
   ```bash
   tmux new-session -d -s frontend-tunnel "ngrok http $(minikube ip):30000"
   ```

4. **Start Dashboard Proxy**
   ```bash
   kubectl proxy --address='0.0.0.0' --accept-hosts='.*' --port=8001 &
   ```

5. **Create Dashboard Tunnel**
   ```bash
   tmux new-session -d -s dashboard-tunnel "ngrok http 8001"
   ```

6. **Get ngrok URLs**
   ```bash
   curl http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | grep https
   ```

---

### Phase 5: Testing and Verification (15-20 minutes)

1. **Check HPA Status**
   ```bash
   kubectl get hpa --watch
   ```

2. **Generate Load for Testing**
   ```bash
   # In a new terminal
   while true; do
     curl http://$(minikube ip):30000
     sleep 0.1
   done
   ```

3. **Watch Pods Scale**
   ```bash
   kubectl get pods -l app=blogging-frontend --watch
   ```

4. **Check Resource Usage**
   ```bash
   kubectl top pods
   kubectl top nodes
   ```

5. **Access Application via ngrok**
   - Open the ngrok frontend URL in browser
   - Verify application loads correctly

6. **Access Dashboard via ngrok**
   - Open ngrok dashboard URL
   - Navigate to Workloads > Deployments
   - Verify HPA and scaling behavior

---

## 📸 Screenshots Needed for Submission

1. ✅ `kubectl get all` output
2. ✅ `kubectl get hpa` output showing autoscaler
3. ✅ Dashboard showing deployments and pods
4. ✅ HPA scaling in action (before and after load)
5. ✅ Application running via ngrok URL
6. ✅ `kubectl top pods` showing resource usage
7. ✅ `kubectl describe hpa frontend-hpa` output

---

## 🔗 URLs to Submit

1. **Frontend Application URL** (ngrok):
   - Example: https://xxxx-xxxx-xxxx.ngrok-free.app

2. **Minikube Dashboard URL** (ngrok):
   - Example: https://yyyy-yyyy-yyyy.ngrok-free.app/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/

3. **EC2 Public IP**:
   - Your EC2 instance IP address

---

## ⏱️ Total Time Estimate

- **EC2 Setup**: 30-45 minutes
- **Docker Images**: 15-20 minutes
- **Deployment**: 10-15 minutes
- **External Access**: 10-15 minutes
- **Testing**: 15-20 minutes
- **Screenshots & Documentation**: 15-20 minutes

**Total: ~2-2.5 hours**

---

## 🎯 Key Points to Remember

1. ✅ **Use t2.medium** - t2.micro won't work (insufficient memory)
2. ✅ **Keep ngrok tunnels running** during evaluation
3. ✅ **Enable metrics-server** for HPA to work
4. ✅ **Use tmux** to keep ngrok sessions persistent
5. ✅ **Test HPA** by generating load and watching pods scale
6. ✅ **Take screenshots** at each verification step
7. ✅ **Note both ngrok URLs** before submission

---

## 🆘 Quick Troubleshooting

**Pods not starting?**
```bash
kubectl describe pod <POD-NAME>
kubectl logs <POD-NAME>
```

**HPA not working?**
```bash
kubectl top nodes  # Should show metrics
kubectl top pods   # Should show metrics
minikube addons enable metrics-server  # If not working
```

**Can't access via ngrok?**
```bash
# Check ngrok status
curl http://localhost:4040/api/tunnels

# Restart ngrok
tmux kill-session -t frontend-tunnel
tmux new-session -d -s frontend-tunnel "ngrok http $(minikube ip):30000"
```

---

## ✅ Final Checklist Before Submission

- [ ] EC2 instance running
- [ ] Minikube cluster running
- [ ] All pods in Running state
- [ ] HPA configured and showing metrics
- [ ] Frontend ngrok tunnel active and accessible
- [ ] Dashboard ngrok tunnel active and accessible
- [ ] Both ngrok URLs noted
- [ ] Screenshots taken
- [ ] Tested HPA scaling
- [ ] Application working via ngrok URL

---

## 📚 Reference Files

- **Detailed Guide**: `k8s/DEPLOYMENT-GUIDE.md`
- **Quick Reference**: `k8s/README.md`
- **All YAML files**: `k8s/` directory

---

**Good luck with your assignment! 🚀**

If you face any issues, refer to the DEPLOYMENT-GUIDE.md for detailed troubleshooting steps.
