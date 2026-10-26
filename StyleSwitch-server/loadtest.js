import autocannon from "autocannon";

const BASE = "http://localhost:5000";

console.log("🚀 StyleSwitch Load Test — 10 concurrent users, 15 seconds\n");

async function runTest(title, url, opts = {}) {
  return new Promise((resolve) => {
    const instance = autocannon(
      {
        url,
        connections: 10,      // 10 concurrent users
        duration: 15,         // 15 seconds
        pipelining: 1,
        ...opts,
      },
      (err, result) => {
        if (err) {
          console.error(`❌  ${title} — error:`, err.message);
          return resolve(null);
        }
        const ok = result.non2xx === 0 && result.errors === 0;
        console.log(`\n${"─".repeat(60)}`);
        console.log(`${ok ? "✅" : "❌"}  ${title}`);
        console.log(`   URL         : ${url}`);
        console.log(`   Requests    : ${result.requests.total}`);
        console.log(`   Throughput  : ${result.throughput.average} bytes/s`);
        console.log(`   Latency avg : ${result.latency.average} ms`);
        console.log(`   Latency p99 : ${result.latency.p99} ms`);
        console.log(`   2xx         : ${result["2xx"]}`);
        console.log(`   Non-2xx     : ${result.non2xx}`);
        console.log(`   Errors      : ${result.errors}`);
        resolve(result);
      }
    );
    autocannon.track(instance, { renderProgressBar: true });
  });
}

// Run tests sequentially so output stays readable
(async () => {
  await runTest("GET /api/cloth (browse all)", `${BASE}/api/cloth`);
  await runTest("GET /api/cloth/search?q=dress", `${BASE}/api/cloth/search?q=dress`);
  await runTest("GET /api/auth/me (unauthenticated — should 401)", `${BASE}/api/auth/me`);

  console.log(`\n${"═".repeat(60)}`);
  console.log("Load test complete.");
  console.log("Criteria: Non-2xx=0 and Errors=0 for public routes = ✅ PASS");
  console.log("(401 on /api/auth/me is expected for unauthenticated load test)\n");
})();
