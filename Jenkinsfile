pipeline {
    agent {
        docker {
            image 'beevelop/ionic'
            args '-p 3000:3000'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install -g @ionic/cli'
                sh 'ionic build'
            }
        }
    }
}