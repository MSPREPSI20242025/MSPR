-- Initialize database for MSPR application
-- This script will be run when the PostgreSQL container starts for the first time

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create indexes for better performance on large datasets
-- These will be created by Prisma migrations, but we ensure they exist

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE mspr TO mspr_user;

-- Create additional users for different environments if needed
-- This will be handled by environment variables in production