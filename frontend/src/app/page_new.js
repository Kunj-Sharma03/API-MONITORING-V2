'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DarkVeil from '@/components/background/DarkVeil';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CardSwap, { Card } from '@/components/ui/cardSwap';
import { ArrowRight, Monitor, Shield, BarChart3, Eye, AlertTriangle, Zap, Clock, Users, Database, Mail, Code, Activity, Bell } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#111111] text-white overflow-x-hidden">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-black/20 z-50">
        <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#44ff44] transition-all duration-300 ease-out" 
             style={{width: `${scrollProgress}%`}}></div>
      </div>

      {/* DarkVeil Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <DarkVeil
          hueShift={120}
          noiseIntensity={0.1}
          scanlineIntensity={0.0}
          speed={0.6}
          scanlineFrequency={0}
          warpAmount={0.2}
          resolutionScale={1.0}
        />
      </div>

      {/* Navigation */}
      <ScrollReveal>
        <nav className="relative z-20 glass-morphism border-b border-[#00ff88]/20">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-[#00ff88]/20 to-[#44ff44]/20 backdrop-blur-sm rounded-lg border border-[#00ff88]/30">
                <Eye className="w-6 h-6 text-[#00ff88]" />
              </div>
              <span className="text-2xl font-bold text-white font-nineties tracking-tight">
                EY3-API
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="hidden sm:block px-4 py-2 text-[#00ff88] hover:text-white transition-colors font-genz-accent font-medium">
                Sign In
              </Link>
              <Link href="/register" className="retro-button px-6 py-2 rounded-lg font-genz-primary font-semibold">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </ScrollReveal>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <ScrollReveal delay={200}>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white font-nineties leading-tight tracking-tight">
              EY3-API
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={400}>
            <p className="text-xl sm:text-2xl text-[#00ff88] font-genz-accent font-medium">
              Neural API Monitoring System
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={600}>
            <p className="text-lg sm:text-xl text-gray-300 font-genz-primary max-w-2xl mx-auto leading-relaxed">
              Real-time surveillance, intelligent alerts, and comprehensive analytics for your API infrastructure.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={800}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/register" className="retro-button px-8 py-4 rounded-lg font-genz-display font-bold text-lg">
                Start Monitoring
              </Link>
              <Link href="/dashboard" className="px-8 py-4 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all rounded-lg font-genz-primary font-semibold">
                View Demo
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section with CardSwap */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal delay={200}>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-nineties mb-4">
                Core Features
              </h2>
              <p className="text-lg text-gray-300 font-genz-primary max-w-2xl mx-auto">
                Everything you need to monitor and optimize your API performance
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CardSwap className="h-64">
                <Card className="glass-morphism p-6 border border-[#00ff88]/20 rounded-xl">
                  <div className="space-y-4">
                    <div className="p-3 bg-[#00ff88]/10 rounded-lg w-fit">
                      <Activity className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-genz-display">
                      Real-time Monitoring
                    </h3>
                    <p className="text-gray-300 font-genz-primary">
                      Track API performance, response times, and uptime with millisecond precision.
                    </p>
                  </div>
                </Card>
                <Card className="glass-morphism p-6 border border-[#00ff88]/20 rounded-xl">
                  <div className="space-y-4">
                    <div className="p-3 bg-[#00ff88]/10 rounded-lg w-fit">
                      <BarChart3 className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-genz-display">
                      Advanced Analytics
                    </h3>
                    <p className="text-gray-300 font-genz-primary">
                      Deep insights into API usage patterns, trends, and performance metrics.
                    </p>
                  </div>
                </Card>
              </CardSwap>

              <CardSwap className="h-64">
                <Card className="glass-morphism p-6 border border-[#00ff88]/20 rounded-xl">
                  <div className="space-y-4">
                    <div className="p-3 bg-[#00ff88]/10 rounded-lg w-fit">
                      <Bell className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-genz-display">
                      Smart Alerts
                    </h3>
                    <p className="text-gray-300 font-genz-primary">
                      Intelligent notifications for downtime, performance issues, and anomalies.
                    </p>
                  </div>
                </Card>
                <Card className="glass-morphism p-6 border border-[#00ff88]/20 rounded-xl">
                  <div className="space-y-4">
                    <div className="p-3 bg-[#00ff88]/10 rounded-lg w-fit">
                      <Shield className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-genz-display">
                      Security Monitoring
                    </h3>
                    <p className="text-gray-300 font-genz-primary">
                      Detect and prevent security threats, rate limit violations, and attacks.
                    </p>
                  </div>
                </Card>
              </CardSwap>

              <CardSwap className="h-64">
                <Card className="glass-morphism p-6 border border-[#00ff88]/20 rounded-xl">
                  <div className="space-y-4">
                    <div className="p-3 bg-[#00ff88]/10 rounded-lg w-fit">
                      <Code className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-genz-display">
                      Easy Integration
                    </h3>
                    <p className="text-gray-300 font-genz-primary">
                      Simple setup with RESTful APIs, webhooks, and popular frameworks.
                    </p>
                  </div>
                </Card>
                <Card className="glass-morphism p-6 border border-[#00ff88]/20 rounded-xl">
                  <div className="space-y-4">
                    <div className="p-3 bg-[#00ff88]/10 rounded-lg w-fit">
                      <Database className="w-8 h-8 text-[#00ff88]" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-genz-display">
                      Data Insights
                    </h3>
                    <p className="text-gray-300 font-genz-primary">
                      Comprehensive data collection and analysis for informed decisions.
                    </p>
                  </div>
                </Card>
              </CardSwap>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal delay={200}>
            <div className="glass-morphism p-8 sm:p-12 rounded-2xl border border-[#00ff88]/20">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[#00ff88] font-nineties mb-2">
                    99.9%
                  </div>
                  <div className="text-gray-300 font-genz-primary">
                    Uptime
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[#00ff88] font-nineties mb-2">
                    &lt;100ms
                  </div>
                  <div className="text-gray-300 font-genz-primary">
                    Response
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[#00ff88] font-nineties mb-2">
                    24/7
                  </div>
                  <div className="text-gray-300 font-genz-primary">
                    Monitoring
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[#00ff88] font-nineties mb-2">
                    1000+
                  </div>
                  <div className="text-gray-300 font-genz-primary">
                    APIs Tracked
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal delay={200}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-nineties mb-6">
              Ready to Monitor?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 font-genz-primary mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust EY3-API for their monitoring needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register" className="retro-button px-8 py-4 rounded-lg font-genz-display font-bold text-lg">
                Start Free Trial
              </Link>
              <Link href="/dashboard" className="px-8 py-4 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 transition-all rounded-lg font-genz-primary font-semibold">
                View Documentation
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-[#00ff88]/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <div className="p-2 bg-gradient-to-br from-[#00ff88]/20 to-[#44ff44]/20 backdrop-blur-sm rounded-lg border border-[#00ff88]/30">
                <Eye className="w-5 h-5 text-[#00ff88]" />
              </div>
              <span className="text-xl font-bold text-white font-nineties">
                EY3-API
              </span>
            </div>
            <div className="text-gray-400 font-genz-primary">
              © 2025 EY3-API. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
