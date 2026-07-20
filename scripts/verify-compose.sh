#!/usr/bin/env bash

set -euo pipefail

readonly HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-180}"
readonly POLL_INTERVAL_SECONDS=2

info() {
    printf '[INFO] %s\n' "$*"
}

success() {
    printf '[OK] %s\n' "$*"
}

fail() {
    printf '[ERROR] %s\n' "$*" >&2
    exit 1
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

service_is_running() {
    docker compose ps --status running --services | grep -Fxq "$1"
}

wait_for_healthy_service() {
    local service="$1"
    local container_id
    local health_status
    local elapsed=0

    info "Waiting for ${service} to become healthy..."
    while (( elapsed < HEALTH_TIMEOUT_SECONDS )); do
        container_id="$(docker compose ps -q "$service")"
        if [[ -z "$container_id" ]]; then
            fail "The ${service} container does not exist. Start the stack with 'docker compose up -d'."
        fi

        if ! service_is_running "$service"; then
            docker compose logs --tail=50 "$service" >&2 || true
            fail "The ${service} container is not running."
        fi

        if ! health_status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$container_id")"; then
            fail "Could not inspect the health state of ${service}."
        fi
        if [[ "$health_status" == "healthy" ]]; then
            success "${service} is healthy."
            return
        fi

        sleep "$POLL_INTERVAL_SECONDS"
        (( elapsed += POLL_INTERVAL_SECONDS ))
    done

    docker compose logs --tail=50 "$service" >&2 || true
    fail "Timed out after ${HEALTH_TIMEOUT_SECONDS}s waiting for ${service} (last status: ${health_status:-unknown})."
}

published_port() {
    local service="$1"
    local container_port="$2"
    local port

    port="$(docker compose port "$service" "$container_port" | awk -F: 'NR == 1 { print $NF }')"
    [[ -n "$port" ]] || fail "Could not determine the published port for ${service}:${container_port}."
    printf '%s' "$port"
}

check_url() {
    local label="$1"
    local url="$2"

    info "Testing ${label}: ${url}"
    if command -v curl >/dev/null 2>&1; then
        curl --fail --silent --show-error --max-time 10 "$url" >/dev/null || fail "${label} request failed: ${url}"
    elif command -v wget >/dev/null 2>&1; then
        wget -q -T 10 -O /dev/null "$url" || fail "${label} request failed: ${url}"
    else
        fail "Either curl or wget is required for HTTP verification."
    fi
    success "${label} responded successfully."
}

require_command docker
require_command grep
require_command awk

docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is not available."

info "Validating the resolved Compose configuration..."
docker compose config --quiet || fail "Compose configuration validation failed. Check .env and docker-compose.yml."
success "Compose configuration is valid."

for service in mongo backend frontend; do
    service_is_running "$service" || fail "The ${service} container is not running. Start the stack with 'docker compose up -d'."
done
success "mongo, backend, and frontend containers are running."

for service in mongo backend frontend; do
    wait_for_healthy_service "$service"
done

frontend_port="$(published_port frontend 8080)"
backend_port="$(published_port backend 5000)"

check_url "frontend /health" "http://127.0.0.1:${frontend_port}/health"
check_url "backend /health" "http://127.0.0.1:${backend_port}/health"
check_url "backend /products" "http://127.0.0.1:${backend_port}/products"

info "Testing frontend-to-backend access over ecommerce_network..."
docker compose exec -T frontend wget -q -O /dev/null http://backend:5000/health || fail "Frontend could not reach http://backend:5000/health."
success "Frontend can reach backend by its service name."

info "Checking the named Docker network and MongoDB volume..."
docker network inspect ecommerce_network >/dev/null || fail "Docker network ecommerce_network does not exist."
docker volume inspect ecommerce_mongo_data >/dev/null || fail "Docker volume ecommerce_mongo_data does not exist."
success "ecommerce_network and ecommerce_mongo_data exist."

success "Docker Compose verification completed successfully."
