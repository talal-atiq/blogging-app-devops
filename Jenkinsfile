pipeline {
    agent any
    
    environment {
        APP_URL = "http://98.83.36.74:8081"
    }
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                echo '=== Checking out test code from GitHub ==='
                checkout scm
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo '=== Running Selenium tests on EC2 ==='
                script {
                    dir('selenium-tests') {
                        def testStatus = sh(
                            script: '''
                                export APP_URL=${APP_URL}
                                python3 -m pytest tests/ -v \
                                    --html=report.html \
                                    --self-contained-html \
                                    --junit-xml=test-results.xml || true
                            ''',
                            returnStatus: true
                        )
                        
                        sh 'cp report.html ../ || echo "No report"'
                        sh 'cp test-results.xml ../ || echo "No results"'
                        
                        if (testStatus != 0) {
                            currentBuild.result = 'UNSTABLE'
                            echo '⚠️ Some tests failed'
                        } else {
                            echo '✅ All tests passed!'
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
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
                subject: 'Jenkins Build ${currentBuild.result}: ${env.JOB_NAME} #${env.BUILD_NUMBER}',
                body: '''
                    <html>
                    <body>
                        <h2>Build ${currentBuild.result}</h2>
                        <p><b>Build:</b> ${env.BUILD_NUMBER}</p>
                        <p><b>Status:</b> ${currentBuild.result}</p>
                        <p><a href="${env.BUILD_URL}Selenium_20Test_20Report/">View Test Report</a></p>
                    </body>
                    </html>
                ''',
                mimeType: 'text/html',
                recipientProviders: [
                    [$class: 'DevelopersRecipientProvider'],
                    [$class: 'RequesterRecipientProvider']
                ]
            )
        }
        
        success { echo '✅ Pipeline completed successfully!' }
        failure { echo '❌ Pipeline failed!' }
        unstable { echo '⚠️ Tests failed but pipeline completed!' }
    }
}
