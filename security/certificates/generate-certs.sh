#!/bin/bash

# SSL/TLS Certificate Generation Script for MSPR
# This script generates self-signed certificates for development and testing

set -e

# Configuration
CERT_DIR="$(dirname "$0")"
COUNTRY="FR"
STATE="Île-de-France"
CITY="Paris"
ORGANIZATION="MSPR"
OU="IT Department"
DAYS_VALID=365

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
MSPR Certificate Generation Script

Usage: $0 [OPTIONS]

Options:
    -d, --domain DOMAIN        Domain name for the certificate
    -c, --cluster CLUSTER      Cluster name (us, france, switzerland)
    -e, --environment ENV      Environment (development, staging, production)
    -v, --validity DAYS        Certificate validity in days (default: 365)
    -h, --help                 Show this help message

Examples:
    $0 --domain mspr.example.com --cluster us --environment production
    $0 -d localhost -c france -e development

EOF
}

# Default values
DOMAIN=""
CLUSTER=""
ENVIRONMENT="development"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -c|--cluster)
            CLUSTER="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--validity)
            DAYS_VALID="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$DOMAIN" ]]; then
    log_error "Domain name is required. Use -d or --domain option."
    show_help
    exit 1
fi

if [[ -z "$CLUSTER" ]]; then
    log_error "Cluster name is required. Use -c or --cluster option."
    show_help
    exit 1
fi

if [[ ! "$CLUSTER" =~ ^(us|france|switzerland)$ ]]; then
    log_error "Invalid cluster name. Must be one of: us, france, switzerland"
    exit 1
fi

# Set cluster-specific configuration
case "$CLUSTER" in
    us)
        COUNTRY="US"
        STATE="California"
        CITY="San Francisco"
        ;;
    france)
        COUNTRY="FR"
        STATE="Île-de-France"
        CITY="Paris"
        ;;
    switzerland)
        COUNTRY="CH"
        STATE="Zurich"
        CITY="Zurich"
        ;;
esac

# Create directory structure
CLUSTER_CERT_DIR="$CERT_DIR/$CLUSTER/$ENVIRONMENT"
mkdir -p "$CLUSTER_CERT_DIR"

log_info "Generating certificates for cluster: $CLUSTER, environment: $ENVIRONMENT"
log_info "Domain: $DOMAIN"
log_info "Certificate directory: $CLUSTER_CERT_DIR"

# Generate private key
PRIVATE_KEY="$CLUSTER_CERT_DIR/private.key"
log_info "Generating private key..."
openssl genrsa -out "$PRIVATE_KEY" 4096
chmod 600 "$PRIVATE_KEY"
log_success "Private key generated: $PRIVATE_KEY"

# Create certificate configuration
CONFIG_FILE="$CLUSTER_CERT_DIR/cert.conf"
log_info "Creating certificate configuration..."

cat > "$CONFIG_FILE" << EOF
[req]
default_bits = 4096
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=$COUNTRY
ST=$STATE
L=$CITY
O=$ORGANIZATION
OU=$OU
CN=$DOMAIN

[v3_req]
basicConstraints = CA:FALSE
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
DNS.3 = localhost
DNS.4 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Add cluster-specific SANs
case "$CLUSTER" in
    us)
        cat >> "$CONFIG_FILE" << EOF
DNS.5 = us.mspr.example.com
DNS.6 = us-api.mspr.example.com
DNS.7 = us-staging.mspr.example.com
DNS.8 = us-staging-api.mspr.example.com
EOF
        ;;
    france)
        cat >> "$CONFIG_FILE" << EOF
DNS.5 = france.mspr.example.com
DNS.6 = france-api.mspr.example.com
DNS.7 = france-staging.mspr.example.com
DNS.8 = france-staging-api.mspr.example.com
EOF
        ;;
    switzerland)
        cat >> "$CONFIG_FILE" << EOF
DNS.5 = switzerland.mspr.example.com
DNS.6 = switzerland-api.mspr.example.com
DNS.7 = switzerland-staging.mspr.example.com
DNS.8 = switzerland-staging-api.mspr.example.com
EOF
        ;;
esac

log_success "Certificate configuration created: $CONFIG_FILE"

# Generate Certificate Signing Request (CSR)
CSR_FILE="$CLUSTER_CERT_DIR/cert.csr"
log_info "Generating Certificate Signing Request..."
openssl req -new -key "$PRIVATE_KEY" -out "$CSR_FILE" -config "$CONFIG_FILE"
log_success "CSR generated: $CSR_FILE"

# Generate self-signed certificate
CERT_FILE="$CLUSTER_CERT_DIR/cert.crt"
log_info "Generating self-signed certificate..."
openssl x509 -req -in "$CSR_FILE" -signkey "$PRIVATE_KEY" -out "$CERT_FILE" \
    -days "$DAYS_VALID" -extensions v3_req -extfile "$CONFIG_FILE"
log_success "Certificate generated: $CERT_FILE"

# Create certificate bundle
BUNDLE_FILE="$CLUSTER_CERT_DIR/fullchain.crt"
cp "$CERT_FILE" "$BUNDLE_FILE"
log_success "Certificate bundle created: $BUNDLE_FILE"

# Generate DH parameters for enhanced security
DH_PARAMS="$CLUSTER_CERT_DIR/dhparam.pem"
log_info "Generating DH parameters (this may take a while)..."
openssl dhparam -out "$DH_PARAMS" 2048
log_success "DH parameters generated: $DH_PARAMS"

