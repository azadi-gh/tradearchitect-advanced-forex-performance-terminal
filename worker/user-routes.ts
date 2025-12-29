import { Hono } from "hono";
import type { Env } from './core-utils';
import { JournalEntity, StrategyEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Trade, Strategy } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const USER_ID = "default-user";
  app.get('/api/dashboard/stats', async (c) => {
    const journal = new JournalEntity(c.env, USER_ID);
    const stats = await journal.getStats();
    return ok(c, stats);
  });
  app.get('/api/journal/stats/strategies', async (c) => {
    const journal = new JournalEntity(c.env, USER_ID);
    const stats = await journal.getStrategyPerformance(c.env);
    return ok(c, stats);
  });
  app.get('/api/journal/trades', async (c) => {
    const journal = new JournalEntity(c.env, USER_ID);
    const state = await journal.getState();
    return ok(c, state.trades);
  });
  app.post('/api/journal/trades', async (c) => {
    const trade = (await c.req.json()) as Trade;
    if (!trade.symbol) return bad(c, 'Symbol is required');
    const journal = new JournalEntity(c.env, USER_ID);
    const saved = await journal.addTrade({
      ...trade,
      id: crypto.randomUUID(),
      entryTime: trade.entryTime || Date.now(),
      status: trade.status || 'OPEN',
      tags: trade.tags || []
    });
    return ok(c, saved);
  });
  app.put('/api/journal/trades/:id', async (c) => {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const journal = new JournalEntity(c.env, USER_ID);
    const updated = await journal.updateTrade(id, updates);
    if (!updated) return notFound(c, 'Trade not found');
    return ok(c, updated);
  });
  app.delete('/api/journal/trades/:id', async (c) => {
    const id = c.req.param('id');
    const journal = new JournalEntity(c.env, USER_ID);
    const success = await journal.deleteTrade(id);
    if (!success) return notFound(c, 'Trade not found');
    return ok(c, { id });
  });
  app.get('/api/strategies', async (c) => {
    await StrategyEntity.ensureSeed(c.env);
    const list = await StrategyEntity.list(c.env);
    return ok(c, list.items);
  });
  app.post('/api/strategies', async (c) => {
    const data = (await c.req.json()) as Partial<Strategy>;
    if (!data.name) return bad(c, 'Name is required');
    const strategy = await StrategyEntity.create(c.env, {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description || "",
      createdAt: Date.now()
    });
    return ok(c, strategy);
  });
}