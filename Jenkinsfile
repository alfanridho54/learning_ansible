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
    stage('Syntax Check') {
      steps {
        sh 'ansible-playbook -i inventories/jenkins/hosts.yml playbooks/tutorial/01-installation-server.yml --syntax-check'
      }
    }
    stage('Deploy Outlets') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'ansible-lab-ssh-key', keyFileVariable: 'SSH_KEY')]) {
          sh 'ansible-playbook -i inventories/jenkins/hosts.yml playbooks/tutorial/01-installation-server.yml --private-key "$SSH_KEY"'
        }
      }
    }
  }
}
