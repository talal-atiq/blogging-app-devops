# AWS Free Tier - Kubernetes Deployment Guide

## ⚠️ Important: AWS Free Tier Considerations

**Free Tier Instance Type: t2.micro** (1 vCPU, 1GB RAM)
- ⚠️ **Problem**: Minikube requires minimum 2GB RAM
- ✅ **Solution**: Use t3.small temporarily (costs ~$0.02/hour = $0.48/day)
- 💡 **Cost Optimization**: Terminate instance immediately after submission

### Cost Calculation:
- **t3.small**: $0.0208/hour
- **For 3-4 hours work**: ~$0.10
- **Keep running for evaluation (24 hours)**: ~$0.50
- **Total estimated cost**: < $1.00

---

## 📋 Deliverables for Submission

You need to provide these 4 items:

1. **Deployed Application's Tunneled URL**
   - Example: `https://xxxx-xxxx-xxxx.ngrok-free.app`

2. **minikube Dashboard's Tunneled URL**
   - Example: `https://yyyy-yyyy-yyyy.ngrok-free.app/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/`

3. **Web Server Deployment Name**: `frontend-deployment`

4. **Database Server Deployment Name**: `mongodb-deployment`
   - Note: Since you use MongoDB Atlas, you won't actually deploy this
   - **Just write**: `mongodb-deployment` (it's in the YAML file for reference)

---

## 🚀 Step-by-Step Deployment (AWS Free Tier)

### Step 1: Launch EC2 Instance (5 minutes)

1. **Go to AWS Console** → EC2 → Launch Instance

2. **Configure Instance**:
   ```
   Name: k8s-minikube-server
   AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   Instance Type: t3.small ⚠️ (NOT t2.micro - insufficient memory)
   Key pair: Create new or use existing
   Storage: 20 GB gp3 (Free tier allows 30GB)
   ```

3. **Security Group Settings**:
   - Create new security group
   - Add these inbound rules:
     ```
     SSH         (22)        - Your IP
     Custom TCP  (30000)     - Anywhere (0.0.0.0/0)
     Custom TCP  (30001)     - Anywhere (0.0.0.0/0)
     HTTP        (80)        - Anywhere (0.0.0.0/0)
     HTTPS       (443)       - Anywhere (0.0.0.0/0)
     ```

4. **Launch Instance** and note the **Public IPv4 address**

---

### Step 2: Connect to EC2 (2 minutes)

```bash
# From your local machine (PowerShell or Git Bash)
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

If you get permission error on Windows:
```powershell
# In PowerShell (as Administrator)
icacls your-key.pem /inheritance:r
icacls your-key.pem /grant:r "$($env:USERNAME):(R)"
```

---

### Step 3: Install Prerequisites (10 minutes)

```bash
# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker
docker --version

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube version

# Install Git
sudo apt-get install -y git
```

---

### Step 4: Add Swap Memory (5 minutes)

This gives your instance extra virtual memory to handle Minikube's requirements:

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent (survives reboots)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active
free -h
```

You should see 2GB swap in the output.

---

### Step 5: Start Minikube (5 minutes)

```bash
# Start Minikube with limited resources (for t3.small)
# Note: Minikube requires minimum 2 CPUs and 1800MB memory
minikube start --driver=docker --cpus=2 --memory=1800mb --disk-size=10g

# Enable required addons
minikube addons enable metrics-server
minikube addons enable dashboard

# Verify cluster
minikube status
kubectl get nodes
```

Expected output:
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

### Step 6: Clone Repository and Configure (5 minutes)

```bash
# Clone your repository
cd ~
git clone https://github.com/talal-atiq/blogging-app-devops.git
cd blogging-app-devops/k8s

# Configure secrets with your actual values
nano secrets.yaml
```

**Edit secrets.yaml**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  mongodb-url: "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/YOUR_DB?retryWrites=true&w=majority"
  jwt-token: "YOUR_JWT_SECRET_HERE"
  mongo-password: "not-used-for-atlas"
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Step 7: Deploy Application (5 minutes)

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy everything
./deploy.sh
```

**Or manually**:
```bash
# Apply secrets
kubectl apply -f secrets.yaml

# Deploy backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Deploy frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Apply HPA
kubectl apply -f frontend-hpa.yaml

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=blogging-backend --timeout=180s
kubectl wait --for=condition=ready pod -l app=blogging-frontend --timeout=180s
```

**Verify deployment**:
```bash
kubectl get all
kubectl get hpa
```

You should see:
- 2 frontend pods running
- 2 backend pods running
- Services created
- HPA active

---

### Step 8: Install and Configure ngrok (5 minutes)

```bash
# Install ngrok
cd ~
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Sign up at https://dashboard.ngrok.com/signup
# Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

# Configure ngrok with your auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

---

### Step 9: Create Tunnels (5 minutes)

**Install tmux for persistent sessions**:
```bash
sudo apt-get install -y tmux
```

**Create Frontend Application Tunnel**:
```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)
echo "Minikube IP: $MINIKUBE_IP"

# Create tunnel in tmux session
tmux new-session -d -s frontend-tunnel "ngrok http $MINIKUBE_IP:30000"

# Wait 3 seconds for tunnel to initialize
sleep 3
```

**Create Dashboard Tunnel**:
```bash
# Start kubectl proxy in background
nohup kubectl proxy --address='0.0.0.0' --accept-hosts='.*' --port=8001 > /tmp/kubectl-proxy.log 2>&1 &

# Create dashboard tunnel in tmux
tmux new-session -d -s dashboard-tunnel "ngrok http 8001"

# Wait 3 seconds
sleep 3
```

**Get Your Tunnel URLs** (IMPORTANT - Save these!):
```bash
# Method 1: Query ngrok API
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | grep -o 'https://[^"]*'

# Method 2: Attach to tmux sessions to see URLs
echo "Frontend tunnel:"
tmux capture-pane -t frontend-tunnel -p | grep -o "https://[^.]*\.ngrok-free\.app" | head -1

echo "Dashboard tunnel:"
tmux capture-pane -t dashboard-tunnel -p | grep -o "https://[^.]*\.ngrok-free\.app" | head -1
```

**To manually view tunnels** (optional):
```bash
# Attach to frontend tunnel (Ctrl+B then D to detach)
tmux attach -t frontend-tunnel

# Attach to dashboard tunnel
tmux attach -t dashboard-tunnel
```

---

### Step 10: Get Submission URLs (IMPORTANT!)

**Copy these URLs for submission**:

```bash
# Get both URLs at once
echo "========================================="
echo "SUBMISSION URLs:"
echo "========================================="
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | grep -o 'https://[^"]*' | nl
echo "========================================="
echo ""
echo "1. Application URL (first URL above)"
echo "2. Dashboard URL (second URL above) + add this path:"
echo "   /api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/"
echo ""
echo "3. Web Server Deployment Name: frontend-deployment"
echo "4. Database Server Deployment Name: mongodb-deployment"
echo "========================================="
```

**Example Output**:
```
1. https://abc123.ngrok-free.app          ← Application URL
2. https://xyz456.ngrok-free.app          ← Dashboard base URL
```

**Your Final Submission URLs**:
1. **Application**: `https://abc123.ngrok-free.app`
2. **Dashboard**: `https://xyz456.ngrok-free.app/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/`
3. **Web Server Deployment**: `frontend-deployment`
4. **Database Server Deployment**: `mongodb-deployment`

---

### Step 11: Verification (5 minutes)

**Test Application URL**:
```bash
# From EC2
curl -I http://$(minikube ip):30000

# Should return: HTTP/1.1 200 OK
```

**Test from Browser**:
- Open your Application ngrok URL
- You should see your blogging app
- Click around to verify it works

**Test Dashboard URL**:
- Open your Dashboard ngrok URL (with the full path)
- You should see Kubernetes dashboard
- Navigate to: Workloads → Deployments
- Verify `frontend-deployment` shows 2/2 pods

**Check HPA**:
```bash
kubectl get hpa
kubectl describe hpa frontend-hpa
```

---

### Step 12: Test HPA Autoscaling (Optional - 10 minutes)

```bash
# Generate load to trigger scaling
while true; do
  curl -s http://$(minikube ip):30000 > /dev/null
  sleep 0.1
done

# In another terminal, watch scaling
kubectl get hpa --watch

# Watch pods increase
kubectl get pods -l app=blogging-frontend --watch
```

Stop the load after 2-3 minutes (Ctrl+C), then watch pods scale back down.

---

## 📸 Screenshots for Report (Optional)

```bash
# 1. Show all resources
kubectl get all -o wide

# 2. Show HPA
kubectl get hpa

# 3. Show deployments
kubectl get deployments

# 4. Show detailed HPA info
kubectl describe hpa frontend-hpa

# 5. Show pod resource usage
kubectl top pods

# 6. Show node info
kubectl top nodes
```

---

## 💰 Cost Management

### Keep Costs Minimal:

1. **During Development** (2-3 hours):
   - Cost: ~$0.06 - $0.10

2. **For Evaluation** (24 hours):
   - Cost: ~$0.50

3. **Total Project Cost**: ~$0.60

### After Submission:

**IMMEDIATELY terminate the instance**:
```bash
# From AWS Console
EC2 → Instances → Select instance → Instance state → Terminate
```

Or keep it stopped (still charges for storage):
```bash
# Stop instance (can restart later)
Instance state → Stop instance
```

---

## 🆘 Troubleshooting

### Minikube won't start on t3.small?
```bash
# Minikube requires minimum 2 CPUs and 1800MB memory
minikube delete
minikube start --driver=docker --cpus=2 --memory=1800mb --disk-size=8g

# If still out of memory, you may need t3a.small or t3.medium
# Or reduce disk size further
minikube delete
minikube start --driver=docker --cpus=2 --memory=1800mb --disk-size=6g
```

### Pods stuck in Pending?
```bash
# Check pod status
kubectl describe pod <POD-NAME>

# Common issue: Insufficient resources
# Solution: Reduce replicas
kubectl scale deployment frontend-deployment --replicas=1
kubectl scale deployment backend-deployment --replicas=1
```

### ngrok tunnels not working?
```bash
# Check tmux sessions
tmux ls

# Kill and recreate
tmux kill-session -t frontend-tunnel
tmux kill-session -t dashboard-tunnel

# Recreate
tmux new-session -d -s frontend-tunnel "ngrok http $(minikube ip):30000"
tmux new-session -d -s dashboard-tunnel "ngrok http 8001"
```

### Can't access dashboard?
```bash
# Check kubectl proxy
ps aux | grep "kubectl proxy"

# Restart if needed
pkill -f "kubectl proxy"
nohup kubectl proxy --address='0.0.0.0' --accept-hosts='.*' --port=8001 > /tmp/kubectl-proxy.log 2>&1 &
```

---

## ✅ Final Checklist

Before submitting:

- [ ] EC2 instance running
- [ ] Minikube started successfully
- [ ] All pods in Running state (`kubectl get pods`)
- [ ] HPA showing metrics (`kubectl get hpa`)
- [ ] Frontend tunnel active and accessible in browser
- [ ] Dashboard tunnel active and accessible in browser
- [ ] Application URL copied
- [ ] Dashboard URL copied (with full path)
- [ ] Deployment names noted: `frontend-deployment`, `mongodb-deployment`

---

## 📝 Submission Template

**Copy and fill this**:

```
1. Deployed Application's Tunneled URL:
   https://YOUR-FRONTEND-ID.ngrok-free.app

2. minikube Dashboard's Tunneled URL:
   https://YOUR-DASHBOARD-ID.ngrok-free.app/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/

3. Web Server Deployment Name:
   frontend-deployment

4. Database Server Deployment Name:
   mongodb-deployment
```

---

## 🎯 Quick Command Reference

```bash
# Check everything
kubectl get all
kubectl get hpa
kubectl top pods

# Get tunnel URLs
curl -s http://localhost:4040/api/tunnels | grep public_url

# View tmux sessions
tmux ls
tmux attach -t frontend-tunnel  # Ctrl+B then D to exit

# Restart a tunnel
tmux kill-session -t frontend-tunnel
tmux new-session -d -s frontend-tunnel "ngrok http $(minikube ip):30000"

# Check logs
kubectl logs -l app=blogging-frontend --tail=20
kubectl logs -l app=blogging-backend --tail=20

# Describe resources
kubectl describe deployment frontend-deployment
kubectl describe hpa frontend-hpa
```

---

**Total Time Required: ~1.5 - 2 hours**
**Total Cost: < $1.00**

Good luck! 🚀
