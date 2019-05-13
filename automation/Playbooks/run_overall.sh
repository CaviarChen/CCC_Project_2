#!/bin/bash

if [[ -z "${OS_PROJECT_ID}" ]]; then
  . ../openrc.sh;
fi

ansible-playbook --ask-become-pass nectar_creation.yaml;
wait
ansible-playbook --ask-vault-pass --ask-become-pass -i ../openstack_inventory.py overall.yaml;