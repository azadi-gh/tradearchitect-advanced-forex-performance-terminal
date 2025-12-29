import { Hono } from "hono";
import type { Env } from './core-utils';
import { JournalEntity, StrategyEntity, WatchlistEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { Trade, Strategy, Watchlist } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  const USER_ID = "default-user";
  app.get('/api/dashboard/stats', async (c) => {
    const journal = new JournalEntity(c.env, USER_ID);
    const stats = await journal.getStats();
    return ok(c, stats);
  });
  app.get('/api/insights', async (c) => {
    const journal = new JournalEntity(c.env, USER_ID);
    const insights = await journal.getInsights();
    return ok(c, insights);
  });
  app.get('/api/watchlist', async (c) => {
    const watchlist = new WatchlistEntity(c.env, USER_ID);
    const state = await watchlist.getState();
    return ok(c, state);
  });
  app.put('/api/watchlist', async (c) => {
    const body = await c.req.json() as Partial<Watchlist>;
    const watchlist = new WatchlistEntity(c.env, USER_ID);
    await watchlist.patch(body);
    return ok(c, await watchlist.getState());
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
      tags: trade.tags || [],
      checklistComplete: trade.checklistComplete || []
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
      checklist: data.checklist || [],
      createdAt: Date.now()
    });
    return ok(c, strategy);
  });
  app.put('/api/strategies/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json();
    const strategy = new StrategyEntity(c.env, id);
    if (!(await strategy.exists())) return notFound(c, 'Strategy not found');
    await strategy.patch(data);
    return ok(c, await strategy.getState());
  });
  app.delete('/api/strategies/:id', async (c) => {
    const id = c.req.param('id');
    const success = await StrategyEntity.delete(c.env, id);
    if (!success) return notFound(c, 'Strategy not found');
    return ok(c, { id });
  });
  // SYSTEM INTEGRITY ROUTES
  app.get('/api/system/export', async (c) => {
    const journal = await new JournalEntity(c.env, USER_ID).getState();
    const watchlist = await new WatchlistEntity(c.env, USER_ID).getState();
    const strategies = await StrategyEntity.list(c.env);
    const payload = {
      version: "2.0",
      timestamp: Date.now(),
      data: {
        journal,
        watchlist,
        strategies: strategies.items
      }
    };
    return ok(c, payload);
  });
  app.post('/api/system/snapshot', async (c) => {
    const journal = await new JournalEntity(c.env, USER_ID).getState();
    const watchlist = await new WatchlistEntity(c.env, USER_ID).getState();
    const strategies = await StrategyEntity.list(c.env);
    const snapshot = {
      timestamp: Date.now(),
      journal,
      watchlist,
      strategies: strategies.items
    };
    const doId = c.env.GlobalDurableObject.idFromName(`system:snapshot:${USER_ID}`);
    const stub = c.env.GlobalDurableObject.get(doId);
    // Fetch current document to get current version for CAS
    const current = await stub.getDoc<any>(`system:snapshot`);
    const version = current?.v ?? 0;
    await stub.casPut(`system:snapshot`, version, snapshot);
    return ok(c, { timestamp: snapshot.timestamp });
  });
  app.get('/api/system/status', async (c) => {
    const journal = await new JournalEntity(c.env, USER_ID).getState();
    const strategies = await StrategyEntity.list(c.env);
    const doId = c.env.GlobalDurableObject.idFromName(`system:snapshot:${USER_ID}`);
    const stub = c.env.GlobalDurableObject.get(doId);
    // Explicit generic type <any> to resolve TS2339 'Property data does not exist on type never'
    const lastSnapshotDoc = await stub.getDoc<any>(`system:snapshot`);
    return ok(c, {
      lastSnapshot: lastSnapshotDoc ? lastSnapshotDoc.data.timestamp : null,
      counts: {
        trades: journal?.trades?.length ?? 0,
        strategies: strategies?.items?.length ?? 0
      },
      healthy: true
    });
  });
}