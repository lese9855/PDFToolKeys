// SPDX-License-Identifier: MPL-2.0
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

// AutoConfig harness, NOT a running Firefox instance. The process admission
// rule below follows FIREFOX_157_0_RELEASE JSActorProtocol::RemoteTypeMatches.
const source = readFileSync(new URL("../program/pdf-shortcuts.cfg", import.meta.url), "utf8");
const root = "/profile/chrome/pdf-shortcuts/";

function startup({ safeMode = false, missing = "", registrationError = null, importError = null } = {}) {
  const prefs = new Map();
  const actors = new Map();
  const errors = [];
  const files = new Set(["chrome.manifest", "PdfToolKeysChild.sys.mjs",
    "PdfToolKeysParent.sys.mjs", "PdfToolKeysCommon.sys.mjs"].map(name => root + name));
  files.delete(root + missing);
  let manifestRegistered = false;
  let hooksStarted = false;

  class File {
    constructor(path) { this.path = path; }
    append(name) { this.path += "/" + name; }
    exists() { return files.has(this.path); }
    get parent() { return new File(this.path.slice(0, this.path.lastIndexOf("/"))); }
  }

  const Cc = {
    "@mozilla.org/xre/app-info;1": { getService: () => ({ inSafeMode: safeMode }) },
    "@mozilla.org/file/directory_service;1": {
      getService: () => ({ get: key => {
        assert.equal(key, "UChrm");
        return new File("/profile/chrome");
      } }),
    },
  };
  const registrar = { autoRegister(file) {
    assert.equal(file.path, root + "chrome.manifest");
    if (registrationError) throw registrationError;
    manifestRegistered = true;
  } };
  const context = {
    Cc, Ci: {},
    lockPref: (name, value) => prefs.set(name, value),
    Components: {
      manager: { QueryInterface: () => registrar },
      utils: { reportError: error => errors.push(error) },
    },
    ChromeUtils: { importESModule(uri) {
      assert.equal(uri, actors.get("PdfToolKeys").parent.esModuleURI);
      if (importError) throw importError;
      return { startBrowserHooks() { hooksStarted = true; } };
    }, registerWindowActor(name, options) {
      assert.equal(manifestRegistered, true);
      actors.set(name, options);
    } },
  };
  vm.runInNewContext(source.slice(source.indexOf("\n") + 1), context);

  function admittedIn(remoteType) {
    const options = actors.get("PdfToolKeys");
    if (!options) return false;
    // Enforcement is enabled by default in Firefox 157. Omitted WebIDL bools
    // become false, so merely registering an actor is insufficient.
    if (/^(web|file)/.test(remoteType) && options.safeForUntrustedWebProcess !== true) return false;
    return true;
  }
  return { prefs, actors, errors, admittedIn, manifestRegistered, hooksStarted };
}

test("registered PDF actor is admitted in web, isolated-web, and file processes", () => {
  const f = startup();
  assert.equal(f.prefs.get("user.pdfShortcuts.status"), "registered");
  assert.equal(f.prefs.get("user.pdfShortcuts.version"), "0.7");
  for (const remote of ["web", "webIsolated=https://example.test", "file"]) {
    assert.equal(f.admittedIn(remote), true, remote);
  }
  const actor = f.actors.get("PdfToolKeys");
  assert.equal(actor.parent.esModuleURI, "resource://pdf-shortcuts/PdfToolKeysParent.sys.mjs?v=0.7");
  assert.equal(actor.allFrames, false);
  assert.equal(f.hooksStarted, true);
  // No change to Firefox's global actor-security check or content sandbox.
  assert.ok([...f.prefs.keys()].every(key => key.startsWith("user.pdfShortcuts.")));
});

test("absent profile files fail with an actionable status, without registering", () => {
  for (const [missing, status] of [
    ["chrome.manifest", "missing-manifest"],
    ["PdfToolKeysChild.sys.mjs", "missing-module"],
    ["PdfToolKeysParent.sys.mjs", "missing-module"],
    ["PdfToolKeysCommon.sys.mjs", "missing-module"],
  ]) {
    const f = startup({ missing });
    assert.equal(f.prefs.get("user.pdfShortcuts.status"), status);
    assert.equal(f.actors.size, 0);
    assert.equal(f.manifestRegistered, false);
  }
});

test("Troubleshoot Mode does not load privileged custom code", () => {
  const f = startup({ safeMode: true });
  assert.equal(f.prefs.get("user.pdfShortcuts.status"), "safe-mode");
  assert.equal(f.actors.size, 0);
});

test("startup errors are surfaced without a stale successful status", () => {
  const f = startup({ registrationError: new Error("test registration failure") });
  assert.equal(f.prefs.get("user.pdfShortcuts.status"), "error");
  assert.match(f.prefs.get("user.pdfShortcuts.error"), /test registration failure/);
  assert.equal(f.errors.length, 1);
  assert.equal(f.actors.size, 0);
});


test("parent import failure is reported immediately instead of a false registered state", () => {
  const f = startup({ importError: new Error("parent module unavailable") });
  assert.equal(f.prefs.get("user.pdfShortcuts.status"), "error");
  assert.match(f.prefs.get("user.pdfShortcuts.error"), /parent module unavailable/);
  assert.equal(f.hooksStarted, false);
});
