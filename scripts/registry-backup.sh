#!/bin/sh
# Tar the registry volume so a dead PC does not take the packages with it.
set -eu
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M%S)
docker run --rm -v kbui-registry:/data -v "$PWD/backups":/out alpine \
  tar czf "/out/kbui-registry-$stamp.tgz" -C /data .
echo "backups/kbui-registry-$stamp.tgz"
