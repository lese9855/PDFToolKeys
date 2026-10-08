// SPDX-License-Identifier: MPL-2.0
import test from "node:test";
import assert from "node:assert/strict";

// These are isolated tests of our routing, not a running Firefox integration.
globalThis.JSWindowActorChild = class {};
globalThis.JSWindowActorParent = class {};
const diagnostics = new Map();
globalThis.Services = {
  prefs: { getDefaultBranch: () => ({ setStringPref: (k, v) => diagnostics.set(k, v) }) },
  focus: {
    window: null, override: undefined,
    get focusedContentBrowsingContext() {
      return this.override !== undefined ? this.override :
        (this.window?.document.activeElement?.browsingContext || null);
    },
  },
};
const { TOOL_BUTTONS, requestedCode } = await import("../profile/chrome/pdf-shortcuts/PdfToolKeysCommon.sys.mjs");
const { PdfToolKeysChild, activateTool } = await import("../profile/chrome/pdf-shortcuts/PdfToolKeysChild.sys.mjs");
const { PdfToolKeysParent, handleBrowserKey, focusedPdfContext, installWindow } = await import("../profile/chrome/pdf-shortcuts/PdfToolKeysParent.sys.mjs");
const PDF = "resource://pdf.js/web/viewer.html";
const expected = {
  KeyG: "editorFreeTextButton", KeyD: "editorInkButton",
  KeyH: "editorHighlightButton", KeyM: "editorCommentButton",
  KeyU: "editorSignatureButton", KeyI: "editorStampButton",
};

function event(overrides = {}) {
  return {
    type: "keydown", isTrusted: true, defaultPrevented: false,
    code: "KeyG", ctrlKey: true, altKey: false, shiftKey: false, metaKey: false,
    repeat: false, isComposing: false, keyCode: 71,
    preventDefault() { this.defaultPrevented = true; },
    stopImmediatePropagation() { this.stopped = true; },
    ...overrides,
  };
}

function fixture({ principal = PDF, initialize = true } = {}) {
  diagnostics.clear();
  Services.focus.override = undefined;
  const listeners = new Map();
  const childListeners = new Map();
  const attrs = new Map();
  const clicks = [];
  const messages = [];
  const buttons = new Map([["viewerContainer", {}]]);
  let active = null;
  let centeredTextBoxes = 0;
  const principalObject = { URI: { spec: principal }, originNoSuffix: principal === PDF ? "resource://pdf.js" : principal };
  const chromeWindow = {
    document: {
      documentElement: { setAttribute: (key, value) => attrs.set(key, value) },
    },
    addEventListener(type, fn, options) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push({ fn, options });
    },
    removeEventListener(type, fn) {
      listeners.set(type, (listeners.get(type) || []).filter(item => item.fn !== fn));
    },
  };
  const document = {
    nodePrincipal: principalObject, visibilityState: "visible", activeElement: null,
    hasFocus: () => chromeWindow.document.activeElement === browser,
    querySelectorAll: () => [], getElementById: id => buttons.get(id),
    documentElement: { setAttribute: (key, value) => attrs.set(key, value) },
    defaultView: {
      addEventListener: (type, listener) => childListeners.set(type, listener),
      removeEventListener: type => childListeners.delete(type),
      getComputedStyle: () => ({ visibility: "visible" }),
      MouseEvent: class {
        constructor(type, options = {}) {
          Object.assign(this, { type, detail: 0, isTrusted: false }, options);
        }
      },
    },
  };
  for (const id of Object.values(expected)) {
    buttons.set(id, {
      disabled: false, ownerDocument: document,
      closest: () => null, getClientRects: () => [{}],
      dispatchEvent(evt) {
        assert.equal(evt.type, "click");
        clicks.push({ id, evt });
        active = active === id ? null : id;
        // Model only PDF.js's documented detail-zero keyboard creation branch.
        if (active === "editorFreeTextButton" && evt.detail === 0) centeredTextBoxes++;
      },
    });
  }
  const context = { parent: null };
  context.top = context;
  const browser = { ownerGlobal: chromeWindow, browsingContext: context };
  context.embedderElement = browser;
  chromeWindow.gBrowser = { selectedBrowser: browser };
  chromeWindow.document.activeElement = browser;
  Services.focus.window = chromeWindow;
  const child = new PdfToolKeysChild();
  child.document = document;
  const parent = new PdfToolKeysParent();
  const global = { documentPrincipal: principalObject, getActor: name => {
    assert.equal(name, "PdfToolKeys"); return parent;
  } };
  context.currentWindowGlobal = global;
  parent.manager = global;
  parent.browsingContext = context;
  parent.sendAsyncMessage = (name, data) => {
    if (name === "PdfToolKeys:Activate") messages.push({ name, data });
    child.receiveMessage({ name, data });
  };
  child.sendAsyncMessage = (name, data) => parent.receiveMessage({ name, data });
  if (initialize) child.handleEvent({ type: "DOMContentLoaded", target: document });
  return {
    chromeWindow, browser, document, context, global, child, parent,
    listeners, attrs, clicks, messages, buttons, childListeners,
    active: () => active, centeredTextBoxes: () => centeredTextBoxes,
    key(overrides = {}) {
      Services.focus.window = chromeWindow;
      const e = event(overrides);
      return { e, handled: handleBrowserKey(chromeWindow, e) };
    },

  };
}

