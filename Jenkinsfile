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
                    
                    // DEBUG: Print all available environment variables related to Git/GitHub
                    echo "=== DEBUG: Environment Variables ==="
                    sh 'env | grep -i git || true'
                    sh 'env | grep -i github || true'
                    sh 'env | grep -i change || true'
                    echo "==================================="
                    
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
                    
                    // Use Python script to reliably extract email from GitHub API
                    def githubEmail = ''
                    try {
                        githubEmail = sh(
                            script: """
                                python3 get_commit_email.py '${repoPath}' '${commitHash}' 2>&1
                            """,
                            returnStdout: true
                        ).trim()
                    } catch (Exception e) {
                        echo "Python script failed: ${e.message}"
                        githubEmail = ''
                    }
                    
                    echo "Python script returned: '${githubEmail}'"
                    
                    // Validate extracted email (should contain @)
                    if (githubEmail && githubEmail.contains('@') && !githubEmail.contains('Error')) {
                        env.GIT_COMMITTER_EMAIL = githubEmail
                        echo "✓ Email extracted from GitHub API: ${githubEmail}"
                    } else {
                        // Fallback to git log
                        def gitLogEmail = sh(
                            script: 'git log -1 --pretty=%ae',
                            returnStdout: true
                        ).trim()
                        env.GIT_COMMITTER_EMAIL = gitLogEmail
                        echo "⚠ Using git log email: ${gitLogEmail}"
                        echo "⚠ (GitHub API failed, returned: '${githubEmail}')"
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
                // DEBUG: Check what email we have
                echo "=== EMAIL DEBUG ==="
                echo "env.GIT_COMMITTER_EMAIL = '${env.GIT_COMMITTER_EMAIL}'"
                echo "env.GIT_COMMITTER = '${env.GIT_COMMITTER}'"
                echo "env.GIT_COMMIT_MSG = '${env.GIT_COMMIT_MSG}'"
                
                // Re-extract email here to be absolutely sure
                def finalEmail = sh(
                    script: 'git log -1 --pretty=%ae',
                    returnStdout: true
                ).trim()
                
                echo "Git log email (freshly extracted): '${finalEmail}'"
                
                // Use the freshly extracted email (not env variable which might be 'null' string)
                def recipientEmail = finalEmail
                
                // Fallback only if truly empty
                if (!recipientEmail || recipientEmail == '' || recipientEmail == 'null') {
                    recipientEmail = 'iamtalalatique@gmail.com'
                    echo "⚠ No valid email found, using default"
                }
                
                def testStatus = currentBuild.result ?: 'SUCCESS'
                
                echo "Final recipient email: '${recipientEmail}'"
                echo "==================="
                
                // Extract test results from JUnit XML
                def testSummary = ""
                def testDetails = ""
                try {
                    dir('selenium-tests-java/target/surefire-reports') {
                        def testResultFiles = findFiles(glob: 'TEST-*.xml')
                        if (testResultFiles.length > 0) {
                            def testResults = junit testResults: '*.xml', allowEmptyResults: true
                            
                            // Get test case details
                            testDetails = sh(
                                script: '''
                                    echo "Test Case Results:"
                                    echo "=================="
                                    for file in TEST-*.xml; do
                                        if [ -f "$file" ]; then
                                            echo ""
                                            grep -o 'testcase name="[^"]*"' "$file" | sed 's/testcase name="\\(.*\\)"/  ✓ \\1/' || true
                                        fi
                                    done
                                    echo ""
                                    echo "Summary:"
                                    echo "--------"
                                    grep -h 'testsuite' TEST-*.xml | head -1 | sed 's/.*tests="\\([^"]*\\)".*failures="\\([^"]*\\)".*errors="\\([^"]*\\)".*skipped="\\([^"]*\\)".*/Total Tests: \\1\\nPassed: \\1\\nFailures: \\2\\nErrors: \\3\\nSkipped: \\4/' || echo "Could not parse summary"
                                ''',
                                returnStdout: true
                            ).trim()
                        } else {
                            testDetails = "No test result files found."
                        }
                    }
                } catch (Exception e) {
                    testDetails = "Error reading test results: ${e.message}"
                }
                
                // Collect log file paths
                def logFiles = []
                try {
                    dir('selenium-tests-java/target/surefire-reports') {
                        def txtFiles = findFiles(glob: '*.txt')
                        txtFiles.each { file ->
                            logFiles.add("selenium-tests-java/target/surefire-reports/${file.name}")
                        }
                    }
                } catch (Exception e) {
                    echo "Could not find log files: ${e.message}"
                }
                
                try {
                    echo "Attempting to send email to: ${recipientEmail}"
                    
                    // Build email body with detailed test results
                    def emailBody = """
╔═══════════════════════════════════════════════════════════════╗
║          JENKINS CI/CD PIPELINE - BUILD NOTIFICATION          ║
╚═══════════════════════════════════════════════════════════════╝

Build Status: ${testStatus} ${testStatus == 'SUCCESS' ? '✓' : '✗'}

PROJECT INFORMATION:
━━━━━━━━━━━━━━━━━━━━
Job Name      : ${env.JOB_NAME}
Build Number  : #${env.BUILD_NUMBER}
Build URL     : ${env.BUILD_URL}

COMMIT DETAILS:
━━━━━━━━━━━━━━━━━━━━
Author        : ${env.GIT_COMMITTER}
Email         : ${recipientEmail}
Commit Message: ${env.GIT_COMMIT_MSG}

SELENIUM TEST RESULTS:
━━━━━━━━━━━━━━━━━━━━
${testDetails}

REPORTS & ARTIFACTS:
━━━━━━━━━━━━━━━━━━━━
📊 Test Report    : ${env.BUILD_URL}testReport/
📁 Build Artifacts: ${env.BUILD_URL}artifact/
📋 Console Output : ${env.BUILD_URL}console

DEPLOYMENT STATUS:
━━━━━━━━━━━━━━━━━━━━
🌐 Frontend       : http://35.153.144.16:8081
🔧 Backend        : http://35.153.144.16:5001

${logFiles.size() > 0 ? '\n📎 Attached Files:\n' + logFiles.collect { "   - ${it.split('/').last()}" }.join('\n') : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is an automated notification from Jenkins CI/CD Pipeline.
For more details, visit: ${env.BUILD_URL}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    """
                    
                    // Send email with attachments if available
                    if (logFiles.size() > 0) {
                        emailext(
                            to: recipientEmail,
                            subject: "Jenkins Build ${testStatus}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: emailBody,
                            attachmentsPattern: 'selenium-tests-java/target/surefire-reports/*.txt,selenium-tests-java/target/surefire-reports/TEST-*.xml',
                            mimeType: 'text/plain'
                        )
                    } else {
                        mail(
                            to: recipientEmail,
                            subject: "Jenkins Build ${testStatus}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                            body: emailBody
                        )
                    }
                    
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