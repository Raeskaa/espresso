"use client";

import { useState } from "react";
import { 
  RefreshCw, 
  Copy, 
  Pencil, 
  MessageSquare, 
  Download,
  Check,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  loading?: boolean;
  success?: boolean;
}

function ActionButton({ icon, tooltip, onClick, loading, success }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "p-2 rounded-lg transition-all",
        "hover:bg-[#2D4A3E]/10 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "group relative"
      )}
      title={tooltip}
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 text-[#2D4A3E]/60 animate-spin" />
      ) : success ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <span className="text-[#2D4A3E]/60 group-hover:text-[#2D4A3E]">
          {icon}
        </span>
      )}
      
      {/* Tooltip */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-[#2D4A3E] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {tooltip}
      </span>
    </button>
  );
}

interface GenerationActionsProps {
  onRegenerate?: () => Promise<void> | void;
  onCopy?: () => Promise<void> | void;
  onEdit?: () => void;
  onChat?: () => void;
  onDownload?: () => void;
  showAll?: boolean;
  className?: string;
}

export function GenerationActions({ 
  onRegenerate, 
  onCopy, 
  onEdit, 
  onChat,
  onDownload,
  showAll = true,
  className
}: GenerationActionsProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!onCopy) return;
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "flex items-center gap-0.5 p-1 rounded-xl bg-white/80 backdrop-blur-sm border border-[#2D4A3E]/10 shadow-sm",
      className
    )}>
      {onRegenerate && (
        <ActionButton 
          icon={<RefreshCw className="w-4 h-4" />} 
          tooltip="Regenerate"
          onClick={handleRegenerate}
          loading={isRegenerating}
        />
      )}
      
      {onCopy && (
        <ActionButton 
          icon={<Copy className="w-4 h-4" />} 
          tooltip="Copy"
          onClick={handleCopy}
          success={copied}
        />
      )}
      
      {showAll && onEdit && (
        <ActionButton 
          icon={<Pencil className="w-4 h-4" />} 
          tooltip="Edit"
          onClick={onEdit}
        />
      )}
      
      {showAll && onChat && (
        <ActionButton 
          icon={<MessageSquare className="w-4 h-4" />} 
          tooltip="Refine in chat"
          onClick={onChat}
        />
      )}
      
      {onDownload && (
        <ActionButton 
          icon={<Download className="w-4 h-4" />} 
          tooltip="Download"
          onClick={onDownload}
        />
      )}
    </div>
  );
}

// Compact version for inline use
interface InlineActionsProps {
  text?: string;
  imageUrl?: string;
  onRegenerate?: () => void;
}

export function InlineActions({ text, imageUrl, onRegenerate }: InlineActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (text) {
      await navigator.clipboard.writeText(text);
    } else if (imageUrl) {
      // For images, copy the URL
      await navigator.clipboard.writeText(imageUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'espresso-generation.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {onRegenerate && (
        <button 
          onClick={onRegenerate}
          className="p-1.5 rounded-md hover:bg-[#2D4A3E]/10 transition-colors"
          title="Regenerate"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2D4A3E]/50 hover:text-[#2D4A3E]" />
        </button>
      )}
      
      <button 
        onClick={handleCopy}
        className="p-1.5 rounded-md hover:bg-[#2D4A3E]/10 transition-colors"
        title="Copy"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-[#2D4A3E]/50 hover:text-[#2D4A3E]" />
        )}
      </button>
      
      {imageUrl && (
        <button 
          onClick={handleDownload}
          className="p-1.5 rounded-md hover:bg-[#2D4A3E]/10 transition-colors"
          title="Download"
        >
          <Download className="w-3.5 h-3.5 text-[#2D4A3E]/50 hover:text-[#2D4A3E]" />
        </button>
      )}
    </div>
  );
}
