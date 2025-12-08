pipeline {
    agent any
    
    environment {
        APP_URL = 'http://3.238.100.116:8081'
        DEFAULT_RECIPIENTS = 'iamtalalatique@gmail.com'  // Fallback if Git email not found
        GIT_COMMITTER_EMAIL = ''  // Will be populated dynamically
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '=== Checking out code from GitHub ==='
                checkout scm
                
                script {
                    // Get the email of the person who made the commit
                    env.GIT_COMMITTER_EMAIL = sh(
                        script: 'git log -1 --pretty=format:"%ae"',
                        returnStdout: true
                    ).trim()
                    echo "Git committer email: ${env.GIT_COMMITTER_EMAIL}"
                }
            }
        }
        
        stage('Build Test Docker Image') {
            steps {
                echo '=== Building Docker image for Selenium tests ==='
                dir('selenium-tests') {
                    script {
                        sh 'docker build -t selenium-tests:latest .'
                    }
                }
            }
        }
        
        stage('Run Selenium Tests in Docker') {
            steps {
                echo '=== Running Selenium tests in Docker container ==='
                script {
                    dir('selenium-tests') {
                        // Run tests and capture exit code
                        def testStatus = sh(
                            script: """
                                set +e
                                docker run --name selenium-test-run \
                                    --memory="1g" \
                                    --memory-swap="1g" \
                                    -e APP_URL=${APP_URL} \
                                    selenium-tests:latest \
                                    pytest tests/test_selenium_lightweight.py -v --tb=short --html=report.html --self-contained-html --junit-xml=test-results.xml
                                EXIT_CODE=\$?
                                
                                # Copy test results out of container
                                docker cp selenium-test-run:/tests/report.html ./report.html 2>/dev/null || echo "No report.html"
                                docker cp selenium-test-run:/tests/test-results.xml ./test-results.xml 2>/dev/null || echo "No test-results.xml"
                                
                                # Clean up container
                                docker rm selenium-test-run 2>/dev/null || true
                                
                                exit \$EXIT_CODE
                            """,
                            returnStatus: true
                        )
                        
                        if (testStatus != 0) {
                            currentBuild.result = 'UNSTABLE'
                            echo "Tests encountered failures (exit code: ${testStatus})"
                        } else {
                            echo "All tests passed!"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                dir('selenium-tests') {
                    // Archive test reports
                    archiveArtifacts artifacts: 'report.html,test-results.xml', allowEmptyArchive: true
                    
                    // Publish JUnit results
                    junit testResults: 'test-results.xml', allowEmptyResults: true
                    
                    // Publish HTML report
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: '.',
                        reportFiles: 'report.html',
                        reportName: 'Selenium Test Report'
                    ])
                }
            }
            
            // Email notification to Git committer with HTML report
            script {
                def recipientEmail = env.GIT_COMMITTER_EMAIL ?: env.DEFAULT_RECIPIENTS
                echo "Sending email to: ${recipientEmail}"
                
                emailext(
                    subject: "Jenkins Build ${currentBuild.result}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body:  """
                        <html>
                        <body style="font-family: Arial, sans-serif;">
                            <h2 style="color: ${currentBuild.result == 'SUCCESS' ? '#28a745' : currentBuild.result == 'UNSTABLE' ? '#ffc107' : '#dc3545'};">
                                Build ${currentBuild.result}
                            </h2>
                            
                            <h3>Build Information</h3>
                            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                                <tr style="background-color: #f8f9fa;">
                                    <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Job Name:</strong></td>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;">${env.JOB_NAME}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Build Number:</strong></td>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;">#${env.BUILD_NUMBER}</td>
                                </tr>
                                <tr style="background-color: #f8f9fa;">
                                    <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Triggered By:</strong></td>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;">${recipientEmail}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>Build Status:</strong></td>
                                    <td style="padding: 8px; border: 1px solid #dee2e6; color: ${currentBuild.result == 'SUCCESS' ? '#28a745' : currentBuild.result == 'UNSTABLE' ? '#ffc107' : '#dc3545'};">
                                        <strong>${currentBuild.result}</strong>
                                    </td>
                                </tr>
                            </table>
                            
                            <h3>Test Results</h3>
                            <p>📊 <strong>12 Selenium test cases executed in Docker container</strong></p>
                            <p>🌐 <strong>Chrome WebDriver (Headless Mode)</strong></p>
                            <p>📄 HTML and JUnit XML reports generated</p>
                            <p>📎 Detailed HTML test report attached to this email</p>
                            
                            <h3>Quick Links</h3>
                            <ul>
                                <li><a href="${env.BUILD_URL}">View Build Console</a></li>
                                <li><a href="${env.BUILD_URL}Selenium_20Test_20Report/">Interactive Test Report</a></li>
                                <li><a href="${env.BUILD_URL}artifact/selenium-tests/report.html">Download HTML Report</a></li>
                            </ul>
                            
                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
                            
                            <p style="font-size: 12px; color: #6c757d;">
                                This is an automated notification from Jenkins CI/CD Pipeline.<br>
                                For detailed console output, check the build log in Jenkins.
                            </p>
                        </body>
                        </html>
                    """,
                    to: "${recipientEmail}",
                    attachmentsPattern: 'selenium-tests/report.html',
                    mimeType: 'text/html'
                )
            }
        }
        
        success {
            echo '=== Pipeline completed successfully ==='
        }
        
        failure {
            echo '=== Pipeline failed ==='
        }
        
        unstable {
            echo '=== Pipeline unstable - some tests failed ==='
        }
    }
}