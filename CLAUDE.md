# Task Manager API — Claude Code Context

## Stack
- Runtime: Node.js 22 LTS | Framework: Express 5.x
- Database: SQLite via Sequelize ORM
- Testing: Jest 29 + Supertest
- PROHIBITED: raw SQL — use Sequelize only

## Architecture — Layer Rules
- routes/     → HTTP only: parse req, call service, return res
- services/   → Business logic — no direct DB calls
- models/     → Sequelize model definitions — no logic
- middleware/ → Auth, error handling, validation
- Do NOT write business logic in route handlers
