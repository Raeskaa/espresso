"use client";

import { useState } from "react";
import { Eye, Move, Camera, Sun, ChevronDown, ChevronUp } from "lucide-react";

interface FixTemplate {
  id: string;
  editType: string;
  label: string;
  description: string;
  promptModifier: string;
  isDefault?: boolean;
  iconKey?: string;
}

interface TemplateSelectorProps {
  editType: "eyeContact" | "posture" | "angle" | "lighting";
  templates: FixTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  disabled?: boolean;
}

const ICONS = {
  eyeContact: Eye,
  posture: Move,
  angle: Camera,
  lighting: Sun,
};

const LABELS = {
  eyeContact: "Eye Contact",
  posture: "Posture",
  angle: "Angle",
  lighting: "Lighting",
};

export function TemplateSelector({
  editType,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  disabled = false,
}: TemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = ICONS[editType];
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  if (disabled) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">{LABELS[editType]}</p>
            <p className="text-xs text-gray-500">{selectedTemplate.label}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Template options */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-2 space-y-1">
          {templates.map((template) => {
            const isSelected = template.id === selectedTemplateId;
            
            return (
              <button
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template.id);
                  setIsExpanded(false);
                }}
                className={`
                  w-full px-3 py-2 rounded-md text-left transition-colors flex items-center gap-3
                  ${isSelected 
                    ? "bg-black text-white" 
                    : "hover:bg-gray-100"
                  }
                `}
              >
                <div className={`
                  w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0
                  ${isSelected ? "border-white bg-white" : "border-gray-300"}
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isSelected ? "text-white" : ""}`}>
                    {template.label}
                    {template.isDefault && (
                      <span className={`ml-2 text-xs ${isSelected ? "text-gray-300" : "text-gray-400"}`}>
                        Default
                      </span>
                    )}
                  </p>
                  <p className={`text-xs ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Wrapper for multiple template selectors
interface TemplateSelectorsProps {
  selectedFixes: Set<string>;
  templateSelections: Record<string, string>;
  onSelectTemplate: (editType: string, templateId: string) => void;
  templates: {
    eyeContact: FixTemplate[];
    posture: FixTemplate[];
    angle: FixTemplate[];
    lighting: FixTemplate[];
  };
}

export function TemplateSelectors({
  selectedFixes,
  templateSelections,
  onSelectTemplate,
  templates,
}: TemplateSelectorsProps) {
  const fixMapping = {
    fixEyeContact: "eyeContact",
    improvePosture: "posture",
    adjustAngle: "angle",
    enhanceLighting: "lighting",
  } as const;

  const activeEditTypes = Array.from(selectedFixes)
    .map((fixId) => fixMapping[fixId as keyof typeof fixMapping])
    .filter(Boolean);

  if (activeEditTypes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-500">Customize Fixes</span>
      
      {activeEditTypes.map((editType) => (
        <TemplateSelector
          key={editType}
          editType={editType as "eyeContact" | "posture" | "angle" | "lighting"}
          templates={templates[editType as keyof typeof templates]}
          selectedTemplateId={templateSelections[editType] || templates[editType as keyof typeof templates][0].id}
          onSelectTemplate={(templateId) => onSelectTemplate(editType, templateId)}
        />
      ))}
    </div>
  );
}
