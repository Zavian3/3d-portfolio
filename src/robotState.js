/* Shared mutable object — Scene.jsx writes screen coords every frame,
   SpeechBubble.jsx reads them to position the bubble on the robot's head. */
export const robotState = { screenX: 0, screenY: 0 }
