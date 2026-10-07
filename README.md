# Ugnay — Cooperative System

# RUN BACKEND
cd apps/backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8000
# RUN FRONTEND
cd apps/mobile
npx expo start

Multi-role cooperative management system.

## Structure
- `apps/backend` — FastAPI backend
- `apps/web-admin` — React admin dashboard
- `apps/mobile` — React Native (Expo) mobile app
- `face-service` — InsightFace microservice
- `ai-service` — Inventory prediction service
- `packages/` — Shared TypeScript packages
- `docs/` — Documentation

## Roles
Admin, Logistics, Production, Marketing, Microfinance, Savings#