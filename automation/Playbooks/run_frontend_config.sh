#!/bin/bash

if [[ -z "${OS_PROJECT_ID}" ]]; then
  . ../openrc.sh;
fi

ansible-playbook --ask-vault-pass -i ../openstack_inventory.py frontend_config.yaml