test("all six requested Ctrl keys route once to their correct native buttons", () => {
  assert.deepEqual(TOOL_BUTTONS, expected);
  for (const [code, id] of Object.entries(expected)) {
    const f = fixture();
    const { e, handled } = f.key({ code });
    assert.equal(handled, true);
    assert.equal(e.defaultPrevented, true);
    assert.equal(e.stopped, true);
    assert.equal(f.clicks.length, 1);
    assert.equal(f.active(), id);
    assert.equal(f.clicks[0].evt.detail, 1);
  }
});

test("when a key reaches browser capture, prevention blocks the modeled native handler", () => {
  const f = fixture();
  const hook = f.listeners.get("keydown")[0];
  assert.equal(hook.options, true);
  const e = event({ code: "KeyM" });
  hook.fn(e);
  // Model GlobalKeyListener::WalkHandlers' DefaultPrevented early return.
  let muteActions = 0;
  if (!e.defaultPrevented) muteActions++;
  assert.equal(muteActions, 0);
  assert.equal(f.active(), "editorCommentButton");
});

test("a second press toggles the same native tool and other keys switch tools", () => {
  const f = fixture();
  f.key(); f.key();
  assert.equal(f.active(), null);
  f.key(); f.key({ code: "KeyD" });
  assert.equal(f.active(), "editorInkButton");
});

test("web/file URLs ending in pdf or copying PDF toolbar IDs are not trusted viewers", () => {
  for (const principal of ["https://example.test/a.pdf", "file:///tmp/a.pdf",
    "https://example.test/resource://pdf.js/web/viewer.html", "resource://other/viewer.html"]) {
    const f = fixture({ principal });
    assert.equal(f.listeners.size, 0);
    for (const code of Object.keys(expected)) {
      const { e, handled } = f.key({ code });
      assert.equal(handled, false);
      assert.equal(e.defaultPrevented, false);
    }
    assert.equal(f.clicks.length, 0);
  }
});

test("address bar, chrome find bar and other browser controls retain all six keys", () => {
  const f = fixture();
  for (const element of [{ id: "urlbar" }, { id: "findbar" }, { id: "sidebar" }, null]) {
    f.chromeWindow.document.activeElement = element;
    for (const code of Object.keys(expected)) {
      assert.equal(f.key({ code }).e.defaultPrevented, false);
    }
  }
  assert.equal(f.messages.length, 0);
});

test("switching away from and back to a PDF immediately changes routing", () => {
  const f = fixture();
  const other = fixture({ principal: "https://example.test/" });
  f.chromeWindow.gBrowser.selectedBrowser = other.browser;
  f.chromeWindow.document.activeElement = other.browser;
  assert.equal(f.key({ code: "KeyM" }).handled, false);
  f.chromeWindow.gBrowser.selectedBrowser = f.browser;
  f.chromeWindow.document.activeElement = f.browser;
  assert.equal(f.key({ code: "KeyM" }).handled, true);
});

test("navigation and stale actor state cannot override a newly loaded webpage", () => {
  const f = fixture();
  f.context.currentWindowGlobal = { documentPrincipal: { URI: { spec: "https://example.test/" } } };
  assert.equal(f.key().handled, false);

});

test("focus loss before asynchronous delivery prevents a late PDF activation", () => {
  const f = fixture();
  let pending;
  f.parent.sendAsyncMessage = (name, data) => { pending = { name, data }; };
  assert.equal(f.key().handled, true);
  f.chromeWindow.document.activeElement = { id: "urlbar" };
  f.child.receiveMessage(pending);
  assert.equal(f.clicks.length, 0);
});

test("repeats and keypress are swallowed without repeated toggles or default commands", () => {
  const f = fixture();
  f.key({ code: "KeyM" });
  for (const overrides of [{ repeat: true }, { type: "keypress" }, { isComposing: true }, { keyCode: 229 }]) {
    const { handled, e } = f.key({ code: "KeyM", ...overrides });
    assert.equal(handled, true);
    assert.equal(e.defaultPrevented, true);
  }
  assert.equal(f.clicks.length, 1);
});

