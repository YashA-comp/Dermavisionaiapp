import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-de0fc9cb/health", (c) => {
  return c.json({ status: "ok" });
});

// Create a new scan
app.post("/make-server-de0fc9cb/scans", async (c) => {
  try {
    const body = await c.req.json();
    const { image_url, symptoms, ai_prediction, risk_score, status, status_label, status_color } = body;

    // Generate a unique ID for this scan
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create scan object with all data
    const scanData = {
      id: scanId,
      created_at: new Date().toISOString(),
      image_url,
      symptoms,
      ai_prediction: ai_prediction || 'Pending Analysis',
      risk_score: risk_score || 0,
      status: status || 'pending',
      status_label: status_label || '',
      status_color: status_color || ''
    };

    // Save to KV store
    await kv.set(scanId, scanData);

    return c.json({ success: true, data: scanData });
  } catch (err: any) {
    console.log('Error creating scan:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Get all scans
app.get("/make-server-de0fc9cb/scans", async (c) => {
  try {
    // Get all scans using prefix
    const scans = await kv.getByPrefix('scan_');

    // Sort by created_at descending
    scans.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return c.json({ success: true, data: scans });
  } catch (err: any) {
    console.log('Error fetching scans:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Get a specific scan
app.get("/make-server-de0fc9cb/scans/:id", async (c) => {
  try {
    const id = c.req.param('id');
    
    const scan = await kv.get(id);

    if (!scan) {
      return c.json({ error: 'Scan not found' }, 404);
    }

    return c.json({ success: true, data: scan });
  } catch (err: any) {
    console.log('Error fetching scan:', err);
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);