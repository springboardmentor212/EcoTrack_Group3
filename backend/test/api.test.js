const assert = require("node:assert/strict");
const test = require("node:test");

process.env.NODE_ENV = "test";
process.env.USE_IN_MEMORY_DB = "true";
process.env.MONGO_URI = "";
process.env.JWT_SECRET = "ecotrack-test-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.PORT = "0";

const { startServer, shutdown } = require("../server");

let baseUrl;
let token;
let userId;

const request = async (path, options = {}) => {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {}),
  };
  const fetchOptions = { ...options };
  delete fetchOptions.token;
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...fetchOptions,
    headers,
  });
  const body = await response.json();
  return { response, body };
};

test.before(async () => {
  const started = await startServer();
  const address = started.server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await shutdown();
});

test("health and root endpoints report a running API", async () => {
  const root = await request("/");
  assert.equal(root.response.status, 200);
  assert.equal(root.body.message, "EcoTrack Backend is running");

  const health = await request("/api/health");
  assert.equal(health.response.status, 200);
  assert.equal(health.body.success, true);
  assert.equal(health.body.database, "connected");
});

test("registration and login issue a usable JWT", async () => {
  const registration = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    },
  });
  assert.equal(registration.response.status, 201);
  assert.equal(registration.body.success, true);
  assert.ok(registration.body.token);
  assert.equal(registration.body.user.email, "test@example.com");
  token = registration.body.token;
  userId = registration.body.user._id;

  const duplicate = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    },
  });
  assert.equal(duplicate.response.status, 400);

  const login = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: "TEST@example.com",
      password: "password123",
    },
  });
  assert.equal(login.response.status, 200);
  assert.ok(login.body.token);
  token = login.body.token;
});

test("protected endpoints reject missing tokens and accept a valid token", async () => {
  const missing = await request("/api/auth/profile");
  assert.equal(missing.response.status, 401);

  const profile = await request("/api/auth/profile", { token });
  assert.equal(profile.response.status, 200);
  assert.equal(profile.body.user._id, userId);
});

test("forgot-password creates a reset token and reset-password rotates the password", async () => {
  const forgot = await request("/api/auth/forgot-password", {
    method: "POST",
    body: { email: "test@example.com" },
  });
  assert.equal(forgot.response.status, 200);
  assert.ok(forgot.body.resetToken);

  const reset = await request("/api/auth/reset-password", {
    method: "POST",
    body: {
      token: forgot.body.resetToken,
      password: "new-password",
    },
  });
  assert.equal(reset.response.status, 200);

  const oldLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "test@example.com", password: "password123" },
  });
  assert.equal(oldLogin.response.status, 400);

  const newLogin = await request("/api/auth/login", {
    method: "POST",
    body: { email: "test@example.com", password: "new-password" },
  });
  assert.equal(newLogin.response.status, 200);
  token = newLogin.body.token;
});

