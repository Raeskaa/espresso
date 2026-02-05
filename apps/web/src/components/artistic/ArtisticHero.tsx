"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

// Color palette from the reference image
const COLORS = {
  sky: "#7EA3DC",
  skyLight: "#A8C5ED",
  pink: "#F8B4C4",
  pinkLight: "#FDDAE3",
  yellow: "#FFE066",
  green: "#C4E86B",
  greenDark: "#2D4A3E",
  cream: "#FFFEF5",
  purple: "#7B8FD4",
};

export function ArtisticHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // WebGL painterly background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      // Fallback to 2D canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawFallbackBackground(ctx, canvas);
      }
      return;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader - painterly gradient with noise
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        
        // Base sky gradient
        vec3 skyTop = vec3(0.608, 0.729, 0.910);    // #9BB8E8
        vec3 skyMid = vec3(0.494, 0.639, 0.863);    // #7EA3DC
        vec3 skyBot = vec3(0.659, 0.773, 0.929);    // #A8C5ED
        
        vec3 color = mix(skyBot, skyMid, uv.y);
        color = mix(color, skyTop, pow(uv.y, 2.0));
        
        // Add painterly noise
        float noise1 = snoise(uv * 3.0 + u_time * 0.02) * 0.05;
        float noise2 = snoise(uv * 6.0 - u_time * 0.01) * 0.03;
        color += vec3(noise1 + noise2);
        
        // Subtle color variations
        float pinkBlob = smoothstep(0.4, 0.0, length(uv - vec2(0.15, 0.7)));
        color = mix(color, vec3(0.973, 0.706, 0.769), pinkBlob * 0.15);
        
        float yellowBlob = smoothstep(0.35, 0.0, length(uv - vec2(0.85, 0.3)));
        color = mix(color, vec3(1.0, 0.875, 0.4), yellowBlob * 0.1);
        
        float greenBlob = smoothstep(0.3, 0.0, length(uv - vec2(0.7, 0.85)));
        color = mix(color, vec3(0.769, 0.910, 0.420), greenBlob * 0.08);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Set up geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    let animationId: number;
    const startTime = Date.now();

    const render = () => {
      const time = (Date.now() - startTime) / 1000;
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // GSAP entrance animations
  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({ delay: 0.3 });

    // Animate headline with split text effect
    if (headlineRef.current) {
      const words = headlineRef.current.querySelectorAll(".word");
      tl.from(words, {
        y: 80,
        opacity: 0,
        rotationX: -40,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
      });
    }

    // Subhead fade up
    if (subheadRef.current) {
      tl.from(subheadRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6");
    }

    // CTA buttons
    if (ctaRef.current) {
      tl.from(ctaRef.current.children, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
      }, "-=0.4");
    }

    // Floating decorations
    const decorations = heroRef.current.querySelectorAll(".floating-decoration");
    tl.from(decorations, {
      scale: 0,
      opacity: 0,
      rotation: -20,
      duration: 0.8,
      ease: "back.out(2)",
      stagger: 0.15,
    }, "-=0.8");

    setIsLoaded(true);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden">
      {/* WebGL Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Painterly texture overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating decorations */}
      <FloatingFlower className="floating-decoration absolute top-20 left-[10%] w-24 h-24 md:w-32 md:h-32" type="pink" />
      <FloatingFlower className="floating-decoration absolute top-32 right-[8%] w-20 h-20 md:w-28 md:h-28" type="white" />
      <FloatingFlower className="floating-decoration absolute bottom-40 left-[5%] w-16 h-16 md:w-24 md:h-24" type="starburst" />
      <FloatingFlower className="floating-decoration absolute bottom-32 right-[12%] w-18 h-18 md:w-20 md:h-20" type="purple" />
      <FloatingFlower className="floating-decoration absolute top-1/2 left-[3%] w-12 h-12" type="dots" />
      <FloatingFlower className="floating-decoration absolute top-1/3 right-[5%] w-14 h-14" type="dots" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-40 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg mb-8">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-700">AI-Powered Photo Enhancement</span>
        </div>

        {/* Headline */}
        <h1 
          ref={headlineRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]"
          style={{ perspective: "1000px" }}
        >
          <span className="word inline-block text-white drop-shadow-lg" style={{ textShadow: "2px 4px 12px rgba(0,0,0,0.15)" }}>
            Transform
          </span>{" "}
          <span className="word inline-block text-white drop-shadow-lg" style={{ textShadow: "2px 4px 12px rgba(0,0,0,0.15)" }}>
            your
          </span>
          <br />
          <span className="word inline-block bg-gradient-to-r from-pink-200 via-white to-yellow-200 bg-clip-text text-transparent drop-shadow-lg">
            photos
          </span>{" "}
          <span className="word inline-block text-white drop-shadow-lg" style={{ textShadow: "2px 4px 12px rgba(0,0,0,0.15)" }}>
            with
          </span>{" "}
          <span className="word inline-block bg-gradient-to-r from-yellow-200 via-green-200 to-white bg-clip-text text-transparent drop-shadow-lg">
            AI
          </span>
        </h1>

        {/* Subhead */}
        <p 
          ref={subheadRef}
          className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ textShadow: "1px 2px 8px rgba(0,0,0,0.1)" }}
        >
          Fix eye contact, improve posture, adjust angles, and enhance lighting. 
          Get 5 beautiful variations in seconds.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/sign-up">
            <Button 
              size="lg" 
              className="min-w-[200px] h-14 text-lg bg-white text-gray-900 hover:bg-gray-50 shadow-xl shadow-black/10 border-0"
            >
              Start for free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#examples">
            <Button 
              size="lg" 
              variant="outline"
              className="min-w-[200px] h-14 text-lg bg-white/20 backdrop-blur-sm text-white border-white/40 hover:bg-white/30"
            >
              See examples
            </Button>
          </Link>
        </div>

        {/* Trust line */}
        <p className="text-white/70 text-sm">
          3 free generations. No credit card required.
        </p>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto" preserveAspectRatio="none">
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,70 L1440,120 L0,120 Z"
            fill="#FFFEF5"
          />
        </svg>
      </div>
    </section>
  );
}

