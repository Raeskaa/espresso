"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// Artistic flower shapes inspired by the reference image
export function FloralDecoration({ className = "" }: { className?: string }) {
  const containerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const flowers = containerRef.current.querySelectorAll('.flower');
    const petals = containerRef.current.querySelectorAll('.petal');
    
    // Gentle floating animation for flowers
    gsap.to(flowers, {
      y: -8,
      rotation: 3,
      duration: 3,
      ease: "sine.inOut",
      stagger: 0.2,
      repeat: -1,
      yoyo: true,
    });

    // Subtle petal sway
    gsap.to(petals, {
      rotation: 5,
      duration: 2.5,
      ease: "sine.inOut",
      stagger: 0.1,
      repeat: -1,
      yoyo: true,
      transformOrigin: "center center",
    });
  }, []);

  return (
    <svg
      ref={containerRef}
      viewBox="0 0 800 600"
      className={`absolute pointer-events-none ${className}`}
      style={{ overflow: "visible" }}
    >
      {/* Large pink flower - top left */}
      <g className="flower" transform="translate(80, 120)">
        <ellipse className="petal" cx="0" cy="-35" rx="18" ry="30" fill="#F8B4C4" opacity="0.9" />
        <ellipse className="petal" cx="30" cy="-15" rx="18" ry="30" fill="#F8B4C4" opacity="0.9" transform="rotate(72)" />
        <ellipse className="petal" cx="20" cy="25" rx="18" ry="30" fill="#F8B4C4" opacity="0.9" transform="rotate(144)" />
        <ellipse className="petal" cx="-20" cy="25" rx="18" ry="30" fill="#F8B4C4" opacity="0.9" transform="rotate(216)" />
        <ellipse className="petal" cx="-30" cy="-15" rx="18" ry="30" fill="#F8B4C4" opacity="0.9" transform="rotate(288)" />
        <circle cx="0" cy="0" r="15" fill="#FFE066" />
        <circle cx="-5" cy="-3" r="2" fill="#2D4A3E" />
        <circle cx="5" cy="-3" r="2" fill="#2D4A3E" />
        <circle cx="0" cy="4" r="2" fill="#2D4A3E" />
      </g>

      {/* White daisy - right side */}
      <g className="flower" transform="translate(650, 180)">
        <ellipse className="petal" cx="0" cy="-40" rx="15" ry="35" fill="#FFFEF5" opacity="0.95" />
        <ellipse className="petal" cx="38" cy="-12" rx="15" ry="35" fill="#FFFEF5" opacity="0.95" transform="rotate(72)" />
        <ellipse className="petal" cx="24" cy="32" rx="15" ry="35" fill="#FFFEF5" opacity="0.95" transform="rotate(144)" />
        <ellipse className="petal" cx="-24" cy="32" rx="15" ry="35" fill="#FFFEF5" opacity="0.95" transform="rotate(216)" />
        <ellipse className="petal" cx="-38" cy="-12" rx="15" ry="35" fill="#FFFEF5" opacity="0.95" transform="rotate(288)" />
        <ellipse cx="0" cy="0" rx="18" ry="12" fill="#F8B4C4" />
        <circle cx="-6" cy="-2" r="2" fill="#FFE066" />
        <circle cx="6" cy="-2" r="2" fill="#FFE066" />
        <circle cx="0" cy="4" r="2" fill="#FFE066" />
      </g>

      {/* Small blue bell flower - top right */}
      <g className="flower" transform="translate(720, 80)">
        <path d="M 0 0 Q -20 30 -15 50 Q 0 55 15 50 Q 20 30 0 0" fill="#7B8FD4" opacity="0.9" />
        <path d="M -2 -10 Q -3 -25 0 -40 M 2 -10 Q 3 -25 5 -35" stroke="#2D4A3E" strokeWidth="2" fill="none" />
      </g>

      {/* Green starburst - bottom left */}
      <g className="flower" transform="translate(150, 450)">
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            x="-3"
            y="-35"
            width="6"
            height="35"
            rx="3"
            fill="#C4E86B"
            opacity="0.9"
            transform={`rotate(${i * 30})`}
          />
        ))}
        <circle cx="0" cy="0" r="8" fill="#8FBF4A" />
      </g>

      {/* Small white flower - bottom center */}
      <g className="flower" transform="translate(400, 520)">
        <ellipse className="petal" cx="0" cy="-20" rx="8" ry="18" fill="#FFFEF5" opacity="0.9" />
        <ellipse className="petal" cx="19" cy="-6" rx="8" ry="18" fill="#FFFEF5" opacity="0.9" transform="rotate(72)" />
        <ellipse className="petal" cx="12" cy="16" rx="8" ry="18" fill="#FFFEF5" opacity="0.9" transform="rotate(144)" />
        <ellipse className="petal" cx="-12" cy="16" rx="8" ry="18" fill="#FFFEF5" opacity="0.9" transform="rotate(216)" />
        <ellipse className="petal" cx="-19" cy="-6" rx="8" ry="18" fill="#FFFEF5" opacity="0.9" transform="rotate(288)" />
        <circle cx="0" cy="0" r="6" fill="#FFE066" />
      </g>

      {/* Curly vine */}
      <path
        className="flower"
        d="M 300 100 Q 350 80 380 120 Q 400 180 450 150 Q 500 120 520 180"
        stroke="#2D4A3E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      {/* Small dots/bubbles */}
      <circle className="flower" cx="280" cy="200" r="4" fill="#C4E86B" opacity="0.7" />
      <circle className="flower" cx="295" cy="215" r="3" fill="#C4E86B" opacity="0.6" />
      <circle className="flower" cx="270" cy="220" r="5" fill="#C4E86B" opacity="0.8" />
      <circle className="flower" cx="310" cy="230" r="3" fill="#C4E86B" opacity="0.5" />
    </svg>
  );
}

