#!/bin/bash

portList=('4200' '5001')

# Check for open ports
for port in "${portList[@]}"; do
  lsof -i :$port
done

# compile list of open ports that match and kill them
openPorts=()
for port in "${portList[@]}"; do
  if lsof -i :$port; then
    openPorts+=($port)
  fi
done

if [ ${#openPorts[@]} -gt 0 ]; then
  echo "Killing processes on ports: ${openPorts[@]}"
  for port in "${openPorts[@]}"; do
    lsof -ti :$port | xargs kill -9
  done
else
  echo "No matching open ports found."
fi
