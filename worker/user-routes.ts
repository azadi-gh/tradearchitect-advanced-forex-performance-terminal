import { Hono } from "hono";
import type { Env } from './core-utils';
import { JournalEntity, StrategyEntity } from "./entities";
import { ok, bad, isStr } from './core-utils';
import type { Trade, Strategy } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // DASHBOARD
  app.get('/api/dashboard/stats', async (c) => {
    const journal = new JournalEntity(c.env, "default-user");
    const stats = await journal.getStats();
    return ok(c, stats);
  });
  // JOURNAL
  app.get('/api/journal/trades', async (c) => {
    const journal = new JournalEntity(c.env, "default-user");
    const state = await journal.getState();
    return ok(c, state.trades);
  });
  app.post('/api/journal/trades', async (c) => {
    const trade = (await c.req.json()) as Trade;
    if (!trade.symbol) return bad(c, 'Symbol is required');
    const journal = new JournalEntity(c.env, "default-user");
    const saved = await journal.addTrade({
      ...trade,
      id: crypto.randomUUID(),
      entryTime: Date.now()
    });
    return ok(c, saved);
  });
  // STRATEGIES
  app.get('/api/strategies', async (c) => {
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