pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 10, unit: 'MINUTES')
    }

    environment {
        // 1. Dein Projektname
        PROJECT_NAME       = "speed-typer"
        TARGET_DIR         = "/var/jenkins_home/projects/${PROJECT_NAME}/${BRANCH_NAME}"
        SONAR_SCANNER_OPTS = "-Xmx512m"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // 2. Build-Stage entfernt, da reines JS/HTML/CSS nicht "gebaut" werden muss!

        stage('SonarQube Analysis') {
            when {
                branch 'develop'
            }
            steps {
                sh """
                    echo "Starting SonarQube analysis of $PROJECT_NAME"
                """
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.projectKey=${PROJECT_NAME} \
                          -Dsonar.branch.name=${BRANCH_NAME}
                        """
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                anyOf {
                    branch 'main'    // 3. WICHTIG: Dein Branch heißt main, nicht master!
                    branch 'develop'
                }
            }
            steps {
                sh '''
                    echo "Deploying frontend to $TARGET_DIR"

                    mkdir -p "$TARGET_DIR"
                    rm -rf "$TARGET_DIR"/*

                    # 4. Kopiert genau deine Dateien ins Zielverzeichnis
                    cp index.html style.css script.js logic.js "$TARGET_DIR"/
                '''
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}
