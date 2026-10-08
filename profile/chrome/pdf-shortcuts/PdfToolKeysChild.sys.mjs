// SPDX-License-Identifier: MPL-2.0
// Firefox PDF shortcuts 0.7. No network, filesystem or installation actions.
import {
  VERSION, TOOL_BUTTONS, isToolCode, isBuiltinPrincipal, requestedCode,
} from "./PdfToolKeysCommon.sys.mjs?v=0.7";

export function isBuiltinViewer(document) {
  return isBuiltinPrincipal(document?.nodePrincipal) &&
    Boolean(document?.getElementById("viewerContainer"));
}

function isVisible(element) {
  return Boolean(
    element &&
    !element.closest('[hidden], .hidden, [inert], [aria-hidden="true"]') &&
    element.getClientRects().length &&
    element.ownerDocument.defaultView.getComputedStyle(element).visibility !== "hidden"
  );
}

function modalIsOpen(document) {
  return Array.from(document.querySelectorAll(
    'dialog[open], [role="dialog"][aria-modal="true"], .overlayContainer:not(.hidden)'
  )).some(isVisible);
}

export function toolResult(document, code) {
  if (!isBuiltinViewer(document)) return "not-viewer";
  if (!isToolCode(code)) return "invalid-code";
  if (document.visibilityState === "hidden" || !document.hasFocus()) return "viewer-not-focused";
  if (modalIsOpen(document)) return "modal-open";
  const button = document.getElementById(TOOL_BUTTONS[code]);
  if (!button || button.disabled || !isVisible(button)) return "tool-unavailable";
  const win = document.defaultView;
  // detail 1 avoids PDF.js's keyboard path that creates a centered editor.
  button.dispatchEvent(new win.MouseEvent("click", {
    bubbles: true, cancelable: true, composed: true,
    view: win, detail: 1, button: 0, buttons: 0,
  }));
  return "button-dispatched";
}

export function activateTool(document, code) {
  return toolResult(document, code) === "button-dispatched";
}

export class PdfToolKeysChild extends JSWindowActorChild {
  _document = null;

  connectDocument() {
    const document = this.document;
    if (!isBuiltinViewer(document)) return false;
    if (this._document !== document) {
      this._document?.defaultView?.removeEventListener("keydown", this, true);
      this._document = document;
      // Local fallback preserves the previously working child event route.
      // The parent consumes its events first; defaultPrevented avoids duplicates.
      document.defaultView.addEventListener("keydown", this, true);
      document.documentElement.setAttribute("data-pdf-shortcuts", `prototype-${VERSION}`);
      document.documentElement.setAttribute("data-pdf-shortcuts-connection", "waiting-parent");
    }
    this.sendAsyncMessage("PdfToolKeys:Ready", { version: VERSION });
    return true;
  }

  runTool(code, route) {
    let result;
    try { result = toolResult(this._document, code); }
    catch (error) {
      result = "tool-error";
      console.error("[PDF shortcuts] Tool error", error);
    }
    this._document?.documentElement.setAttribute("data-pdf-shortcuts-last", `${code}:${result}`);
    if (isToolCode(code)) this.sendAsyncMessage("PdfToolKeys:Result", { code, result, route });
  }

  handleEvent(event) {
    try {
      if (["DOMContentLoaded", "pageshow"].includes(event.type)) {
        if (event.target === this.document) this.connectDocument();
        return;
      }
      if (event.type !== "keydown" || !this._document || !isBuiltinViewer(this._document)) return;
      const code = requestedCode(event);
      if (!code) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat && !event.isComposing && event.keyCode !== 229) this.runTool(code, "child-fallback");
    } catch (error) {
      console.error("[PDF shortcuts] PDF connection/event error", error);
    }
  }

  receiveMessage(message) {
    try {
      if (message.name === "PdfToolKeys:Connected") {
        if (!isBuiltinViewer(this._document)) return;
        const data = message.data || {};
        const state = data.version !== VERSION ? "version-mismatch" :
          (data.state === "connected" ? "connected" : "connection-error");
        this._document.documentElement.setAttribute("data-pdf-shortcuts-connection", state);
        return;
      }
      if (message.name !== "PdfToolKeys:Activate" || !isToolCode(message.data?.code)) return;
      if (!this._document && !this.connectDocument()) return;
      this.runTool(message.data.code, "parent");
    } catch (error) {
      console.error("[PDF shortcuts] PDF message error", error);
    }
  }

  didDestroy() {
    try { this._document?.defaultView?.removeEventListener("keydown", this, true); } catch {}
    this._document = null;
  }
}
