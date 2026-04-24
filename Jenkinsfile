pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = "your-dockerhub-user"
        APP_NAME = "dayoff"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Build & Test') {
            steps {
                dir('backend') {
                    sh 'mvn clean verify'
                }
            }
            post {
                success {
                    junit 'backend/target/surefire-reports/*.xml'
                    jacoco execPattern: 'backend/target/jacoco.exec'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build -- --configuration production'
                }
            }
        }

        stage('Docker Build & Push') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-credentials') {
                        def backendImage = docker.build("${DOCKER_HUB_USER}/${APP_NAME}-backend:${BUILD_NUMBER}", "./backend")
                        backendImage.push()
                        backendImage.push("latest")

                        def frontendImage = docker.build("${DOCKER_HUB_USER}/${APP_NAME}-frontend:${BUILD_NUMBER}", "./frontend")
                        frontendImage.push()
                        frontendImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                // Example deployment using SSH and Docker Compose
                sshagent(['production-ssh-key']) {
                    sh "ssh prod-user@prod-server 'cd /app && docker-compose pull && docker-compose up -d'"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