test("bare letters, Shift, Ctrl+Alt, legacy numbers and other modifiers have no binding", () => {
  for (const code of [...Object.keys(expected), "KeyT", "KeyC", "KeyS", "KeyV", "Digit0", "Digit1"]) {
    for (const modifiers of [
      { ctrlKey: false }, { ctrlKey: false, shiftKey: true },
      { altKey: true }, { shiftKey: true }, { metaKey: true },
    ]) assert.equal(requestedCode(event({ code, ...modifiers })), null);
  }
});

test("the other twenty Ctrl letters including save, print, copy and undo stay untouched", () => {
  const f = fixture();
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const code = `Key${letter}`;
    if (Object.hasOwn(expected, code)) continue;
    assert.equal(f.key({ code }).handled, false);
  }
  assert.equal(f.messages.length, 0);
});

test("untrusted, already-handled and keyup events cannot trigger tool messages", () => {
  const f = fixture();
  for (const overrides of [{ isTrusted: false }, { defaultPrevented: true }, { type: "keyup" }]) {
    assert.equal(f.key(overrides).handled, false);
  }
  assert.equal(f.messages.length, 0);
});

test("missing, disabled, hidden tools or modal dialogs never fall back to browser commands", () => {
  for (const change of [
    f => f.buttons.delete("editorCommentButton"),
    f => { f.buttons.get("editorCommentButton").disabled = true; },
    f => { f.buttons.get("editorCommentButton").closest = () => ({}); },
    f => { f.buttons.get("editorCommentButton").getClientRects = () => []; },
    f => { f.document.querySelectorAll = () => [f.buttons.get("editorCommentButton")]; },
  ]) {
    const f = fixture(); change(f);
    assert.equal(f.key({ code: "KeyM" }).e.defaultPrevented, true);
    assert.equal(f.clicks.length, 0);
  }
});

test("Ctrl tool switches also work from PDF text fields without binding uppercase input", () => {
  const f = fixture();
  f.document.activeElement = { isContentEditable: true };
  assert.equal(f.key({ code: "KeyD" }).handled, true);
  assert.equal(f.active(), "editorInkButton");
  assert.equal(f.key({ ctrlKey: false, shiftKey: true, code: "KeyD" }).handled, false);
});

test("physical codes accept Korean/English layout and Caps Lock equally", () => {
  for (const key of ["g", "G", "ㅎ"]) {
    assert.equal(requestedCode(event({ key })), "KeyG");
  }
});

test("arbitrary action payloads, foreign principals and hidden documents are rejected", () => {
  const f = fixture();
  for (const code of ["__proto__", "constructor", "KeyT", "Digit1", undefined, {}]) {
    f.child.receiveMessage({ name: "PdfToolKeys:Activate", data: { code } });
  }
  assert.equal(f.clicks.length, 0);
  f.document.visibilityState = "hidden";
  assert.equal(activateTool(f.document, "KeyG"), false);
  f.document.visibilityState = "visible";
  f.document.nodePrincipal = { URI: { spec: "https://example.test/" } };
  assert.equal(activateTool(f.document, "KeyG"), false);
});

test("iframes and unknown messages cannot install or use the bridge", () => {
  const f = fixture({ initialize: false });
  f.parent.receiveMessage({ name: "PdfToolKeys:Activate", data: { code: "KeyM" } });
  assert.equal(f.listeners.size, 0);
  f.context.parent = {};
  f.child.handleEvent({ type: "DOMContentLoaded", target: f.document });
  assert.equal(f.listeners.size, 0);
  assert.equal(focusedPdfContext(f.chromeWindow).reason, "subframe-focused");
});

test("pageshow reuses one browser listener; destruction and window close clean up", () => {
  const f = fixture();
  f.child.handleEvent({ type: "pageshow", target: f.document });
  assert.equal(f.listeners.get("keydown").length, 1);
  assert.equal(f.listeners.get("keypress").length, 1);
  assert.equal(f.attrs.get("data-pdf-shortcuts"), "prototype-0.7");
  assert.equal(f.attrs.get("data-pdf-shortcuts-chrome"), "0.7");
  f.child.didDestroy();
  assert.equal(f.childListeners.size, 0);
  f.listeners.get("unload")[0].fn();
  assert.equal(f.listeners.get("keydown").length, 0);
  assert.equal(f.listeners.get("keypress").length, 0);
});

