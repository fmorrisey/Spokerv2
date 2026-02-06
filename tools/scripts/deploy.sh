#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Options:
  -y, --yes                 Skip confirmation prompts (non-interactive)
  -c, --compose-file FILE   Docker compose file (default: deploy/docker-compose.prod.yml)
  -e, --env-file FILE       Env file to validate (default: deploy/.env.prod)
  -b, --branch-pattern PAT  Allowed branch pattern (default: release/)
    -n, --app-name NAME       Application short name (default: read from package.json name)
  -h, --help                Show this help message

Examples:
  ./tools/scripts/deploy.sh --yes
  ./tools/scripts/deploy.sh -c deploy/docker-compose.prod.yml
EOF
}

# Default argument values
AUTO_CONFIRM=false
COMPOSE_FILE="deploy/docker-compose.prod.yml"
ENV_FILE="deploy/.env.prod"
BRANCH_PATTERN="release/"
APP_NAME=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        -y|--yes)
            AUTO_CONFIRM=true
            shift
            ;;
        -c|--compose-file)
            COMPOSE_FILE="$2"; shift 2
            ;;
        -e|--env-file)
            ENV_FILE="$2"; shift 2
            ;;
        -b|--branch-pattern)
            BRANCH_PATTERN="$2"; shift 2
            ;;
        -n|--app-name)
            APP_NAME="$2"; shift 2
            ;;
        -h|--help)
            print_help; exit 0
            ;;
        *)
            echo "Unknown option: $1"; print_help; exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Spoker Production Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "deploy" ]; then
    echo -e "${RED}Error: Must run from project root${NC}"
    exit 1
fi

# Validate env file if provided
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Env file not found: $ENV_FILE${NC}"
    echo -e "Please create or provide the env file (e.g., cp deploy/.env.prod.example $ENV_FILE)"
    exit 1
fi

# Validate we're on a release/* branch or a tag on a release branch
validate_release_branch() {
    local current_branch=$(git branch --show-current)
    local current_tag=$(git describe --exact-match --tags 2>/dev/null || echo "")

    if [[ -n "$current_branch" ]]; then
        # On a branch - must match allowed pattern
        if [[ ! "$current_branch" =~ ^${BRANCH_PATTERN} ]]; then
            echo -e "${RED}Error: Deployments only allowed from branches matching ${BRANCH_PATTERN}*${NC}"
            echo -e "Current branch: ${YELLOW}$current_branch${NC}"
            echo -e "Please checkout an allowed branch (e.g., ${BRANCH_PATTERN}v1.0)"
            exit 1
        fi
    elif [[ -n "$current_tag" ]]; then
        # On a detached HEAD with tag - verify tag is on an allowed branch
        local tag_commit=$(git rev-parse HEAD)
        local release_branch=$(git branch -r --contains "$tag_commit" | grep -E "origin/${BRANCH_PATTERN}" | head -1 | xargs || true)
        if [[ -z "$release_branch" ]]; then
            echo -e "${RED}Error: Tag $current_tag is not on a branch matching ${BRANCH_PATTERN}*${NC}"
            echo -e "Deployments only allowed from matching branches"
            exit 1
        fi
    else
        echo -e "${RED}Error: Not on a branch or tag${NC}"
        echo -e "Deployments require a branch matching ${BRANCH_PATTERN}* or a tag on such a branch"
        exit 1
    fi
}

validate_release_branch

# Show current git status
echo -e "${YELLOW}Current Git Status:${NC}"
echo -e "Branch: ${GREEN}$(git branch --show-current)${NC}"
echo -e "Commit: ${GREEN}$(git rev-parse --short HEAD)${NC}"
echo -e "Latest commit message: ${GREEN}$(git log -1 --pretty=%B | head -n 1)${NC}"

# Check for git tag
CURRENT_TAG=$(git describe --exact-match --tags 2>/dev/null || echo "No tag")
if [ "$CURRENT_TAG" != "No tag" ]; then
    echo -e "Tag: ${GREEN}${CURRENT_TAG}${NC}"
else
    echo -e "Tag: ${YELLOW}${CURRENT_TAG}${NC}"
fi

echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    git status --short
    echo ""
fi

# Show what will be deployed
echo -e "${YELLOW}Deployment Configuration:${NC}"
echo -e "Compose file: ${BLUE}${COMPOSE_FILE}${NC}"
echo -e "Env file: ${BLUE}${ENV_FILE}${NC}"
echo -e "Command: ${BLUE}docker compose -f ${COMPOSE_FILE} up -d --build${NC}"
echo ""

# Ask for confirmation (skip if --yes flag passed)
echo -e "${YELLOW}This will:${NC}"
echo "  • Build fresh Docker images"
echo "  • Deploy to production on Rainier server"
echo "  • Restart all services (caddy, frontend, backend)"
echo ""

if [ "$AUTO_CONFIRM" = false ]; then
    read -p "Are you sure you want to deploy? (yes/no): " -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo -e "${RED}Deployment cancelled${NC}"
        exit 0
    fi
else
    echo -e "${BLUE}Auto-confirm enabled (--yes flag)${NC}"
fi

# Run the deployment
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

# Set BUILD_DATE for cache busting
export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if docker compose -f "${COMPOSE_FILE}" up -d --build; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Deployment Successful! ✓${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Verification steps:${NC}"
    echo "  • Check container status: docker ps"
    echo "  • View logs: docker compose -f ${COMPOSE_FILE} logs -f"
    echo "  • Visit: https://spoker-app.rainierserver.com"
    echo ""
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  Deployment Failed! ✗${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Check logs:${NC}"
    echo "  docker compose -f ${COMPOSE_FILE} logs"
    exit 1
fi
