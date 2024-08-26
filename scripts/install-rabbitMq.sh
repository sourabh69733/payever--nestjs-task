#!/bin/bash

# Function to install RabbitMQ on Ubuntu/Debian
install_ubuntu() {
    echo "Installing RabbitMQ on Ubuntu/Debian..."

    # Update the package list
    sudo apt-get update -y

    # Install Erlang
    sudo apt-get install -y erlang

    # Add RabbitMQ signing key
    sudo apt-get install -y curl
    curl -fsSL https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey | sudo tee /etc/apt/trusted.gpg.d/rabbitmq.asc

    # Add RabbitMQ repository
    echo "deb https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/rabbitmq.list

    # Update package list again
    sudo apt-get update -y

    # Install RabbitMQ
    sudo apt-get install -y rabbitmq-server

    # Enable and start RabbitMQ service
    sudo systemctl enable rabbitmq-server
    sudo systemctl start rabbitmq-server
}

# Function to install RabbitMQ on CentOS/RHEL
install_centos() {
    echo "Installing RabbitMQ on CentOS/RHEL..."

    # Install Erlang
    sudo yum install -y epel-release
    sudo yum install -y erlang

    # Add RabbitMQ repository
    sudo yum install -y curl
    sudo curl -fsSL https://packagecloud.io/rabbitmq/rabbitmq-server/rpm/gpgkey | sudo tee /etc/pki/rpm-gpg/RPM-GPG-KEY-rabbitmq
    sudo tee /etc/yum.repos.d/rabbitmq.repo <<EOF
[rabbitmq]
name=rabbitmq
baseurl=https://packagecloud.io/rabbitmq/rabbitmq-server/el/7/\$basearch
gpgcheck=1
gpgkey=https://packagecloud.io/rabbitmq/rabbitmq-server/rpm/gpgkey
enabled=1
EOF

    # Install RabbitMQ
    sudo yum install -y rabbitmq-server

    # Enable and start RabbitMQ service
    sudo systemctl enable rabbitmq-server
    sudo systemctl start rabbitmq-server
}

# Function to install RabbitMQ on macOS (ARM and Intel)
install_macos() {
    echo "Installing RabbitMQ on macOS (ARM and Intel)..."

    # Install Homebrew if not already installed
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found, installing it..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    # Install RabbitMQ using Homebrew
    brew update
    brew install rabbitmq

    # Start RabbitMQ service
    brew services start rabbitmq
}

# Function to install RabbitMQ on Windows (via WSL)
install_wsl() {
    echo "Installing RabbitMQ on Windows (WSL)..."

    # Detect WSL distribution
    if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        fi

        if [[ "$DISTRO" == "ubuntu" || "$DISTRO" == "debian" ]]; then
            install_ubuntu
        elif [[ "$DISTRO" == "centos" || "$DISTRO" == "rhel" ]]; then
            install_centos
        else
            echo "Unsupported WSL distribution."
            exit 1
        fi
    else
        echo "This script is intended to run within WSL."
        exit 1
    fi
}

# Detect OS and call the appropriate function
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if grep -qEi "(Microsoft|WSL)" /proc/version &> /dev/null ; then
        install_wsl
    else
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        fi

        if [[ "$DISTRO" == "ubuntu" || "$DISTRO" == "debian" ]]; then
            install_ubuntu
        elif [[ "$DISTRO" == "centos" || "$DISTRO" == "rhel" ]]; then
            install_centos
        else
            echo "Unsupported Linux distribution."
            exit 1
        fi
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    install_macos
else
    echo "Unsupported OS."
    exit 1
fi

# Check RabbitMQ status
echo "Checking RabbitMQ service status..."
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    sudo systemctl status rabbitmq-server
    sudo rabbitmqctl status
elif [[ "$OSTYPE" == "darwin"* ]]; then
    brew services list | grep rabbitmq
fi

echo "RabbitMQ installation and setup complete!"
