pipeline {
    agent any

    // Environment variables
    environment {
        // Application environment variables
        SERVER_ENV = """
            DB_URL=mongodb+srv://bloguser:blog1122@cluster0.ldk4azk.mongodb.net/?appName=Cluster0
            JWT_TOKEN=super-secret-key
            PORT=5000
        """
        
        // Application URL - Using your EC2 public IP
        APP_URL = "http://98.93.37.134:8081"
        
        // Optional: Set to 'true' to skip admin-only tests if you don't have admin credentials
        // SKIP_ADMIN_TESTS = "true"
    }

    // Trigger pipeline on GitHub push
    triggers {
        githubPush()
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo '=== Checking out code from GitHub ==='
                checkout scm
            }
        }
        
        stage('Create .env file') {
            steps {
                echo '=== Creating environment file for application ==='
                sh 'echo "${SERVER_ENV}" > server.env'
            }
        }

        stage('Build and Run Application') {
            steps {
                echo '=== Building and running blog application ==='
                sh 'docker-compose -f docker-compose.yml down --remove-orphans || true'
                sh 'docker-compose -f docker-compose.yml up -d --build'
            }
        }
        
        stage('Wait for Application Startup') {
            steps {
                echo '=== Waiting for application to be ready ==='
                script {
                    // Wait for containers to start
                    sleep(time: 30, unit: 'SECONDS')
                    
                    // Health check - retry up to 5 times
                    retry(5) {
                        sleep(time: 10, unit: 'SECONDS')
                        sh """
                            curl -f ${APP_URL} || exit 1
                        """
                    }
                }
                echo '=== Application is ready for testing ==='
            }
        }
        
        stage('Build Test Docker Image') {
            steps {
                echo '=== Building Docker image for Selenium tests ==='
                dir('selenium-tests') {
                    sh 'docker build -t selenium-test-image .'
                }
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo '=== Running Selenium tests in Docker container ==='
                script {
                    // Run tests in Docker container
                    // --network host allows container to access app on localhost
                    def testStatus = sh(
                        script: """
                            docker run --rm \
                                --network host \
                                -e APP_URL=${APP_URL} \
                                -v \$(pwd)/selenium-tests:/tests \
                                selenium-test-image \
                                pytest tests/ -v --html=report.html --self-contained-html --junit-xml=test-results.xml
                        """,
                        returnStatus: true
                    )
                    
                    // Copy test results from volume
                    sh 'cp selenium-tests/report.html . || echo "No HTML report generated"'
                    sh 'cp selenium-tests/test-results.xml . || echo "No XML results generated"'
                    
                    // Set build result based on test outcome
                    if (testStatus != 0) {
                        currentBuild.result = 'UNSTABLE'
                        echo "⚠️ Some tests failed with exit code: ${testStatus}"
                    } else {
                        echo "✅ All tests passed successfully!"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo '=== Cleaning up and publishing results ==='
            
            // Clean up environment file
            sh 'rm -f server.env'
            
            // Archive test artifacts
            archiveArtifacts artifacts: 'report.html,test-results.xml', allowEmptyArchive: true
            
            // Publish JUnit test results
            junit testResults: 'test-results.xml', allowEmptyResults: true
            
            // Publish HTML report
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'report.html',
                reportName: 'Selenium Test Report'
            ])
            
            // Email test results to collaborators
            emailext(
                to: '${DEFAULT_RECIPIENTS}',
                subject: "Jenkins Build ${currentBuild.result}: ${env.JOB_NAME} - Build #${env.BUILD_NUMBER}",
                body: """
                    <html>
                    <body style="font-family: Arial, sans-serif;">
                        <h2 style="color: ${currentBuild.result == 'SUCCESS' ? '#28a745' : currentBuild.result == 'UNSTABLE' ? '#ffc107' : '#dc3545'};">
                            Build ${currentBuild.result}: ${env.JOB_NAME}
                        </h2>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                            <p><b>Build Status:</b> <span style="color: ${currentBuild.result == 'SUCCESS' ? '#28a745' : currentBuild.result == 'UNSTABLE' ? '#ffc107' : '#dc3545'};">${currentBuild.result}</span></p>
                            <p><b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                            <p><b>Triggered by:</b> ${env.CHANGE_AUTHOR ?: 'Manual trigger'}</p>
                        </div>
                        
                        <h3>📊 Test Results</h3>
                        <p>View detailed test report: <a href="${env.BUILD_URL}Selenium_20Test_20Report/" style="color: #007bff;">Selenium Test Report</a></p>
                        <p>View test results: <a href="${env.BUILD_URL}testReport/" style="color: #007bff;">JUnit Test Results</a></p>
                        
                        <h3>📝 Recent Changes</h3>
                        <p><b>Commit:</b> ${env.GIT_COMMIT ?: 'N/A'}</p>
                        
                        <hr style="margin: 20px 0;">
                        <p style="color: #6c757d; font-size: 12px;"><i>This is an automated email from Jenkins CI/CD Pipeline.</i></p>
                    </body>
                    </html>
                """,
                mimeType: 'text/html',
                attachLog: true,
                attachmentsPattern: 'report.html',
                recipientProviders: [
                    [$class: 'DevelopersRecipientProvider'],
                    [$class: 'RequesterRecipientProvider']
                ]
            )
            
            // Shut down application after tests
            sh 'docker-compose -f docker-compose.yml down --remove-orphans || true'
            
            // Clean up test Docker image (optional - comment out to keep for faster rebuilds)
            sh 'docker rmi selenium-test-image || true'
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
        }
        
        failure {
            echo '❌ Pipeline failed!'
        }
        
        unstable {
            echo '⚠️ Tests failed but pipeline completed!'
        }
    }
}
