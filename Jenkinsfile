pipeline {
    agent any
    
    environment {
        // Environment variables for the build
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        DB_URL = credentials('mongodb-url')  // Store in Jenkins credentials
        JWT_TOKEN = credentials('jwt-token')  // Store in Jenkins credentials
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
                    
                    echo "Commit: ${env.GIT_COMMIT_MSG}"
                    echo "Author: ${env.GIT_COMMITTER}"
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
                    sleep(time: 10, unit: 'SECONDS')
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '========================================'
                echo 'Stage 5: Verifying Deployment'
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
        success {
            echo '========================================'
            echo 'Pipeline completed successfully!'
            echo 'Application is running on:'
            echo 'Frontend: http://<EC2-IP>:8081'
            echo 'Backend: http://<EC2-IP>:5001'
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
        
        always {
            // Show container logs for debugging
            echo 'Container logs:'
            sh '''
                docker-compose -f ${DOCKER_COMPOSE_FILE} logs --tail=50 || true
            '''
        }
    }
}
        unstable {
            echo '=== Pipeline unstable - some tests failed ==='
        }
    }
}