// Floating flower component
function FloatingFlower({ className, type }: { className?: string; type: "pink" | "white" | "starburst" | "purple" | "dots" }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    gsap.to(ref.current, {
      y: -15,
      rotation: type === "starburst" ? 180 : 8,
      duration: 3 + Math.random() * 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });
  }, [type]);

  const flowers = {
    pink: (
      <g>
        <ellipse cx="50" cy="20" rx="15" ry="25" fill="#F8B4C4" />
        <ellipse cx="75" cy="40" rx="15" ry="25" fill="#F8B4C4" transform="rotate(72 50 50)" />
        <ellipse cx="65" cy="75" rx="15" ry="25" fill="#F8B4C4" transform="rotate(144 50 50)" />
        <ellipse cx="35" cy="75" rx="15" ry="25" fill="#F8B4C4" transform="rotate(216 50 50)" />
        <ellipse cx="25" cy="40" rx="15" ry="25" fill="#F8B4C4" transform="rotate(288 50 50)" />
        <circle cx="50" cy="50" r="12" fill="#FFE066" />
      </g>
    ),
    white: (
      <g>
        <ellipse cx="50" cy="15" rx="12" ry="28" fill="#FFFEF5" />
        <ellipse cx="78" cy="35" rx="12" ry="28" fill="#FFFEF5" transform="rotate(72 50 50)" />
        <ellipse cx="68" cy="78" rx="12" ry="28" fill="#FFFEF5" transform="rotate(144 50 50)" />
        <ellipse cx="32" cy="78" rx="12" ry="28" fill="#FFFEF5" transform="rotate(216 50 50)" />
        <ellipse cx="22" cy="35" rx="12" ry="28" fill="#FFFEF5" transform="rotate(288 50 50)" />
        <ellipse cx="50" cy="50" rx="14" ry="10" fill="#F8B4C4" />
      </g>
    ),
    starburst: (
      <g>
        {[...Array(12)].map((_, i) => (
          <rect
            key={i}
            x="47"
            y="15"
            width="6"
            height="30"
            rx="3"
            fill="#C4E86B"
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="8" fill="#8FBF4A" />
      </g>
    ),
    purple: (
      <g>
        <path d="M 50 20 Q 30 50 35 75 Q 50 82 65 75 Q 70 50 50 20" fill="#7B8FD4" />
        <path d="M 48 10 Q 47 0 50 -5 M 52 10 Q 53 0 55 -5" stroke="#2D4A3E" strokeWidth="2" fill="none" />
      </g>
    ),
    dots: (
      <g>
        <circle cx="30" cy="50" r="8" fill="#C4E86B" opacity="0.8" />
        <circle cx="50" cy="35" r="6" fill="#C4E86B" opacity="0.6" />
        <circle cx="70" cy="55" r="7" fill="#C4E86B" opacity="0.7" />
        <circle cx="45" cy="70" r="5" fill="#C4E86B" opacity="0.5" />
      </g>
    ),
  };

  return (
    <svg ref={ref} viewBox="0 0 100 100" className={className}>
      {flowers[type]}
    </svg>
  );
}

// Fallback for browsers without WebGL
function drawFallbackBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#9BB8E8");
  gradient.addColorStop(0.5, "#7EA3DC");
  gradient.addColorStop(1, "#A8C5ED");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
