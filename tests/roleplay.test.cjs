const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loader(options = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, {
      exports, process, console: options.fetch ? { ...console, error: () => {}, warn: () => {} } : console,
      URL, Request, Response, AbortSignal, Error, SyntaxError,
      fetch: options.fetch ?? fetch,
      require: (id) => {
        if (id === '@/lib/server/streamAuth' && options.authenticate) return { verifyClerkRequest: options.authenticate };
        if (id === '@react-native-async-storage/async-storage') return options.storage;
        return id.startsWith('@/') ? load(`${id.slice(2)}.ts`) : require(id);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}

async function main() {
  const reply = { text: 'A coffee! Would you like a snack?', translation: 'Um café! Você gostaria de um lanche?', suggestions: ['A sandwich, please.'], correction: null };
  let calls = 0;
  const load = loader({
    authenticate: async (request) => request.headers.has('Authorization') ? 'test-user' : null,
    fetch: async () => {
      calls += 1;
      return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(reply) }] } }] });
    },
  });
  process.env.GOOGLE_API_KEY ||= 'test-only';
  const { POST } = load('app/api/roleplay+api.ts');
  const { ROLEPLAY_SCENARIOS } = load('data/roleplay-scenarios.ts');
  const request = (body, authenticated = true) => new Request('http://localhost/api/roleplay', {
    method: 'POST', headers: { ...(authenticated ? { Authorization: 'Bearer test' } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const messages = [{ role: 'assistant', text: ROLEPLAY_SCENARIOS[0].opening.text }, { role: 'user', text: 'I want a coffee.' }];
  assert.equal((await POST(request({ scenarioId: 'cafe', messages }, false))).status, 401);
  assert.equal((await POST(request({ scenarioId: 'unknown', messages }))).status, 400);
  assert.equal((await POST(request({ scenarioId: 'cafe', messages: [{ role: 'user', text: 'x' }, messages[1]] }))).status, 400);
  assert.equal((await POST(request({ scenarioId: 'cafe', messages: [messages[0], { role: 'user', text: 'x'.repeat(281) }] }))).status, 400);
  assert.equal(calls, 0, 'Rejected requests must not call Gemini');
  const valid = await POST(request({ scenarioId: 'cafe', messages }));
  assert.equal(valid.status, 200);
  assert.deepEqual(await valid.json(), reply);

  const { withoutStaleCorrection } = load('lib/roleplay.ts');
  const correctedReply = { ...reply, correction: { correctedText: 'I want a coffee, please.', explanation: 'Use want after I.' } };
  const history = [...messages, { role: 'assistant', text: correctedReply.text, reply: correctedReply }, { role: 'user', text: 'Thank you!' }];
  assert.equal(withoutStaleCorrection(correctedReply, history).correction, null, 'An older tip must not be attached to a different learner reply');
  assert.ok(withoutStaleCorrection(correctedReply, [...history.slice(0, -1), messages[1]]).correction, 'A repeated mistake can receive another correction');

  const invalidLoad = loader({ authenticate: async () => 'test', fetch: async () => Response.json({ candidates: [{ content: { parts: [{ text: '{bad-json' }] } }] }) });
  assert.equal((await invalidLoad('app/api/roleplay+api.ts').POST(request({ scenarioId: 'cafe', messages }))).status, 502);
  const busyLoad = loader({ authenticate: async () => 'test', fetch: async () => new Response('', { status: 429 }) });
  assert.match((await (await busyLoad('app/api/roleplay+api.ts').POST(request({ scenarioId: 'cafe', messages }))).json()).error, /busy/);

  const values = new Map();
  const storeLoad = loader({ storage: { getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => values.set(key, value), removeItem: async (key) => values.delete(key) } });
  const store = storeLoad('store/learningStore.ts').useLearningStore;
  const before = store.getState().xpToday;
  store.getState().completeRoleplay('cafe');
  store.getState().completeRoleplay('cafe');
  assert.equal(store.getState().xpToday, before + 20, 'A replay must not award XP twice');
  assert.equal(JSON.parse(values.get('learning-storage')).state.completedRoleplayIds[0], 'cafe');
  console.log('Passed: authorization, scenario validation, message limits, roles, AI output validation, provider errors, persisted completion, and one-time XP.');

  if (process.argv.includes('--live')) {
    const key = fs.readFileSync('.env.local', 'utf8').match(/^GOOGLE_API_KEY\s*=\s*(.+)$/m)?.[1].trim().replace(/^['"]|['"]$/g, '');
    if (!key) throw new Error('GOOGLE_API_KEY is not configured');
    process.env.GOOGLE_API_KEY = key;
    const liveLoad = loader();
    const output = await liveLoad('lib/server/roleplay.ts').generateRoleplayReply(ROLEPLAY_SCENARIOS[0], [messages[0], { role: 'user', text: 'I wants a coffee please.' }]);
    assert.ok(liveLoad('lib/roleplay.ts').isRoleplayReply(output));
    assert.ok(output.correction, 'The deliberately incorrect English should receive a correction');
    console.log('Live Gemini reply:', JSON.stringify(output));
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
