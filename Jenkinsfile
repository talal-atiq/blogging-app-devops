pipeline {
    agent any

    environment {
        // Application environment variables
        SERVER_ENV = """
            DB_URL=mongodb+srv://bloguser:blog1122@cluster0.ldk4azk.mongodb.net/?appName=Cluster0
            JWT_TOKEN=super-secret-key
            PORT=5000
        """
        
        // Application URL - Update if IP changed after restart
        APP_URL = "http://98.83.36.74:8081"
    }

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
                echo '=== Creating environment file ==='
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
                    sleep(time: 30, unit: 'SECONDS')
                    
                    retry(5) {
                        sleep(time: 10, unit: 'SECONDS')
                        sh "curl -f ${APP_URL} || exit 1"
                    }
                }
                echo '=== Application is ready for testing ==='
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo '=== Running Selenium tests directly on EC2 ==='
                script {
                    dir('selenium-tests') {
                        // Run tests using system Python (no Docker needed)
                        def testStatus = sh(
                            script: """
                                export APP_URL=${APP_URL}
                                python3 -m pytest tests/ -v \\
                                    --html=report.html \\
                                    --self-contained-html \\
                                    --junit-xml=test-results.xml || true
                            """,
                            returnStatus: true
                        )
                        
                        // Copy results to workspace root
                        sh 'cp report.html ../report.html || echo "No HTML report"'
                        sh 'cp test-results.xml ../test-results.xml || echo "No XML report"'
                        
                        if (testStatus != 0) {
                            currentBuild.result = 'UNSTABLE'
                            echo "⚠️ Some tests failed"
                        } else {
                            echo "✅ All tests passed!"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo '=== Cleaning up ==='
            
            sh 'rm -f server.env'
            
            archiveArtifacts artifacts: 'report.html,test-results.xml', allowEmptyArchive: true
            
            junit testResults: 'test-results.xml', allowEmptyResults: true
            
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'report.html',
                reportName: 'Selenium Test Report'
            ])
            
            emailext(
                to: '${DEFAULT_RECIPIENTS}',
                subject: "Jenkins Build ${currentBuild.result}: ${env.JOB_NAME} - #${env.BUILD_NUMBER}",
                body: """
                    <html>
                    <body style="font-family: Arial, sans-serif;">
                        <h2 style="color: ${currentBuild.result == 'SUCCESS' ? '#28a745' : currentBuild.result == 'UNSTABLE' ? '#ffc107' : '#dc3545'};">
                            Build ${currentBuild.result}: ${env.JOB_NAME}
                        </h2>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><b>Build Number:</b> ${env.BUILD_NUMBER}</p>
                            <p><b>Status:</b> ${currentBuild.result}</p>
                            <p><b>Build URL:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                        </div>
                        
                        <h3>📊 Test Results</h3>
                        <p><a href="${env.BUILD_URL}Selenium_20Test_20Report/">View Test Report</a></p>
                        
                        <hr>
                        <p style="color: #6c757d; font-size: 12px;"><i>Automated Jenkins CI/CD Pipeline</i></p>
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
            
            // Keep blog app running for manual testing
            // Uncomment below to stop app after tests:
            // sh 'docker-compose -f docker-compose.yml down --remove-orphans || true'
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
