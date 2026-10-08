// SPDX-License-Identifier: MPL-2.0
// Firefox PDF shortcuts 0.7. Browser hooks start independently of PDF Ready.
import {
  VERSION, isBuiltinPrincipal, isToolCode, requestedCode, ACTION_RESULTS,
} from "./PdfToolKeysCommon.sys.mjs?v=0.7";

const hookedWindows = new WeakMap();
let started = false;

export function diagnostic(name, value) {
  try {
    // Session/default-branch diagnostics, not persisted browsing history.
    Services.prefs.getDefaultBranch("user.pdfShortcuts.").setStringPref(name, String(value));
  } catch (error) {
    console.error("[PDF shortcuts] Diagnostic write failed", error);
  }
}

export function focusedPdfContext(win) {
  if (!win?.gBrowser) return { reason: "not-browser-window" };
  // nsIFocusManager explicitly exposes the focused *content* BrowsingContext.
  // It does not assume document.activeElement is the remote browser element.
  const context = Services.focus.focusedContentBrowsingContext;
  if (!context) return { reason: "browser-ui-focused" };
  if (context.parent) return { reason: "subframe-focused" };
  const browser = context.top.embedderElement;
  if (!browser || browser.ownerGlobal !== win) return { reason: "different-window" };
  const global = context.currentWindowGlobal;
  if (!global) return { reason: "no-current-document" };
  if (!isBuiltinPrincipal(global.documentPrincipal)) return { reason: "not-pdf" };
  return { context, global, reason: "pdf-focused" };
}

function sendTool(global, code, route) {
  diagnostic("lastKey", code);
  diagnostic("lastRoute", route);
  try {
    diagnostic("lastResult", "sent-to-pdf");
    global.getActor("PdfToolKeys").sendAsyncMessage("PdfToolKeys:Activate", { code });
  } catch (error) {
    diagnostic("lastResult", "send-error");
    diagnostic("error", error);
  }
}

export function handleBrowserKey(win, event) {
  const code = requestedCode(event);
  if (!code) return false;
  // Only the six explicit Ctrl combinations are recorded; no typed text/URLs.
  if (event.type === "keydown" && !event.repeat) diagnostic("lastKey", code);
  let target;
  try {
    target = focusedPdfContext(win);
  } catch (error) {
    diagnostic("lastRoute", "focus-check-error");
    diagnostic("error", error);
    return false;
  }
  if (!target.global) {
    if (event.type === "keydown") diagnostic("lastRoute", target.reason);
    return false;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  if (event.type !== "keydown" || event.repeat) return true;
  diagnostic("lastRoute", "parent");
  if (event.isComposing || event.keyCode === 229) {
    diagnostic("lastResult", "composing");
    return true;
  }
  sendTool(target.global, code, "parent");
  return true;
}

export function installWindow(win) {
  if (!win?.gBrowser || hookedWindows.has(win)) return;
  const listener = event => handleBrowserKey(win, event);
  const cleanup = () => {
    win.removeEventListener("keydown", listener, true);
    win.removeEventListener("keypress", listener, true);
    win.removeEventListener("unload", cleanup);
    hookedWindows.delete(win);
  };
  win.addEventListener("keydown", listener, true);
  win.addEventListener("keypress", listener, true);
  win.addEventListener("unload", cleanup, { once: true });
  hookedWindows.set(win, { listener, cleanup });
  win.document.documentElement.setAttribute("data-pdf-shortcuts-chrome", VERSION);
  diagnostic("runtime", "window-hooked");
}

// Retained/exported observer; handles every subsequently opened browser window.
export const WindowObserver = {
  observe(win) {
    try { installWindow(win); }
    catch (error) { diagnostic("runtime", "hook-error"); diagnostic("error", error); }
  },
};

export function startBrowserHooks() {
  if (started) return;
  Services.obs.addObserver(WindowObserver, "browser-delayed-startup-finished");
  started = true;
  diagnostic("runtime", "waiting-window");
  for (const win of Services.wm.getEnumerator("navigator:browser")) {
    if (win.gBrowserInit?.delayedStartupFinished) installWindow(win);
  }
}

export class PdfToolKeysParent extends JSWindowActorParent {
  receiveMessage(message) {
    if (!["PdfToolKeys:Ready", "PdfToolKeys:Result"].includes(message.name)) return;
    try {
      const context = this.browsingContext;
      if (context.parent || !isBuiltinPrincipal(this.manager?.documentPrincipal)) return;
      if (message.name === "PdfToolKeys:Result") {
        const { code, result, route } = message.data || {};
        if (!isToolCode(code) || !ACTION_RESULTS.includes(result)) return;
        diagnostic("lastKey", code);
        diagnostic("lastResult", result);
        if (route === "child-fallback") diagnostic("lastRoute", route);
        return;
      }
      const win = context.top.embedderElement?.ownerGlobal;
      if (!win?.gBrowser) {
        diagnostic("connection", "no-browser-window");
        this.sendAsyncMessage("PdfToolKeys:Connected", { state: "no-browser-window", version: VERSION });
        return;
      }
      // Ready is now an acknowledgement/secondary attach path, not a gate.
      installWindow(win);
      const state = message.data?.version === VERSION ? "connected" : "version-mismatch";
      diagnostic("connection", state);
      this.sendAsyncMessage("PdfToolKeys:Connected", { state, version: VERSION });
    } catch (error) {
      diagnostic("connection", "connection-error");
      diagnostic("error", error);
    }
  }
}
