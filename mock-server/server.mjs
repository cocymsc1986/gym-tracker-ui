import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { snapshot, QA_USER_ID } from "./fixtures.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || "8080", 10);
const STATIC_ROOT = path.resolve(
  __dirname,
  process.env.STATIC_ROOT || "../build/client"
);
const ALLOW_TEST_ENDPOINTS = process.env.ALLOW_TEST_ENDPOINTS !== "false";

const state = snapshot();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

const b64url = (s) => Buffer.from(s).toString("base64url");

function mintToken(username) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "none", typ: "JWT" };
  const payload = {
    sub: username,
    username,
    email: `${username}@example.com`,
    iat: now,
    exp: now + 60 * 60,
    iss: "mock://gym-tracker",
    client_id: "mock-client",
    token_use: "access",
  };
  return `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}.`;
}

function tokenResponse(username) {
  return {
    access_token: mintToken(username),
    refresh_token: mintToken(username),
    expires_in: 3600,
  };
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function noContent(res) {
  res.writeHead(204);
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function match(pattern, pathname) {
  const p = pattern.split("/").filter(Boolean);
  const a = pathname.split("/").filter(Boolean);
  if (p.length !== a.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) {
      params[p[i].slice(1)] = decodeURIComponent(a[i]);
    } else if (p[i] !== a[i]) {
      return null;
    }
  }
  return params;
}

function getWorkouts(userId) {
  if (!state.workouts.has(userId)) state.workouts.set(userId, []);
  return state.workouts.get(userId);
}

function getExercises(userId) {
  if (!state.exercises.has(userId)) state.exercises.set(userId, []);
  return state.exercises.get(userId);
}

const routes = [
  ["POST", "/auth/signin", async (_req, res) => {
    json(res, 200, tokenResponse(QA_USER_ID));
  }],
  ["POST", "/auth/signup", async (_req, res) => {
    json(res, 201, { message: "Signup successful. Confirmation code: 000000" });
  }],
  ["POST", "/auth/confirm", async (_req, res) => {
    json(res, 200, { message: "Confirmed" });
  }],
  ["POST", "/auth/reset", async (_req, res) => {
    json(res, 200, { message: "Reset email sent" });
  }],
  ["POST", "/auth/reset/confirm", async (_req, res) => {
    json(res, 200, { message: "Password reset successful" });
  }],

  ["GET", "/workouts/:userId", async (_req, res, p) => {
    json(res, 200, getWorkouts(p.userId));
  }],
  ["GET", "/workouts/:userId/:workoutId", async (_req, res, p) => {
    const wid = parseInt(p.workoutId, 10);
    const w = getWorkouts(p.userId).find((x) => x.workoutId === wid);
    if (!w) return json(res, 404, { error: "Workout not found" });
    json(res, 200, w);
  }],
  ["POST", "/workouts/:userId", async (req, res, p) => {
    const body = await readBody(req);
    const workoutId = ++state.nextWorkoutId;
    getWorkouts(p.userId).push({
      workoutId,
      name: body.name || "Untitled",
      date: body.date || new Date().toISOString().slice(0, 10),
      exercises: [],
    });
    json(res, 201, { workoutId });
  }],
  ["DELETE", "/workouts/:userId/:workoutId", async (_req, res, p) => {
    const wid = parseInt(p.workoutId, 10);
    const list = getWorkouts(p.userId);
    const idx = list.findIndex((x) => x.workoutId === wid);
    if (idx >= 0) list.splice(idx, 1);
    noContent(res);
  }],
  ["POST", "/workouts/:userId/:workoutId/exercises/:exerciseId", async (_req, res, p) => {
    const wid = parseInt(p.workoutId, 10);
    const w = getWorkouts(p.userId).find((x) => x.workoutId === wid);
    if (!w) return json(res, 404, { error: "Workout not found" });
    if (!w.exercises.includes(p.exerciseId)) w.exercises.push(p.exerciseId);
    json(res, 201, { workoutId: wid, exerciseId: p.exerciseId });
  }],
  ["DELETE", "/workouts/:userId/:workoutId/exercises/:exerciseId", async (_req, res, p) => {
    const wid = parseInt(p.workoutId, 10);
    const w = getWorkouts(p.userId).find((x) => x.workoutId === wid);
    if (w) w.exercises = w.exercises.filter((id) => id !== p.exerciseId);
    noContent(res);
  }],

  ["GET", "/exercises/:userId", async (_req, res, p) => {
    json(res, 200, getExercises(p.userId));
  }],
  ["POST", "/exercises/:userId", async (req, res, p) => {
    const body = await readBody(req);
    if (!body.exerciseId) return json(res, 400, { error: "exerciseId required" });
    const list = getExercises(p.userId);
    const idx = list.findIndex((e) => e.exerciseId === body.exerciseId);
    if (idx >= 0) list[idx] = body;
    else list.push(body);
    json(res, 201, body);
  }],
  ["PUT", "/exercises/:userId/:exerciseId", async (req, res, p) => {
    const body = await readBody(req);
    const list = getExercises(p.userId);
    const idx = list.findIndex((e) => e.exerciseId === p.exerciseId);
    if (idx < 0) return json(res, 404, { error: "Exercise not found" });
    list[idx] = { ...list[idx], ...body, exerciseId: p.exerciseId };
    json(res, 200, list[idx]);
  }],
  ["DELETE", "/exercises/:userId/:exerciseId", async (_req, res, p) => {
    const list = getExercises(p.userId);
    const idx = list.findIndex((e) => e.exerciseId === p.exerciseId);
    if (idx >= 0) list.splice(idx, 1);
    for (const workouts of state.workouts.values()) {
      for (const w of workouts) {
        w.exercises = w.exercises.filter((id) => id !== p.exerciseId);
      }
    }
    noContent(res);
  }],

  ["POST", "/__test__/reset", async (_req, res) => {
    if (!ALLOW_TEST_ENDPOINTS) return json(res, 404, { error: "Not found" });
    const fresh = snapshot();
    state.workouts = fresh.workouts;
    state.exercises = fresh.exercises;
    state.nextWorkoutId = fresh.nextWorkoutId;
    json(res, 200, { ok: true });
  }],
  ["GET", "/__test__/state", async (_req, res) => {
    if (!ALLOW_TEST_ENDPOINTS) return json(res, 404, { error: "Not found" });
    json(res, 200, {
      nextWorkoutId: state.nextWorkoutId,
      workouts: Object.fromEntries(state.workouts),
      exercises: Object.fromEntries(state.exercises),
    });
  }],
  ["GET", "/__test__/token", async (_req, res) => {
    if (!ALLOW_TEST_ENDPOINTS) return json(res, 404, { error: "Not found" });
    json(res, 200, tokenResponse(QA_USER_ID));
  }],
];

async function handleApi(req, res, pathname) {
  for (const [method, pattern, handler] of routes) {
    if (method !== req.method) continue;
    const params = match(pattern, pathname);
    if (params) {
      try {
        await handler(req, res, params);
      } catch (e) {
        console.error("[mock-server] handler error:", e);
        if (!res.headersSent) json(res, 500, { error: "Internal error" });
      }
      return true;
    }
  }
  return false;
}

async function serveStatic(_req, res, pathname) {
  const safe = path.posix.normalize(pathname).replace(/^\/+/, "");
  let filePath = path.join(STATIC_ROOT, safe || "index.html");
  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      await fs.promises.stat(filePath);
    }
  } catch {
    filePath = path.join(STATIC_ROOT, "index.html");
    try {
      await fs.promises.stat(filePath);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(filePath).pipe(res);
}

const API_PREFIXES = ["/auth/", "/workouts/", "/exercises/", "/__test__/"];

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    res.writeHead(204).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const handled = await handleApi(req, res, pathname);
    if (!handled) json(res, 404, { error: "Not found" });
    return;
  }

  await serveStatic(req, res, pathname);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[mock-server] listening on http://0.0.0.0:${PORT}`);
  console.log(`[mock-server] serving SPA from ${STATIC_ROOT}`);
  console.log(`[mock-server] test endpoints: ${ALLOW_TEST_ENDPOINTS ? "ENABLED" : "disabled"}`);
});
