# Task Manager API

A small CRUD REST API for managing tasks, built with Express 5 and Sequelize (SQLite).

## Why I built this

I wanted hands-on practice with a layered API architecture (routes → services →
models) and writing a real test suite on top of it — unit tests with mocked
dependencies, integration tests against an in-memory database, and edge-case
tests for validation behavior.

## What it does

- CRUD endpoints for tasks (`/api/tasks`)
- Filter tasks by `status` and `priority`
- Centralized error handling that distinguishes validation errors (400) from
  unexpected errors (500)

## Tech Stack

Node.js, Express 5, Sequelize (SQLite), Jest 30 + Supertest

## Running it

```bash
npm install
npm start    # server on http://localhost:3000
npm test     # full test suite + coverage report
```

## What I learned

- How Sequelize validators actually behave vs. how I expected — e.g. `ENUM`
  fields aren't enforced on `create()` without an explicit `isIn` validator
- Structuring a Jest suite into unit/integration/edge layers, and leaving real
  gaps as `it.todo()` rather than writing shallow tests just to make the
  coverage report look complete
- Closing the remaining coverage gaps by adding tests for the error-handling
  middleware and the routes' failure paths — checking that the right status
  codes come back when something goes wrong — and adding a small
  coverage-average summary to `npm test`
