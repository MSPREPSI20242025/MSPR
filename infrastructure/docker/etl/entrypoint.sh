#!/bin/bash

# ETL Service Entrypoint Script
echo "Starting ETL service..."

# Set up cron schedule from environment variable if provided
if [ -n "$ETL_SCHEDULE" ]; then
    echo "Setting custom ETL schedule: $ETL_SCHEDULE"
    echo "$ETL_SCHEDULE etl_user cd /app && python main.py >> logs/etl.log 2>&1" > /etc/cron.d/etl-cron
    echo "* * * * * etl_user echo \"ETL cron is running\" >> logs/cron.log 2>&1" >> /etc/cron.d/etl-cron
    chmod 0644 /etc/cron.d/etl-cron
    crontab /etc/cron.d/etl-cron
fi

# Start cron service
service cron start

# Run initial ETL process
echo "Running initial ETL process..."
python main.py

# Keep the container running
echo "ETL service started successfully"
tail -f logs/etl.log logs/cron.log