# Instructions for Testing Jenkins Pipeline

## Prerequisites
- GitHub account added as collaborator
- Git installed on your machine

## Steps to Test

### 1. Clone the Repository
```bash
git clone https://github.com/talal-atiq/blogging-app-devops.git
cd blogging-app-devops
```

### 2. Configure Git with Your Email (IMPORTANT!)
```bash
git config user.name "Your Name"
git config user.email "your-email@gmail.com"
```

**Verify:**
```bash
git config user.email
# Should show YOUR email, not iamtalalatique@gmail.com
```

### 3. Check Initial State
- Visit: http://35.153.144.16:8081
- Expected: Site should NOT be accessible (containers are down)

### 4. Make a Small Change
```bash
echo "# Test by [Your Name]" >> README.md
git add README.md
git commit -m "Test Jenkins pipeline trigger"
git push origin main
```

### 5. Watch Jenkins Build
- Visit: http://35.153.144.16:8080
- You'll see the pipeline start automatically (webhook trigger)
- Watch the build progress through 6 stages:
  1. Checkout Code from GitHub
  2. Build Frontend
  3. Stop Previous Containers
  4. Deploy with Docker Compose
  5. Run Selenium Tests (10 tests)
  6. Verify Deployment

### 6. Verify Deployment
- After build completes, visit: http://35.153.144.16:8081
- Expected: Blogging application should now be running!

### 7. Check Email
- Check your email inbox (the one you configured in step 2)
- Subject: "Jenkins Build SUCCESS: blogging-app-ci #X"
- Contains: Test results showing 10 Selenium tests passed

## Troubleshooting

**If you get someone else's email in the results:**
- You forgot step 2! Git is using cached credentials
- Re-run: `git config user.email "your-email@gmail.com"`
- Check with: `git config user.email`

**If website doesn't load after build:**
- Check Jenkins console for errors
- Verify build completed successfully (all stages green)

**If email not received:**
- Check spam folder
- Verify email was configured correctly (step 2)
- Check Jenkins console output for "Attempting to send email to: [your-email]"

## URLs
- Application (after build): http://35.153.144.16:8081
- Jenkins Dashboard: http://35.153.144.16:8080
- GitHub Repository: https://github.com/talal-atiq/blogging-app-devops

## Contact
For issues, contact: Talal Atiq (iamtalalatique@gmail.com)
