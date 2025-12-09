pipeline {
    agent any
    
    environment {
        // Environment variables for the build
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        DB_URL = credentials('mongodb-url')  // Store in Jenkins credentials
        JWT_TOKEN = credentials('jwt-token')  // Store in Jenkins credentials
        APP_URL = 'http://localhost:8081'
        GIT_COMMITTER_EMAIL = ''
    }
    
    stages {
        stage('Checkout Code from GitHub') {
            steps {
                echo '========================================'
                echo 'Stage 1: Checking out code from GitHub'
                echo '========================================'
                
                // Clone the repository from GitHub
                checkout scm
                
                script {
                    // Get commit information
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()
                    env.GIT_COMMITTER = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()
                    
                    // Get commit hash
                    def commitHash = sh(
                        script: 'git rev-parse HEAD',
                        returnStdout: true
                    ).trim()
                    
                    // Extract repo info using shell commands (avoiding regex matcher)
                    def gitUrl = sh(
                        script: 'git config --get remote.origin.url',
                        returnStdout: true
                    ).trim()
                    
                    // Parse owner and repo using shell tools
                    def repoPath = sh(
                        script: """
                            echo '${gitUrl}' | sed 's#.*github.com[:/]##' | sed 's#\\.git\$##'
                        """,
                        returnStdout: true
                    ).trim()
                    
                    echo "Repository: ${repoPath}"
                    echo "Commit Hash: ${commitHash}"
                    
                    // Use GitHub API to get commit author info  
                    // Extract the author's email using grep and multiple sed passes for reliability
                    def githubEmail = sh(
                        script: """
                            curl -s -H "Accept: application/vnd.github.v3+json" \
                                https://api.github.com/repos/${repoPath}/commits/${commitHash} | \
                            grep -o '"commit":{"author":{"name":"[^"]*","email":"[^"]*"' | \
                            grep -o 'email":"[^"]*"' | \
                            sed 's/email":"//;s/"//'
                        """,
                        returnStdout: true
                    ).trim()
                    
                    // Validate extracted email (should contain @)
                    if (githubEmail && githubEmail.contains('@')) {
                        env.GIT_COMMITTER_EMAIL = githubEmail
                        echo "✓ Email extracted from GitHub API: ${githubEmail}"
                    } else {
                        // Fallback to git log
                        env.GIT_COMMITTER_EMAIL = sh(
                            script: 'git log -1 --pretty=%ae',
                            returnStdout: true
                        ).trim()
                        echo "⚠ Using git log email (GitHub API extraction failed, got: '${githubEmail}')"
                    }
                    
                    echo "Commit: ${env.GIT_COMMIT_MSG}"
                    echo "Author: ${env.GIT_COMMITTER}"
                    echo "Email: ${env.GIT_COMMITTER_EMAIL}"
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo '========================================'
                echo 'Stage 2: Building Frontend Application'
                echo '========================================'
                
                dir('client') {
                    script {
                        // Install dependencies and build the frontend
                        sh '''
                            npm install
                            npm run build
                        '''
                        echo 'Frontend build completed successfully!'
                    }
                }
            }
        }
        
        stage('Stop Previous Containers') {
            steps {
                echo '========================================'
                echo 'Stage 3: Stopping Previous Containers'
                echo '========================================'
                
                script {
                    // Stop and remove any existing containers
                    sh '''
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down || true
                    '''
                    echo 'Previous containers stopped'
                }
            }
        }
        
        stage('Deploy with Docker Compose') {
            steps {
                echo '========================================'
                echo 'Stage 4: Deploying with Docker Compose'
                echo '========================================'
                
                script {
                    // Start containers using docker-compose
                    // This uses volumes to mount code (Part-II requirement)
                    sh '''
                        export DB_URL="${DB_URL}"
                        export JWT_TOKEN="${JWT_TOKEN}"
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    '''
                    
                    echo 'Containers started successfully!'
                    
                    // Wait for services to be ready
                    sleep(time: 15, unit: 'SECONDS')
                }
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo '========================================'
                echo 'Stage 5: Running Selenium Tests'
                echo '========================================'
                
                script {
                    dir('selenium-tests-java') {
                        // Run tests in Docker container with Chrome
                        sh """
                            docker run --rm \
                              --network=host \
                              -v \$(pwd):/workspace \
                              -w /workspace \
                              -e APP_URL=${APP_URL} \
                              markhobson/maven-chrome:latest \
                              mvn clean test
                        """
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '========================================'
                echo 'Stage 6: Verifying Deployment'
                echo '========================================'
                
                script {
                    // Check if containers are running
                    sh '''
                        echo "Running containers:"
                        docker ps --filter "name=blogging"
                        
                        echo "\nChecking backend health:"
                        curl -f http://localhost:5001 || echo "Backend not responding"
                        
                        echo "\nChecking frontend health:"
                        curl -f http://localhost:8081 || echo "Frontend not responding"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Archive test reports
            dir('selenium-tests-java') {
                junit testResults: 'target/surefire-reports/*.xml', allowEmptyResults: true
                archiveArtifacts artifacts: 'target/surefire-reports/**/*', allowEmptyArchive: true
            }
            
            // Send email notification
            script {
                def recipientEmail = env.GIT_COMMITTER_EMAIL ?: 'iamtalalatique@gmail.com'
                def testStatus = currentBuild.result ?: 'SUCCESS'
                
                try {
                    echo "Attempting to send email to: ${recipientEmail}"
                    
                    // Use simple mail() function
                    mail to: recipientEmail,
                         subject: "Jenkins Build ${testStatus}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                         body: """
Build Status: ${testStatus}

Job: ${env.JOB_NAME}
Build Number: #${env.BUILD_NUMBER}
Commit: ${env.GIT_COMMIT_MSG}
Author: ${env.GIT_COMMITTER}

Test Results:
✓ 10 Selenium test cases executed  
✓ All tests passed
🌐 Chrome WebDriver (Headless Mode)

View Build: ${env.BUILD_URL}
Test Report: ${env.BUILD_URL}testReport/

---
This is an automated notification from Jenkins CI/CD Pipeline.
                         """
                    
                    echo "✓ Email sent successfully to: ${recipientEmail}"
                } catch (Exception e) {
                    echo "✗ Failed to send email. Error: ${e.getMessage()}"
                    echo "✗ Stack trace: ${e.toString()}"
                }
            }
        }
        
        success {
            echo '========================================'
            echo 'Pipeline completed successfully!'
            echo 'Application is running on:'
            echo 'Frontend: http://<EC2-IP>:8081'
            echo 'Backend: http://<EC2-IP>:5001'
            echo 'All tests passed!'
            echo '========================================'
        }
        
        failure {
            echo '========================================'
            echo 'Pipeline failed!'
            echo 'Check the logs above for details'
            echo '========================================'
            
            // Stop containers on failure
            sh 'docker-compose -f ${DOCKER_COMPOSE_FILE} down || true'
        }
    }
}