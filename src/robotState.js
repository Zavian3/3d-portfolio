/* Shared mutable state written by JS, read by Three.js every frame */
export const robotState  = { screenX: 0, screenY: 0 }
export const panelRects  = []          // [{left,right,top,bottom}] — updated on scroll/resize
export const speechState = { active: false }
