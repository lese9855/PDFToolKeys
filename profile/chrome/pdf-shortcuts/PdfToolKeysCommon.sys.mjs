// SPDX-License-Identifier: MPL-2.0
// Shared data only; no browser/window access or external I/O.
export const VERSION = "0.7";
export const VIEWER_URL = "resource://pdf.js/web/viewer.html";

export const TOOL_BUTTONS = Object.freeze({
  KeyG: "editorFreeTextButton",
  KeyD: "editorInkButton",
  KeyH: "editorHighlightButton",
  KeyM: "editorCommentButton",
  KeyU: "editorSignatureButton",
  KeyI: "editorStampButton",
});

export function isToolCode(code) {
  return typeof code === "string" && Object.hasOwn(TOOL_BUTTONS, code);
}

export function isBuiltinPrincipal(principal) {
  try {
    // Same exact Firefox PDF origin check used by PageExtractorParent.
    // Ordinary websites cannot acquire this resource principal.
    return principal.originNoSuffix === "resource://pdf.js";
  } catch {
    return false;
  }
}

export const ACTION_RESULTS = Object.freeze([
  "button-dispatched", "viewer-not-focused", "modal-open", "tool-unavailable",
  "not-viewer", "invalid-code", "tool-error",
]);

export function requestedCode(event) {
  if (
    !["keydown", "keypress"].includes(event.type) ||
    !event.isTrusted || event.defaultPrevented ||
    !event.ctrlKey || event.altKey || event.shiftKey || event.metaKey
  ) return null;
  // Consume matching repeats/composition without repeatedly toggling a tool.
  return isToolCode(event.code) ? event.code : null;
}
