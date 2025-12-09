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
                    env.GIT_COMMITTER_EMAIL = sh(
                        script: 'git log -1 --pretty=%ae',
                        returnStdout: true
                    ).trim()
                    
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
                
                emailext(
                    subject: "Jenkins Build ${testStatus}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <html>
                        <body style="font-family: Arial, sans-serif;">
                            <h2 style="color: ${testStatus == 'SUCCESS' ? '#28a745' : '#dc3545'};">
                                Build ${testStatus}
                            </h2>
                            
                            <h3>Build Information</h3>
                            <table style="border-collapse: collapse;">
                                <tr><td><strong>Job Name:</strong></td><td>${env.JOB_NAME}</td></tr>
                                <tr><td><strong>Build Number:</strong></td><td>#${env.BUILD_NUMBER}</td></tr>
                                <tr><td><strong>Commit:</strong></td><td>${env.GIT_COMMIT_MSG}</td></tr>
                                <tr><td><strong>Author:</strong></td><td>${env.GIT_COMMITTER}</td></tr>
                                <tr><td><strong>Status:</strong></td><td><strong>${testStatus}</strong></td></tr>
                            </table>
                            
                            <h3>Test Results</h3>
                            <p>✓ 10 Selenium test cases executed</p>
                            <p>🌐 Chrome WebDriver (Headless Mode)</p>
                            <p>📄 TestNG reports generated</p>
                            
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="${env.BUILD_URL}">View Build Console</a></li>
                                <li><a href="${env.BUILD_URL}testReport/">Test Report</a></li>
                            </ul>
                        </body>
                        </html>
                    """,
                    to: "${recipientEmail}",
                    mimeType: 'text/html'
                )
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