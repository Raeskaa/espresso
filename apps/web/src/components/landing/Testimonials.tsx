"use client";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote: "Finally got a LinkedIn photo I'm proud of. The eye contact fix is magic.",
    author: "Sarah Chen",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: "2",
    quote: "Used it for my dating profile. Got way more matches. Worth every penny.",
    author: "Marcus Johnson",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: "3",
    quote: "Our team photos look so professional now. HR is thrilled.",
    author: "Emily Rodriguez",
    role: "People Operations",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
];

export function Testimonials() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {TESTIMONIALS.map((testimonial) => (
        <div 
          key={testimonial.id}
          className="p-6 rounded-xl bg-gray-50"
        >
          <p className="text-gray-700 mb-6 leading-relaxed">
            "{testimonial.quote}"
          </p>
          
          <div className="flex items-center gap-3">
            <img
              src={testimonial.avatar}
              alt={testimonial.author}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium">{testimonial.author}</div>
              <div className="text-xs text-gray-500">{testimonial.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
