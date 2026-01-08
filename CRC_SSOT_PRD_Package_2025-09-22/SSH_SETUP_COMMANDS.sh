#!/bin/bash

# SSH SETUP COMMANDS FOR SERVER
# Run these commands ON THE SERVER at 100.112.67.23
# (Requires physical access or VNC connection)

echo "=== SSH Key Setup for EMR Database Server ==="
echo ""
echo "Step 1: Create SSH directory and set permissions"
echo "------------------------------------------------"
echo "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
echo ""

echo "Step 2: Add authorized key (copy this entire command):"
echo "--------------------------------------------------------"
echo "echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILpWk0mmbs03D/PjKvpaM4q3h+vUia8eQBZknqP0CwqY emr-database-kxd395@homelab' >> ~/.ssh/authorized_keys"
echo ""

echo "Step 3: Set proper permissions"
echo "--------------------------------"
echo "chmod 600 ~/.ssh/authorized_keys"
echo ""

echo "Step 4: Verify the key was added"
echo "----------------------------------"
echo "cat ~/.ssh/authorized_keys | grep 'emr-database-kxd395@homelab'"
echo ""

echo "=== After running these commands on the server ==="
echo "Return to your Mac and run: ./RUN_DATABASE_SETUP.sh"
echo ""
