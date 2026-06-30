// Run: npx tsx tests/smoke.test.ts
const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

async function smokeTest() {
  const endpoints = [
    { path: "/health", method: "GET" },
    { path: "/api/state", method: "GET" },
    { path: "/api/gemini/mode", method: "GET" },
    { path: "/api/gemini/reorganize", method: "POST" },
    { path: "/api/gemini/analyze-workload", method: "POST" },
    { path: "/api/gemini/weekly-meeting", method: "POST" },
    { path: "/api/gamification/leaderboard", method: "GET" },
  ];

  let failures = 0;
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep.path}`, { method: ep.method });
      if (res.ok) {
        console.log(`✅ ${ep.method} ${ep.path} → ${res.status}`);
      } else {
        console.log(`❌ ${ep.method} ${ep.path} → ${res.status}`);
        failures++;
      }
    } catch (err) {
      console.log(`❌ ${ep.method} ${ep.path} → ${err}`);
      failures++;
    }
  }

  console.log(`\n${failures === 0 ? "✅ All smoke tests passed!" : `❌ ${failures} failure(s)`}`);
  process.exit(failures > 0 ? 1 : 0);
}

smokeTest();
