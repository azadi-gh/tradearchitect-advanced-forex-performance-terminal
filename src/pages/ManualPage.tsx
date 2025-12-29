import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Terminal, ShieldCheck, Target, Calculator, Globe, Server, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
export function ManualPage() {
  const sections = [
    {
      title: "Terminal Overview",
      icon: Terminal,
      content: "TradeArchitect is a professional-grade Forex performance terminal. It operates as a local Truth Source for your trading journal, providing deep analytics without requiring live broker credentials."
    },
    {
      title: "Strategy Architecture",
      icon: Target,
      content: "Define custom protocols in the Strategy Vault. Every trade can be pinned to a protocol, enabling the terminal to track 'Strategy Drift' and performance by system edge."
    },
    {
      title: "Risk Laboratory",
      icon: Calculator,
      content: "Use the Kelly Optimizer and Monte Carlo simulator to project account growth. These tools help you understand the probability of ruin and the geometric growth potential of your win rate."
    },
    {
      title: "ICT Session Intelligence",
      icon: Globe,
      content: "The Command Center features a real-time ICT Killzone monitor. This system automatically adjusts to your timezone (Tehran/UTC auto-detected) and highlights active high-volatility windows."
    },
    {
      title: "System Integrity",
      icon: ShieldCheck,
      content: "Data is persisted via Cloudflare Durable Objects. Use the Dashboard 'Snapshot' button to create point-in-time recovery blocks, or 'Export' to download your entire ledger as a JSON file."
    },
    {
      title: "Behavioral Analysis",
      icon: UserCheck,
      content: "The Psychology Engine monitors for 'Friday Fatigue' and 'Asset Friction'. It scores your execution protocol to ensure you stay disciplined within your defined strategy parameters."
    }
  ];
  return (
    <AppLayout container>
      <div className="max-w-4xl mx-auto space-y-12 py-12 md:py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Terminal Manual v2.0</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-foreground">Operational Protocol</h1>
          <p className="text-muted-foreground font-medium text-lg">Your guide to mastering the architecture of execution.</p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full border-2 hover:border-primary/30 transition-all group overflow-hidden bg-card/40 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-3 rounded-2xl bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-black uppercase tracking-widest">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <Card className="border-2 bg-slate-900 border-slate-800 text-white p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="space-y-4 flex-1">
              <h3 className="text-xl font-black uppercase tracking-tight">Regional Protocol: Tehran/UTC</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                The terminal includes specialized logic for Persian traders. Timezones are automatically localized to <b>Asia/Tehran</b> if detected, or synchronized to <b>UTC</b> for standard ICT killzone alignment. You can switch these protocols in the global header.
              </p>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 Active Synchronization: Tehran (GMT+3:30)
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 shrink-0">
               <Server className="h-12 w-12 text-blue-400" />
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}