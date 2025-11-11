pipeline {
    agent any

    // Environment variables needed by the docker-compose file
    environment {
        // --- !!! YOU MUST EDIT THIS !!! ---
        // This creates a temporary server.env file on the Jenkins server
        // Put your REAL Mongo URI and JWT secret here.
        SERVER_ENV = """
            DB_URL=mongodb+srv://bloguser:blog1122@cluster0.ldk4azk.mongodb.net/?appName=Cluster0
            JWT_TOKEN=super-secret-key
            PORT=5000
        """
    }

    stages {
        stage('Checkout') {
            steps {
                // This fetches your code from GitHub
                checkout scm
            }
        }
        
        stage('Create .env file') {
            steps {
                // This creates the server.env file that
                // docker-compose.yml needs to run
                sh 'echo "${SERVER_ENV}" > server.env'
            }
        }

        stage('Build and Run') {
            steps {
                // This is the main command!
                // It reads your docker-compose.yml,
                // BUILDS the images, and starts them
                // We use -f just to be explicit
                sh 'docker-compose -f docker-compose.yml up -d --build'
            }
        }
    }
    
    post {
        always {
            // This cleans up the .env file so secrets
            // aren't left on the server workspace.
            sh 'rm server.env'
            
            // --- "Down Initially" Requirement ---
            // This command brings the environment DOWN after a build.
            // This is what your teacher wants.
            // For testing with your friend, you can comment out
            // the line below so the site stays UP.
            
            // sh 'sudo docker-compose -f docker-compose.yml down'
        }
    }
}