# Qarar AI Engineering Review and Upgrade Report

Date: 2026-04-26

## Executive Summary

Qarar is an LLM-powered decision-autopsy product built as a Next.js application with Supabase persistence and Gemini inference. The core product direction is strong, but the original AI path needed production hardening around prompt injection, request validation, abuse controls, output safety, observability, reproducibility, and automated regression checks.

This pass implemented the most urgent controls directly in the codebase and left a roadmap for deeper MLOps and research-grade evaluation work.

## Changes Applied

- Added strict Zod validation for autopsy requests in `src/lib/api-validation.ts`.
- Added fixed-window AI route rate limiting in `src/lib/rate-limit.ts`.
- Hardened Gemini autopsy prompting with explicit untrusted-data delimiters, prompt/schema versioning, and safety instructions in `src/lib/gemini.ts`.
- Added Gemini timeout handling, retry scaffolding, structured error taxonomy, token/latency metadata, and parse-error classification.
- Added output safety checks for high-risk generated advice in `src/lib/llm-safety.ts`.
- Added structured inference telemetry via JSON logs in `src/lib/inference-telemetry.ts`.
- Updated `src/app/api/autopsy/analyze/route.ts` to enforce validation, rate limits, safety checks, request IDs, error taxonomy, and metadata persistence.
- Updated `src/app/api/patterns/generate/route.ts` with rate limits, timeout handling, prompt isolation, request IDs, and inference telemetry.
- Added Supabase metadata fields and migration in `supabase/migrations/003_autopsy_inference_metadata.sql`.
- Added CI workflow in `.github/workflows/ci.yml`.
- Added AI hardening and golden-evaluation scaffold tests in `tests/ai-hardening.test.ts` and `tests/autopsy-golden-cases.test.ts`.

## Remaining High-Priority Work

- Replace the in-memory rate limiter with Redis, Upstash, Supabase-backed counters, or another durable distributed limiter before multi-instance production scale.
- Run the new Supabase migration in the production database before deploying the updated autopsy insert path.
- Expand the golden evaluation set from 3 cases to at least 30-100 representative cases.
- Add a rubric scorer for LLM output quality, safety, calibration, and usefulness.
- Add dashboard/alerting for telemetry fields: latency, token cost, parse failures, timeouts, safety blocks, and provider errors.
- Add retention/redaction policy implementation for sensitive free-text user narratives.

## Advanced Roadmap

- Build a prompt/model registry with staged rollout and rollback.
- Add self-consistency or ensemble checks for uncertainty-aware recommendations.
- Introduce human review for high-risk outputs.
- Add prompt-injection and safety red-team suites.
- Add drift detection for user input patterns and model output semantics.
- Calibrate confidence/profile scoring against observed outcomes instead of relying only on heuristics.
