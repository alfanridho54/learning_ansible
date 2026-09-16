FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssh-server sudo python3 ca-certificates curl \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /var/run/sshd /home/ansible/.ssh \
  && useradd -m -s /bin/bash ansible \
  && echo 'ansible ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/ansible \
  && chmod 440 /etc/sudoers.d/ansible \
  && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config \
  && sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config \
  && echo 'PermitRootLogin no' >> /etc/ssh/sshd_config

COPY ssh/authorized_keys /home/ansible/.ssh/authorized_keys
RUN chown -R ansible:ansible /home/ansible/.ssh \
  && chmod 700 /home/ansible/.ssh \
  && chmod 600 /home/ansible/.ssh/authorized_keys

EXPOSE 22 80
CMD ["/usr/sbin/sshd", "-D", "-e"]
