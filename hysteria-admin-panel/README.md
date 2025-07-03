# Hysteria VPN Admin Panel

This project provides a simple admin panel to manage Hysteria VPN clients.

## Structure
- `frontend/` – React application using Vite and Tailwind.
- `backend/` – Express REST API with PostgreSQL.
- `docker-compose.yml` – containers for frontend, backend and database.
- `setup.sh` – installer script.

## Quick Start
1. Copy `.env.example` to `.env` and set your domain if needed.
2. Run `./setup.sh` or `docker compose up -d --build`.
3. Access the panel at `http://<your-ip>:3000`.
