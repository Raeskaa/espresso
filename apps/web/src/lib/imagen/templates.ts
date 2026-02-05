import type { FixTemplate, EditType } from './types';

export const EYE_CONTACT_TEMPLATES: FixTemplate[] = [
  {
    id: 'direct',
    editType: 'eyeContact',
    label: 'Look at camera',
    description: 'Direct, natural eye contact',
    promptModifier: 'Adjust the eyes to look directly at the camera. Keep the gaze relaxed and natural.',
    isDefault: true,
  },
  {
    id: 'slight_left',
    editType: 'eyeContact',
    label: 'Slightly left',
    description: 'Looking just left of camera',
    promptModifier: 'Adjust gaze to look slightly to the left of the camera.',
  },
  {
    id: 'slight_right',
    editType: 'eyeContact',
    label: 'Slightly right',
    description: 'Looking just right of camera',
    promptModifier: 'Adjust gaze to look slightly to the right of the camera.',
  },
  {
    id: 'confident',
    editType: 'eyeContact',
    label: 'More confident',
    description: 'Stronger, more engaging look',
    promptModifier: 'Make eye contact more confident and engaging without changing expression.',
  },
];

export const POSTURE_TEMPLATES: FixTemplate[] = [
  {
    id: 'shoulders_back',
    editType: 'posture',
    label: 'Shoulders back',
    description: 'More confident stance',
    promptModifier: 'Pull shoulders back slightly for a more confident, open posture.',
    iconKey: 'shouldersBack',
    isDefault: true,
  },
  {
    id: 'chin_up',
    editType: 'posture',
    label: 'Chin up',
    description: 'Lift chin slightly',
    promptModifier: 'Raise the chin slightly for a more confident appearance.',
    iconKey: 'chinUp',
  },
  {
    id: 'straighten_head',
    editType: 'posture',
    label: 'Straighten head',
    description: 'Reduce head tilt',
    promptModifier: 'Straighten head position to reduce tilt while keeping expression.',
    iconKey: 'straightenHead',
  },
  {
    id: 'lean_in',
    editType: 'posture',
    label: 'Lean in slightly',
    description: 'More engaged posture',
    promptModifier: 'Add a subtle forward lean for a more engaged, approachable look.',
    iconKey: 'leanIn',
  },
];

export const ANGLE_TEMPLATES: FixTemplate[] = [
  {
    id: 'flattering',
    editType: 'angle',
    label: 'More flattering',
    description: 'AI chooses best adjustment',
    promptModifier: 'Make a subtle angle adjustment for a more flattering perspective.',
    isDefault: true,
  },
  {
    id: 'reduce_tilt',
    editType: 'angle',
    label: 'Reduce tilt',
    description: 'Straighten the angle',
    promptModifier: 'Reduce head and camera tilt for a more level, balanced composition.',
  },
  {
    id: 'slight_turn',
    editType: 'angle',
    label: 'Slight turn',
    description: 'Subtle three-quarter view',
    promptModifier: 'Create a subtle three-quarter angle for more dimension.',
  },
];

export const LIGHTING_TEMPLATES: FixTemplate[] = [
  {
    id: 'softer',
    editType: 'lighting',
    label: 'Softer shadows',
    description: 'Reduce harsh shadows',
    promptModifier: 'Soften harsh shadows and create more even, flattering light.',
    isDefault: true,
  },
  {
    id: 'warmer',
    editType: 'lighting',
    label: 'Warmer tone',
    description: 'Add warmth to lighting',
    promptModifier: 'Add a subtle warm tone to the lighting while keeping skin natural.',
  },
  {
    id: 'brighter',
    editType: 'lighting',
    label: 'Brighten face',
    description: 'More light on face',
    promptModifier: 'Brighten the face area slightly, reducing underexposure.',
  },
  {
    id: 'even',
    editType: 'lighting',
    label: 'Even lighting',
    description: 'Balance light across face',
    promptModifier: 'Balance lighting across the face, reducing one-sided shadows.',
  },
];

export const TEMPLATES = {
  eyeContact: EYE_CONTACT_TEMPLATES,
  posture: POSTURE_TEMPLATES,
  angle: ANGLE_TEMPLATES,
  lighting: LIGHTING_TEMPLATES,
} as const;

export function getDefaultTemplate(editType: EditType): FixTemplate {
  const templates = TEMPLATES[editType];
  return templates.find((template) => template.isDefault) || templates[0];
}
