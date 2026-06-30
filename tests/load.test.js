// k6 load test for FamilyFlow
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },  // ramp up
    { duration: "1m", target: 10 },   // stay
    { duration: "30s", target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3001";

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/api/state`, null, { tags: { name: "state" } }],
    ["GET", `${BASE_URL}/api/gemini/mode`, null, { tags: { name: "mode" } }],
    ["GET", `${BASE_URL}/api/gamification/leaderboard`, null, { tags: { name: "leaderboard" } }],
  ]);

  check(responses[0], { "state status 200": (r) => r.status === 200 });
  check(responses[1], { "mode status 200": (r) => r.status === 200 });
  check(responses[2], { "leaderboard status 200": (r) => r.status === 200 });

  sleep(1);
}
