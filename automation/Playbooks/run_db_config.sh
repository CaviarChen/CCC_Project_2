#!/bin/bash

if [[ -z "${OS_PROJECT_ID}" ]]; then
  . ../openrc.sh;
fi
ansible-playbook --ask-vault-pass -i ../openstack_inventory.py db_config.yaml;
