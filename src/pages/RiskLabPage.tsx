import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
export function RiskLabPage() {
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Risk Laboratory</h1>
          <p className="text-muted-foreground">Mathematical frameworks for survival and growth.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Position Size Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Account Balance</Label>
                <Input type="number" defaultValue="10000" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Risk Percentage (%)</Label>
                  <Input type="number" defaultValue="1" />
                </div>
                <div className="space-y-2">
                  <Label>Stop Loss (Pips)</Label>
                  <Input type="number" defaultValue="20" />
                </div>
              </div>
              <Separator />
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Recommended Size</p>
                <p className="text-4xl font-black text-primary">0.50 Lots</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Kelly Criterion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Win Rate (%)</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Avg Win ($)</Label>
                  <Input type="number" defaultValue="200" />
                </div>
                <div className="space-y-2">
                  <Label>Avg Loss ($)</Label>
                  <Input type="number" defaultValue="100" />
                </div>
              </div>
              <Separator />
              <div className="pt-2 text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Kelly Multiplier</p>
                <p className="text-4xl font-black text-primary">0.25x</p>
                <p className="text-xs text-muted-foreground mt-2">Optimal fraction of capital to risk per trade.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}