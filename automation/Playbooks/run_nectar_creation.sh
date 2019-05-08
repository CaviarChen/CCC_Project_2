#!/bin/bash

if [[ -z "${OS_PROJECT_ID}" ]]; then
  . ../openrc.sh;
fi
ansible-playbook -vvv --ask-become-pass nectar_creation.yaml;
