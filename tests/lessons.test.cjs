const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

// Same lightweight TypeScript loader as the roleplay checks; no test dependency.
const cache = new Map();
const saved = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports, console, setTimeout, clearTimeout,
    require: (id) => {
      if (id === "@react-native-async-storage/async-storage") return {
        getItem: async (key) => saved.get(key) ?? null,
        setItem: async (key, value) => { saved.set(key, value); },
        removeItem: async (key) => { saved.delete(key); },
      };
      return id.startsWith("@/") ? load(`${id.slice(2)}.ts`) : require(id);
    },
  }, { filename: file });
  return exports;
}

const { LESSONS } = load("data/lessons.ts");
const { getCourseLessons, getPathStatus } = load("lib/learning-path.ts");
const { useLessonSessionStore: session } = load("store/lessonSessionStore.ts");
const { useLearningStore: learning } = load("store/learningStore.ts");

function solveCurrent() {
  const state = session.getState();
  const activity = state.activities[state.queue[state.position]];
  if (activity.type === "match") {
    for (const pair of activity.pairs) state.pair(pair.id, pair.id);
  } else if (activity.type === "translate") {
    const used = new Set();
    for (const word of activity.correctAnswer.split(/\s+/)) {
      const index = activity.words.findIndex((item, position) => item === word && !used.has(position));
      assert.ok(index >= 0, `Missing word tile in ${activity.id}`);
      used.add(index);
      state.toggleWord(index);
    }
  } else state.choose(activity.correctAnswer);
  session.getState().check();
  assert.equal(session.getState().feedback, "correct", activity.id);
  session.getState().advance();
}

async function main() {
  await learning.persist.rehydrate();
  for (const lesson of LESSONS) {
    assert.ok(lesson.activities.length >= 5, lesson.id);
    const ids = lesson.activities.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length, "Exercise ids must be unique");
    for (const activity of lesson.activities) {
      if (activity.type === "match") {
        assert.equal(new Set(activity.pairs.map((pair) => pair.translation)).size, activity.pairs.length, "Matching meanings must be unambiguous");
      }
      if (activity.type === "multiple-choice" || activity.type === "vocabulary") {
        assert.ok(activity.options.length >= 2, activity.id);
        assert.ok(activity.options.includes(activity.correctAnswer), activity.id);
      }
    }
    session.getState().start(lesson);
    session.getState().check();
    assert.equal(session.getState().attempts, 0, "Empty answers are not submitted");
    while (session.getState().status === "playing") solveCurrent();
    assert.equal(session.getState().status, "completed");
    assert.equal(session.getState().hearts, 5);
    assert.equal(session.getState().mastered.length, lesson.activities.length);
  }

  const lesson = LESSONS[2];
  session.getState().start(lesson);
  session.getState().choose("incorrect");
  session.getState().check();
  session.getState().check();
  assert.equal(session.getState().hearts, 4, "Double check must not consume another heart");
  assert.equal(session.getState().mastered.length, 0);
  session.getState().advance();
  while (session.getState().status === "playing") solveCurrent();
  assert.equal(session.getState().attempts, lesson.activities.length + 1, "Mistake is retried before completion");
  assert.equal(session.getState().status, "completed");

  session.getState().start(lesson);
  for (let index = 0; index < 5; index += 1) {
    session.getState().choose("incorrect");
    session.getState().check();
    session.getState().advance();
  }
  assert.equal(session.getState().status, "failed");
  assert.equal(session.getState().hearts, 0);
  session.getState().check();
  assert.equal(session.getState().attempts, 5);
  session.getState().start(lesson);
  assert.equal(session.getState().hearts, 5, "Restart refills hearts");
  assert.equal(session.getState().mastered.length, 0);

  learning.setState({ completedLessonIds: [], xpToday: 0, activeLessonId: LESSONS[0].id });
  const course = getCourseLessons("en");
  assert.equal(course.length, 50);
  assert.equal(getPathStatus(LESSONS[0].id, course, []), "current");
  assert.equal(getPathStatus(LESSONS[1].id, course, []), "locked");
  assert.equal(learning.getState().completeLesson("unknown"), 0);
  for (const item of LESSONS) {
    const xpBefore = learning.getState().xpToday;
    assert.equal(learning.getState().completeLesson(item.id), item.xpReward);
    assert.equal(learning.getState().completeLesson(item.id), 0, "Replay cannot award duplicate XP");
    assert.equal(learning.getState().xpToday, xpBefore + item.xpReward);
  }
  assert.equal(learning.getState().completedLessonIds.length, 50);
  await learning.persist.rehydrate();
  assert.equal(learning.getState().xpToday, 500, "XP survives rehydration");
  assert.equal(learning.getState().completedLessonIds.length, 50, "Completion survives rehydration");
  console.log("Lessons: all 50 courses solve; reviews, hearts, unlocks, XP and persistence pass.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
