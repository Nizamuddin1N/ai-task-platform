# AI Task Processing Platform

Full-stack MERN application with Python worker, Redis queue, Docker, Kubernetes, and Argo CD.

## Quick Start (Local)

### Prerequisites
- Docker + Docker Compose
- Node.js 18+
- Python 3.11+

### Run Locally
```bash
git clone https://github.com/Nizamuddin1N/ai-task-platform.git
cd ai-task-platform
cp backend/.env.example backend/.env
docker-compose up --build
```

App runs at: http://localhost:3000
Backend at: http://localhost:5000

## Tech Stack
- Frontend: React 18 + Vite + React Router
- Backend: Node.js + Express + Mongoose
- Worker: Python 3.11
- Database: MongoDB 6
- Queue: Redis 7
- Container: Docker (multi-stage builds, non-root users)
- Orchestration: Kubernetes (k3s compatible)
- GitOps: Argo CD
- CI/CD: GitHub Actions

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| POST | /api/tasks | Yes | Create task |
| GET | /api/tasks | Yes | List tasks |
| GET | /api/tasks/:id | Yes | Get task |

## Kubernetes Deployment
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/worker.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

## Argo CD Setup
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f argocd/application.yaml
```

## Supported Operations
- uppercase — converts input to UPPERCASE
- lowercase — converts input to lowercase
- reverse — reverses the string
- wordcount — counts words in the input

## Architecture
See ARCHITECTURE.md for full system design, scaling strategy, and production considerations.