test("activity API validates, stores, lists, and deletes a record", async () => {
  const invalid = await request("/api/activities", {
    method: "POST",
    token,
    body: {
      type: "Walking",
      duration: "not-a-number",
      calories: 100,
      date: new Date().toISOString(),
    },
  });
  assert.equal(invalid.response.status, 400);

  const created = await request("/api/activities", {
    method: "POST",
    token,
    body: {
      type: "Walking",
      icon: "🚶",
      duration: 30,
      distance: 2.5,
      calories: 150,
      date: new Date().toISOString(),
    },
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.data.userId, userId);

  const listed = await request("/api/activities", { token });
  assert.equal(listed.response.status, 200);
  assert.equal(listed.body.count, 1);

  const deleted = await request(`/api/activities/${created.body.data._id}`, {
    method: "DELETE",
    token,
  });
  assert.equal(deleted.response.status, 200);
});

test("carbon, goal, challenge, and dashboard APIs persist user-scoped data", async () => {
  const carbon = await request("/api/carbon-records", {
    method: "POST",
    token,
    body: {
      category: "Transportation",
      icon: "🚗",
      amount: 10,
      emission: 2.1,
      date: new Date().toISOString(),
    },
  });
  assert.equal(carbon.response.status, 201);

  const goal = await request("/api/goals", {
    method: "POST",
    token,
    body: {
      title: "Reduce commuting emissions",
      target: "20%",
      deadline: "2026-12-31",
      progress: 25,
    },
  });
  assert.equal(goal.response.status, 201);

  const challenge = await request("/api/challenges", {
    method: "POST",
    token,
    body: {
      title: "Walk daily",
      description: "Walk every day for one week",
      type: "days",
      target: 7,
      unit: "days",
      points: 50,
    },
  });
  assert.equal(challenge.response.status, 201);
  const challengeId = challenge.body.data._id;

  const firstCompletion = await request(`/api/challenges/${challengeId}`, {
    method: "PUT",
    token,
    body: { progress: 7, completed: true },
  });
  assert.equal(firstCompletion.response.status, 200);
  assert.equal(firstCompletion.body.data.completed, true);

  const repeatedCompletion = await request(`/api/challenges/${challengeId}`, {
    method: "PUT",
    token,
    body: { completed: true },
  });
  assert.equal(repeatedCompletion.response.status, 200);

  const dashboard = await request("/api/dashboard/stats", { token });
  assert.equal(dashboard.response.status, 200);
  assert.equal(dashboard.body.data.activityCount, 0);
  assert.equal(dashboard.body.data.totalCarbon, 2.1);
  assert.equal(dashboard.body.data.totalGoals, 1);
  assert.equal(dashboard.body.data.completedChallenges, 1);
  assert.equal(dashboard.body.data.totalPoints, 50);

  const uncompleted = await request(`/api/challenges/${challengeId}`, {
    method: "PUT",
    token,
    body: { completed: false },
  });
  assert.equal(uncompleted.response.status, 200);

  const dashboardAfterUncomplete = await request("/api/dashboard/stats", {
    token,
  });
  assert.equal(dashboardAfterUncomplete.body.data.completedChallenges, 0);
  assert.equal(dashboardAfterUncomplete.body.data.totalPoints, 0);
});

test("malformed resource identifiers return client errors", async () => {
  const result = await request("/api/goals/not-an-id", {
    method: "DELETE",
    token,
  });
  assert.equal(result.response.status, 400);
});


test("milestone 2 carbon engine, search/filter, update, and dashboard analytics work", async () => {
  const categories = await request("/api/carbon-records/categories", { token });
  assert.equal(categories.response.status, 200);
  assert.equal(categories.body.success, true);
  assert.ok(categories.body.data.some((item) => item.name === "Transportation"));

  const calculated = await request("/api/carbon-records", {
    method: "POST",
    token,
    body: {
      category: "Electricity Usage",
      amount: 100,
      date: "2026-10-01",
    },
  });
  assert.equal(calculated.response.status, 201);
  assert.equal(calculated.body.data.emission, 82);
  assert.equal(calculated.body.calculation.emission, 82);

  const filtered = await request(
    "/api/carbon-records?category=Electricity%20Usage&startDate=2026-10-01&endDate=2026-10-31",
    { token }
  );
  assert.equal(filtered.response.status, 200);
  assert.equal(filtered.body.total, 1);

  const updated = await request(
    `/api/carbon-records/${calculated.body.data._id}`,
    {
      method: "PUT",
      token,
      body: {
        category: "Transportation",
        amount: 20,
        date: "2026-10-02",
      },
    }
  );
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.emission, 4.2);

  const search = await request("/api/carbon-records?search=transport", {
    token,
  });
  assert.equal(search.response.status, 200);
  assert.ok(search.body.total >= 1);

  const dashboard = await request("/api/dashboard/stats?period=month", {
    token,
  });
  assert.equal(dashboard.response.status, 200);
  assert.equal(dashboard.body.data.period, "month");
  assert.ok(Array.isArray(dashboard.body.data.categoryBreakdown));
  assert.ok(Array.isArray(dashboard.body.data.trend));
  assert.ok(dashboard.body.data.sustainability);
});


test("milestone 2 goal search and status filters work", async () => {
  const completed = await request("/api/goals", {
    method: "POST",
    token,
    body: {
      title: "Completed recycling goal",
      target: "10 kg",
      deadline: "2026-10-01",
      progress: 100,
    },
  });
  assert.equal(completed.response.status, 201);

  const active = await request("/api/goals", {
    method: "POST",
    token,
    body: {
      title: "Active transport goal",
      target: "50 km",
      deadline: "2026-12-31",
      progress: 25,
    },
  });
  assert.equal(active.response.status, 201);

  const activeGoals = await request("/api/goals?status=active", { token });
  assert.equal(activeGoals.response.status, 200);
  assert.ok(activeGoals.body.data.every((goal) => goal.completed === false));

  const completedGoals = await request("/api/goals?status=completed", {
    token,
  });
  assert.equal(completedGoals.response.status, 200);
  assert.ok(completedGoals.body.data.some((goal) => goal.title.includes("Completed")));

  const searched = await request("/api/goals?search=transport", { token });
  assert.equal(searched.response.status, 200);
  assert.ok(searched.body.data.some((goal) => goal.title.includes("transport")));
});
