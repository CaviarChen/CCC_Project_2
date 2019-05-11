#!/bin/bash

function harvester {
    docker build -t registry.gitlab.com/cepheidfov/ccc_project_2/harvester:latest ../harvester/
    docker push registry.gitlab.com/cepheidfov/ccc_project_2/harvester:latest
}

function importer {
    docker build -t registry.gitlab.com/cepheidfov/ccc_project_2/importer:latest ../importer
    docker push registry.gitlab.com/cepheidfov/ccc_project_2/importer:latest
}

function pre {
    docker build -t registry.gitlab.com/cepheidfov/ccc_project_2/preprocessor:latest ../preprocessor
    docker push registry.gitlab.com/cepheidfov/ccc_project_2/preprocessor:latest
}

printf "1) harvester\n2) importer\n3) pre-processor\ndefault) ALL\n"
read inpt

case $inpt in 
    "1")
        harvester
        ;;
    "2")
        importer
        ;;
    "3")
        pre
        ;;
    "")
        harvester
        importer
        pre
        ;;
esac