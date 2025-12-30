#!/usr/bin/env node

import { execSync } from 'node:child_process';

function parseSemver(input) {
  // Accepts: "v22.11.0", "1.22.5", "azd version 1.22.5 (...)"
  const match = String(input).match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw: match[0],
  };
}

function cmp(a, b) {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
}

function getCommandOutput(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts }).trim();
  } catch (err) {
    return null;
  }
}

function fail(message) {
  console.error(`preflight: ${message}`);
  process.exitCode = 1;
}

const requirements = {
  node: { major: 22, minor: 0, patch: 0 },
  azd: { major: 1, minor: 22, patch: 5 },
};

// Node
const node = parseSemver(process.version);
if (!node) {
  fail(`Unable to parse Node.js version from '${process.version}'.`);
} else {
  const minNode = requirements.node;
  if (cmp(node, minNode) < 0) {
    fail(`Node.js ${minNode.major}.${minNode.minor}.${minNode.patch}+ required. Found ${node.raw}.`);
  }
}

// azd
const azdOut = getCommandOutput('azd version');
if (!azdOut) {
  fail('Azure Developer CLI (azd) not found. Install from https://aka.ms/azure-dev/install');
} else {
  const azd = parseSemver(azdOut);
  if (!azd) {
    fail(`Unable to parse azd version from: ${JSON.stringify(azdOut.split('\n')[0] ?? azdOut)}`);
  } else {
    const minAzd = requirements.azd;
    if (cmp(azd, minAzd) < 0) {
      fail(
        `azd ${minAzd.major}.${minAzd.minor}.${minAzd.patch}+ required. Found ${azd.raw}. ` +
          `Upgrade: curl -fsSL https://aka.ms/install-azd.sh | bash`,
      );
    }
  }
}

if (process.exitCode === 1) {
  process.exit(1);
}

console.log('preflight: OK');
