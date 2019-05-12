#!/bin/bash

if [[ -z "${OS_PROJECT_ID}" ]]; then
  . ../openrc.sh;
fi
ansible-playbook --ask-become-pass --ask-vault-pass -i ../openstack_inventory.py jobs_dockers.yaml --tags "rm";