test("text tool uses mouse-count path without requesting a centered text editor", () => {
  const old = fixture();
  old.buttons.get("editorFreeTextButton").dispatchEvent(new old.document.defaultView.MouseEvent("click"));
  assert.equal(old.centeredTextBoxes(), 1, "model of the old detail-zero defect");
  const f = fixture();
  f.key();
  assert.equal(f.centeredTextBoxes(), 0);
  assert.equal(f.clicks[0].evt.detail, 1);
  assert.equal(f.clicks[0].evt.isTrusted, false);
});


test("native content focus works even if chrome activeElement is not the browser", () => {
  const f = fixture();
  f.chromeWindow.document.activeElement = { localName: "body" };
  Services.focus.override = f.context;
  f.document.hasFocus = () => true;
  assert.equal(f.key({ code: "KeyM" }).handled, true);
  assert.equal(f.active(), "editorCommentButton");
});

test("a ready PDF is routable before a Ready acknowledgement has been received", () => {
  const f = fixture({ initialize: false });
  assert.equal(f.key({ code: "KeyM" }).handled, true);
  assert.equal(f.active(), "editorCommentButton");
  assert.equal(f.attrs.get("data-pdf-shortcuts-connection"), "connected");
});

test("ordinary windows can attach key handling before any PDF has loaded", () => {
  const f = fixture({ principal: "https://example.test/", initialize: false });
  installWindow(f.chromeWindow);
  assert.equal(f.listeners.get("keydown").length, 1);
  assert.equal(diagnostics.get("runtime"), "window-hooked");
  assert.equal(f.key().handled, false);
  assert.equal(diagnostics.get("lastRoute"), "not-pdf");
});

test("a child fallback can operate without the parent Ready handshake", () => {
  const f = fixture({ initialize: false });
  f.child.sendAsyncMessage = () => {}; // older cfg with no parent handler
  f.child.handleEvent({ type: "DOMContentLoaded", target: f.document });
  assert.equal(f.attrs.get("data-pdf-shortcuts-connection"), "waiting-parent");
  const e = event();
  f.child.handleEvent(e);
  assert.equal(e.defaultPrevented, true);
  assert.equal(f.active(), "editorFreeTextButton");
  assert.equal(f.attrs.get("data-pdf-shortcuts-last"), "KeyG:button-dispatched");
});

test("parent-consumed keyboard events do not also trigger the child fallback", () => {
  const f = fixture();
  const { e } = f.key();
  f.child.handleEvent(e);
  assert.equal(f.clicks.length, 1);
});

test("diagnostics distinguish delivered clicks from unavailable tools and UI focus", () => {
  const f = fixture();
  f.key();
  assert.equal(diagnostics.get("lastKey"), "KeyG");
  assert.equal(diagnostics.get("lastRoute"), "parent");
  assert.equal(diagnostics.get("lastResult"), "button-dispatched");
  f.buttons.get("editorFreeTextButton").disabled = true;
  f.key();
  assert.equal(diagnostics.get("lastResult"), "tool-unavailable");
  f.chromeWindow.document.activeElement = { id: "urlbar" };
  f.key();
  assert.equal(diagnostics.get("lastRoute"), "browser-ui-focused");
});

test("bootstrap registers future windows and handles already-started windows once", async () => {
  const f = fixture({ initialize: false });
  f.chromeWindow.gBrowserInit = { delayedStartupFinished: true };
  let observer;
  Services.obs = { addObserver(value, topic) {
    assert.equal(topic, "browser-delayed-startup-finished"); observer = value;
  } };
  Services.wm = { getEnumerator: () => [f.chromeWindow] };
  const { startBrowserHooks } = await import("../profile/chrome/pdf-shortcuts/PdfToolKeysParent.sys.mjs?bootstrap-test");
  startBrowserHooks(); startBrowserHooks();
  assert.equal(f.listeners.get("keydown").length, 1);
  const next = fixture({ initialize: false });
  observer.observe(next.chromeWindow);
  assert.equal(next.listeners.get("keydown").length, 1);
});

// Regression: the removed shortcut must pass through both remaining routes.
test("Ctrl+N is untouched in PDF parent and child routes, including repeats", () => {
  const f = fixture();
  for (const type of ["keydown", "keypress"]) {
    for (const repeat of [false, true]) {
      const { e, handled } = f.key({ code: "KeyN", keyCode: 78, type, repeat });
      assert.equal(handled, false);
      f.child.handleEvent(e);
      assert.equal(e.defaultPrevented, false);
      assert.equal(e.stopped, undefined);
    }
  }
  assert.equal(f.clicks.length, 0);
  assert.equal(f.messages.length, 0);
  assert.deepEqual([...f.listeners.keys()].sort(), ["keydown", "keypress", "unload"]);
});
