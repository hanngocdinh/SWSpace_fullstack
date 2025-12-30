#!/usr/bin/env node
/**
 * Simple SSE integration test for floor AI stream.
 * Usage: node scripts/test-sse.js 1
 * Optional env: TEST_BASE_URL (default http://localhost:5000)
 */
const EventSource = require('eventsource');
const axios = require('axios');

const floorArg = process.argv[2] || '1';
if(!/^\d+$/.test(floorArg)) {
  console.error('Floor argument must be a number (e.g. 1,2,3)');
  process.exit(1);
}

const base = process.env.TEST_BASE_URL || 'http://localhost:5000';
const floorPath = `floor${floorArg}`;
const streamUrl = `${base}/${floorPath}/ai/stream`;
const postUrl = `${base}/${floorPath}/ai/status`;

console.log(`[SSE TEST] Connecting to ${streamUrl}`);
const es = new EventSource(streamUrl);

let receivedPeopleEvents = [];
let helloReceived = false;
let postPhase = 0; // 0:not started, 1:posted first,2:second,3:third
let timeoutId;

function scheduleTimeout(label, ms=8000) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    console.error(`[FAIL] Timeout waiting for ${label}`);
    cleanup(1);
  }, ms);
}

async function postStatus(count) {
  const payload = {
    peopleCount: count,
    boxes: count ? [{ id: 1, x1: 0.10, y1: 0.10, x2: 0.20, y2: 0.40 }] : [],
    frame: null // we are only validating SSE structure here
  };
  try {
    await axios.post(postUrl, payload, { headers: { 'Content-Type': 'application/json' } });
    console.log(`[POST] peopleCount=${count}`);
  } catch (e) {
    console.error('[ERROR] POST failed', e.response?.status, e.message);
    cleanup(1);
  }
}

function nextPost() {
  postPhase++;
  if (postPhase === 1) {
    postStatus(1);
    scheduleTimeout('ai.people after peopleCount=1');
  } else if (postPhase === 2) {
    postStatus(2);
    scheduleTimeout('ai.people after peopleCount=2');
  } else if (postPhase === 3) {
    postStatus(0);
    scheduleTimeout('ai.people after peopleCount=0');
  } else if (postPhase > 3) {
    // done posting, will evaluate when events received
  }
}

function evaluate() {
  const counts = receivedPeopleEvents.map(e => e.peopleCount);
  const expected = [1,2,0];
  const pass = expected.every(c => counts.includes(c));
  if (pass) {
    console.log('[PASS] Received all expected peopleCount events:', counts);
    cleanup(0);
  } else {
    console.error('[FAIL] Missing events. Got counts:', counts, 'Expected contains:', expected);
    cleanup(1);
  }
}

function cleanup(code) {
  clearTimeout(timeoutId);
  es.close();
  process.exit(code);
}

es.addEventListener('ai.hello', ev => {
  helloReceived = true;
  console.log('[EVENT] ai.hello', ev.data);
  scheduleTimeout('first ai.people');
  // begin posting sequence after short delay to allow stream setup
  setTimeout(() => nextPost(), 500);
});

es.addEventListener('ai.people', ev => {
  try {
    const data = JSON.parse(ev.data);
    console.log(`[EVENT] ai.people count=${data.peopleCount} boxes=${Array.isArray(data.boxes)?data.boxes.length:'?'} frame=${data.frame? 'yes':'no'}`);
    receivedPeopleEvents.push(data);
    clearTimeout(timeoutId);
    // Trigger next post if still in sequence
    if (postPhase < 3) {
      setTimeout(() => nextPost(), 500);
    } else if (postPhase === 3 && receivedPeopleEvents.some(e=>e.peopleCount===0)) {
      // Wait a moment then evaluate
      setTimeout(() => evaluate(), 500);
    }
    scheduleTimeout('next ai.people or evaluation');
  } catch (e) {
    console.error('[ERROR] Failed to parse ai.people data', e.message);
  }
});

es.addEventListener('ai.control', ev => {
  console.log('[EVENT] ai.control', ev.data);
});

es.onerror = (err) => {
  console.error('[ERROR] SSE error', err);
  cleanup(1);
};

// Safety: overall timeout
scheduleTimeout('overall test completion', 20000);
