'use client';

import { useEffect, useState, useRef } from 'react';

interface PointsDashboardProps {
  data: {
    total_points: number;
    volume_points: number;
    milestone_points: number;
    first_interaction_points: number;
    consistency_points: number;
    referral_points: number;
    social_points: number;
    diversity_multiplier: number;
    sybil_status: {
      label: string;
      color: string;
      description: string;
      multiplier: number;
    };
  } | null;
}

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      countRef.current = Math.floor(easeOutQuart * end);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

// Animated progress ring
function ProgressRing({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (progress / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress, circumference]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#132D46" />
          <stop offset="50%" stopColor="#0A786A" />
          <stop offset="100%" stopColor="#01C38E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function PointsDashboard({ data }: PointsDashboardProps) {
  const animatedTotal = useAnimatedCounter(data?.total_points || 0);

  if (!data) {
    return (
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0A786A]/50 to-[#01C38E]/50 rounded-2xl blur opacity-20" />
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 animate-pulse" />
            <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const pointsBreakdown = [
    {
      label: 'Activity',
      value: data.volume_points,
      subtitle: `${data.diversity_multiplier}x diversity`,
      gradient: 'from-[#0A786A] to-[#01C38E]',
      bgGradient: 'from-[#0A786A]/10 to-[#01C38E]/10',
      borderColor: 'border-[#01C38E]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Milestones',
      value: data.milestone_points,
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-500/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      label: 'First Use',
      value: data.first_interaction_points,
      gradient: 'from-[#0A786A] to-[#01C38E]',
      bgGradient: 'from-[#0A786A]/10 to-[#01C38E]/10',
      borderColor: 'border-[#0A786A]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      label: 'Consistency',
      value: data.consistency_points,
      gradient: 'from-purple-500 to-indigo-500',
      bgGradient: 'from-purple-500/10 to-indigo-500/10',
      borderColor: 'border-purple-500/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Referrals',
      value: data.referral_points,
      gradient: 'from-[#0A786A] to-[#01C38E]',
      bgGradient: 'from-[#0A786A]/10 to-[#01C38E]/10',
      borderColor: 'border-[#0A786A]/20',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Social',
      value: data.social_points,
      gradient: 'from-[#132D46] to-[#0A786A]',
      bgGradient: 'from-[#132D46]/10 to-[#0A786A]/10',
      borderColor: 'border-[#0A786A]/20',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ];

  const getStatusStyles = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'from-[#0A786A]/20 to-[#01C38E]/20',
          border: 'border-[#0A786A]/30',
          text: 'text-[#01C38E]',
          glow: 'shadow-[#01C38E]/20',
        };
      case 'yellow':
        return {
          bg: 'from-yellow-500/20 to-amber-500/20',
          border: 'border-yellow-500/30',
          text: 'text-yellow-400',
          glow: 'shadow-yellow-500/20',
        };
      case 'red':
        return {
          bg: 'from-red-500/20 to-orange-500/20',
          border: 'border-red-500/30',
          text: 'text-red-400',
          glow: 'shadow-red-500/20',
        };
      default:
        return {
          bg: 'from-gray-500/20 to-slate-500/20',
          border: 'border-gray-500/30',
          text: 'text-gray-400',
          glow: 'shadow-gray-500/20',
        };
    }
  };

  const statusStyles = getStatusStyles(data.sybil_status.color);

  return (
    <div className="space-y-6">
      {/* Hero Card - Total Points */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#132D46] via-[#0A786A] to-[#01C38E] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />
        
        <div className="relative bg-[#12131a]/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left: Total Points */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#01C38E] animate-pulse" />
                  <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Points</span>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#01C38E] to-white bg-clip-text text-transparent">
                    {animatedTotal.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-lg">pts</span>
                </div>
                
                <p className="text-gray-500 mt-3 text-sm">
                  Keep earning through activity and engagement
                </p>
              </div>

              {/* Right: Account Status */}
              <div className={`bg-gradient-to-br ${statusStyles.bg} rounded-xl p-5 border ${statusStyles.border} min-w-[220px] shadow-lg ${statusStyles.glow}`}>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">Account Status</p>
                
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ProgressRing progress={data.sybil_status.multiplier * 100} size={72} strokeWidth={5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">{data.diversity_multiplier}x</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className={`font-semibold text-xl ${statusStyles.text}`}>
                      {data.sybil_status.label}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {data.sybil_status.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Points Breakdown Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pointsBreakdown.map((item, index) => (
          <div
            key={item.label}
            className={`group relative bg-gradient-to-br ${item.bgGradient} backdrop-blur-xl rounded-xl p-4 border ${item.borderColor} hover:border-white/20 transition-all duration-300 hover:-translate-y-1`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-3 shadow-lg`}>
              {item.icon}
            </div>
            
            {/* Label */}
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{item.label}</p>
            
            {/* Value */}
            <p className="text-2xl font-bold text-white">{item.value.toLocaleString()}</p>
            
            {/* Status indicator */}
            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${item.value > 0 ? 'bg-[#01C38E]' : 'bg-gray-600'}`} />
          </div>
        ))}
      </div>

      {/* Tip Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#132D46]/5 via-[#0A786A]/5 to-[#01C38E]/5 rounded-xl p-5 border border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0A786A]/20 to-[#01C38E]/20 flex items-center justify-center flex-shrink-0 border border-[#01C38E]/20">
            <svg className="w-5 h-5 text-[#01C38E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium mb-1">Improve Your Status</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your account status reflects your overall engagement with XyloNet. 
              Stay active, use multiple products, and maintain consistent activity to improve your status.
            </p>
          </div>
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-[#01C38E]/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
