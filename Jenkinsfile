pipeline {
  agent any
  stages {
    stage('Ping outlets') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'ansible-lab-ssh-key', keyFileVariable: 'SSH_KEY')]) {
          sh 'ansible outlets -i inventories/jenkins/hosts.yml -m ping --private-key "$SSH_KEY"'
        }
      }
    }
  }
}