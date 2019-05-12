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

function go_backend {
    docker build -t registry.gitlab.com/cepheidfov/ccc_project_2/go_backend:latest ../go_backend
    docker push registry.gitlab.com/cepheidfov/ccc_project_2/go_backend:latest
}

printf "1) harvester\n2) importer\n3) pre-processor\n4) go-backend\ndefault) ALL\n"
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
    "4")
        go_backend
        ;;
    "")
        harvester
        importer
        pre
        ;;
esac