#!/bin/bash

if [[ -z "${OS_PROJECT_ID}" ]]; then
  . ../openrc.sh;
fi
ansible-playbook --ask-vault-pass --ask-become-pass build_dockers.yaml;