# Create combined certificate and key file for some applications
COMBINED_FILE="$CLUSTER_CERT_DIR/combined.pem"
cat "$CERT_FILE" "$PRIVATE_KEY" > "$COMBINED_FILE"
chmod 600 "$COMBINED_FILE"
log_success "Combined certificate and key created: $COMBINED_FILE"

# Verify certificate
log_info "Verifying certificate..."
openssl x509 -in "$CERT_FILE" -text -noout > "$CLUSTER_CERT_DIR/cert_details.txt"
log_success "Certificate verification completed"

# Create certificate information file
INFO_FILE="$CLUSTER_CERT_DIR/cert_info.json"
cat > "$INFO_FILE" << EOF
{
  "cluster": "$CLUSTER",
  "environment": "$ENVIRONMENT",
  "domain": "$DOMAIN",
  "country": "$COUNTRY",
  "state": "$STATE",
  "city": "$CITY",
  "organization": "$ORGANIZATION",
  "validity_days": $DAYS_VALID,
  "generated_at": "$(date -Iseconds)",
  "expires_at": "$(date -d "+$DAYS_VALID days" -Iseconds)",
  "files": {
    "private_key": "private.key",
    "certificate": "cert.crt",
    "csr": "cert.csr",
    "config": "cert.conf",
    "fullchain": "fullchain.crt",
    "dhparam": "dhparam.pem",
    "combined": "combined.pem",
    "details": "cert_details.txt"
  },
  "usage": {
    "nginx": "cert.crt + private.key",
    "apache": "cert.crt + private.key",
    "docker": "combined.pem",
    "kubernetes": "cert.crt + private.key (as secrets)"
  }
}
EOF

log_success "Certificate information saved: $INFO_FILE"

# Display certificate details
log_info "Certificate Details:"
echo "  Subject: $(openssl x509 -in "$CERT_FILE" -noout -subject | cut -d' ' -f2-)"
echo "  Issuer: $(openssl x509 -in "$CERT_FILE" -noout -issuer | cut -d' ' -f2-)"
echo "  Valid from: $(openssl x509 -in "$CERT_FILE" -noout -startdate | cut -d= -f2)"
echo "  Valid until: $(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)"
echo "  Serial number: $(openssl x509 -in "$CERT_FILE" -noout -serial | cut -d= -f2)"
echo "  Fingerprint: $(openssl x509 -in "$CERT_FILE" -noout -fingerprint -sha256 | cut -d= -f2)"

# Display Subject Alternative Names
echo "  Subject Alternative Names:"
openssl x509 -in "$CERT_FILE" -noout -text | grep -A 1 "Subject Alternative Name" | tail -1 | sed 's/^[[:space:]]*/    /'

# Create deployment instructions
INSTRUCTIONS_FILE="$CLUSTER_CERT_DIR/deployment_instructions.md"
cat > "$INSTRUCTIONS_FILE" << EOF
# Certificate Deployment Instructions

## Generated Certificates
- **Cluster**: $CLUSTER
- **Environment**: $ENVIRONMENT
- **Domain**: $DOMAIN
- **Generated**: $(date)
- **Expires**: $(date -d "+$DAYS_VALID days")

## File Descriptions
- \`private.key\`: Private key (keep secure)
- \`cert.crt\`: Public certificate
- \`fullchain.crt\`: Full certificate chain
- \`combined.pem\`: Certificate and key combined
- \`dhparam.pem\`: Diffie-Hellman parameters

## Docker Deployment
\`\`\`bash
# Copy certificates to Docker context
cp $CLUSTER_CERT_DIR/cert.crt infrastructure/docker/nginx/ssl/
cp $CLUSTER_CERT_DIR/private.key infrastructure/docker/nginx/ssl/
cp $CLUSTER_CERT_DIR/dhparam.pem infrastructure/docker/nginx/ssl/
\`\`\`

## Kubernetes Deployment
\`\`\`bash
# Create TLS secret
kubectl create secret tls mspr-tls-$CLUSTER \\
  --cert=$CERT_FILE \\
  --key=$PRIVATE_KEY \\
  --namespace=mspr-$CLUSTER
\`\`\`

## Nginx Configuration
\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    ssl_certificate /etc/nginx/ssl/cert.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Additional SSL configuration...
}
\`\`\`

## Security Notes
- Keep private key secure and never commit to version control
- Rotate certificates before expiration
- Use proper file permissions (600 for private key)
- Monitor certificate expiration dates

## Renewal
To renew this certificate, run:
\`\`\`bash
$0 --domain $DOMAIN --cluster $CLUSTER --environment $ENVIRONMENT
\`\`\`
EOF

log_success "Deployment instructions created: $INSTRUCTIONS_FILE"

# Set proper permissions
chmod 600 "$PRIVATE_KEY" "$COMBINED_FILE"
chmod 644 "$CERT_FILE" "$BUNDLE_FILE" "$DH_PARAMS"

log_success "Certificate generation completed successfully!"
echo
echo "=== Certificate Summary ==="
echo "Cluster: $CLUSTER"
echo "Environment: $ENVIRONMENT"
echo "Domain: $DOMAIN"
echo "Certificate directory: $CLUSTER_CERT_DIR"
echo "Valid until: $(date -d "+$DAYS_VALID days")"
echo
echo "=== Next Steps ==="
echo "1. Deploy certificates to your infrastructure"
echo "2. Update configuration files with certificate paths"
echo "3. Test SSL/TLS configuration"
echo "4. Set up certificate renewal process"
echo
log_success "Certificate generation script completed!"