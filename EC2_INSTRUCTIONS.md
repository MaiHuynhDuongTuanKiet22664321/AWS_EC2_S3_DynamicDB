# EC2 Deployment Guide

1.  **Launch EC2 Instance**: Use Amazon Linux 2023 or Ubuntu.
2.  **IAM Role**: Create a role with `AmazonDynamoDBFullAccess` and `AmazonS3FullAccess` and attach it to the instance.
3.  **Security Group**: Allow Inbound traffic on port 80 (HTTP), 443 (HTTPS), and 3000 (Custom TCP).
4.  **Connect to EC2**: SSH into your instance.
5.  **Install Node.js & Git**:
    ```bash
    # Amazon Linux 2023
    sudo yum update -y
    sudo yum install git -y
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
    ```
6.  **Clone Repository**:
    ```bash
    git clone https://github.com/MaiHuynhDuongTuanKiet22664321/AWS_EC2_S3_DynamicDB.git
    cd AWS_EC2_S3_DynamicDB
    ```
7.  **Install Dependencies**:
    ```bash
    npm install
    npm install pm2 -g
    ```
8.  **Setup Environment (Optional)**:
    -   You do NOT need `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in `.env` if using an IAM Role.
    -   Create `.env` only if you need to override `DYNAMODB_TABLE_NAME` or `S3_BUCKET_NAME`.
    ```bash
    nano .env
    # Paste:
    # AWS_REGION=us-east-1
    # DYNAMODB_TABLE_NAME=Products
    # S3_BUCKET_NAME=22664321
    ```
9.  **Start Application**:
    ```bash
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    ```
10. **Access**: Open your browser and go to `http://<EC2-PUBLIC-IP>:3000`.
