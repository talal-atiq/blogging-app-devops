pipeline {
    agent any
    
    environment {
        APP_URL = 'http://3.238.100.116:8081'
        DEFAULT_RECIPIENTS = 'iamtalalatique@gmail.com'  // Update this
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '=== Checking out code from GitHub ==='
                checkout scm
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
                                    pytest tests/test_minimal_passing.py -v --tb=short --html=report.html --self-contained-html --junit-xml=test-results.xml
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
            
            // Email notification
            emailext(
                subject: "Jenkins Build ${currentBuild.result}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    Build Status: ${currentBuild.result}
                    
                    Job: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                    Build URL: ${env.BUILD_URL}
                    
                    Test Report: ${env.BUILD_URL}Selenium_20Test_20Report/
                    
                    Check Jenkins for detailed test results.
                """,
                to: "${DEFAULT_RECIPIENTS}",
                attachLog: true
            )
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