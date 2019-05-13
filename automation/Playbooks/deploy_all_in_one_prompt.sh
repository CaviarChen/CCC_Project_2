#!/bin/bash

echo "Please select the job you want to run: "
echo "1) Create instances"
echo "2) Run common configuration"
echo "3) Configure CouchDB cluster"
echo "4) Configure Nginx"
echo "5) Run job dockers - Harvester, Importer, Preprocessor and Go-backend"
echo "6) Deploy frond end app"
echo "0) Run all jobs listed above"

read inpt

if [[ -z "${OS_PROJECT_ID}" ]]; then
  . ../openrc.sh;
fi

case $inpt in 
    "1")
        ansible-playbook --ask-become-pass nectar_creation.yaml;
        ;;
    "2")
        ansible-playbook -i ../openstack_inventory.py comm_config.yaml;
        ;;
    "3")
        ansible-playbook --ask-vault-pass -i ../openstack_inventory.py db_config.yaml;
        ;;
    "4")
        ansible-playbook -i ../openstack_inventory.py nginx_config.yaml
        ;;
    "5")
        ansible-playbook --ask-become-pass --ask-vault-pass -i ../openstack_inventory.py jobs_dockers.yaml;
        ;;
    "6")
        ansible-playbook --ask-vault-pass -i ../openstack_inventory.py frontend_config.yaml
        ;;
    "0")
        ansible-playbook --ask-become-pass nectar_creation.yaml;
        wait
        ansible-playbook --ask-vault-pass --ask-become-pass -i ../openstack_inventory.py overall.yaml;
        ;;
    *)
        echo "Invalid job number entered. Please enter '1', '2', etc."
        ;;
esac