// Painterly brush stroke background
export function BrushStrokeBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      className={`absolute inset-0 w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="paintTexture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9BB8E8" />
          <stop offset="50%" stopColor="#7EA3DC" />
          <stop offset="100%" stopColor="#A8C5ED" />
        </linearGradient>
      </defs>
      
      {/* Main background wash */}
      <rect width="100%" height="100%" fill="url(#skyGradient)" />
      
      {/* Painterly texture overlays */}
      <ellipse cx="200" cy="150" rx="300" ry="200" fill="#9BB8E8" opacity="0.5" filter="url(#paintTexture)" />
      <ellipse cx="900" cy="600" rx="400" ry="250" fill="#A8C5ED" opacity="0.4" filter="url(#paintTexture)" />
      <ellipse cx="600" cy="400" rx="350" ry="200" fill="#8FADD8" opacity="0.3" filter="url(#paintTexture)" />
    </svg>
  );
}

// Animated floating particles
export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      color: string;
      opacity: number;
    }> = [];

    const colors = ["#F8B4C4", "#FFE066", "#C4E86B", "#FFFEF5", "#7B8FD4"];

    // Create particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 2,
        speedY: Math.random() * 0.5 - 0.25,
        speedX: Math.random() * 0.3 - 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "overlay" }}
    />
  );
}

// Crayon-style decorative element
export function CrayonShape({ 
  type = "blob", 
  color = "#F8B4C4",
  className = "" 
}: { 
  type?: "blob" | "star" | "circle" | "squiggle";
  color?: string;
  className?: string;
}) {
  const shapes = {
    blob: (
      <path
        d="M 50 10 Q 80 5 90 30 Q 95 60 70 80 Q 40 95 20 70 Q 5 40 20 20 Q 35 5 50 10"
        fill={color}
        opacity="0.8"
      />
    ),
    star: (
      <path
        d="M 50 5 L 58 35 L 90 35 L 64 55 L 74 85 L 50 67 L 26 85 L 36 55 L 10 35 L 42 35 Z"
        fill={color}
        opacity="0.9"
      />
    ),
    circle: (
      <circle cx="50" cy="50" r="40" fill={color} opacity="0.7" />
    ),
    squiggle: (
      <path
        d="M 10 50 Q 30 20 50 50 Q 70 80 90 50"
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
    ),
  };

  return (
    <svg viewBox="0 0 100 100" className={className}>
      <defs>
        <filter id="crayonTexture">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" />
          <feDisplacementMap in="SourceGraphic" scale="2" />
        </filter>
      </defs>
      <g filter="url(#crayonTexture)">
        {shapes[type]}
      </g>
    </svg>
  );
}
