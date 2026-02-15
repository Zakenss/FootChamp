import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertTournamentRegistrationSchema, insertGameMarrakechSchema, insertGameToulouseSchema, insertJoueurToulouseSchema } from "@shared/schema";

const ADMIN_USERNAME = "zakaria_sacha";
const ADMIN_PASSWORD = "Tiznit";
const ADMIN_TOKEN = "footchamp-admin-token-secure-2026";

function verifyAdminToken(req: any): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === ADMIN_TOKEN;
}

function normalizeIP(ip: string): string {
  if (!ip) return "";
  // Remove IPv6-mapped IPv4 prefix
  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }
  return ip;
}

function isPrivateIP(ip: string): boolean {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return true;
  }
  // Private IP ranges
  if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
    return true;
  }
  return false;
}

async function getLocationFromIP(ip: string): Promise<{ city: string | null; country: string | null }> {
  try {
    const normalizedIP = normalizeIP(ip);
    if (isPrivateIP(normalizedIP)) {
      return { city: null, country: null };
    }
    // Using HTTP endpoint (free tier only supports HTTP)
    const response = await fetch(`http://ip-api.com/json/${normalizedIP}?fields=city,country,status`);
    if (!response.ok) {
      return { city: null, country: null };
    }
    const data = await response.json();
    if (data.status === "success") {
      return { city: data.city || null, country: data.country || null };
    }
    return { city: null, country: null };
  } catch (err) {
    console.error("Geolocation error:", err);
    return { city: null, country: null };
  }
}

function getClientIP(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // Take first IP from chain (real client)
    const firstIP = forwarded.split(",")[0].trim();
    return normalizeIP(firstIP);
  }
  const ip = req.ip || req.connection?.remoteAddress || "";
  return normalizeIP(ip);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.leads.createToulouse.path, async (req, res) => {
    try {
      const input = api.leads.createToulouse.input.parse(req.body);
      const lead = await storage.createLeadToulouse(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.leads.createMarrakech.path, async (req, res) => {
    try {
      const input = api.leads.createMarrakech.input.parse(req.body);
      const lead = await storage.createLeadMarrakech(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post("/api/tournament/register", async (req, res) => {
    try {
      const parseResult = insertTournamentRegistrationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }
      const registration = await storage.createTournamentRegistration(parseResult.data);
      res.status(201).json(registration);
    } catch (err) {
      console.error("Error creating tournament registration:", err);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post("/api/joueur-toulouse", async (req, res) => {
    try {
      const parseResult = insertJoueurToulouseSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }
      const joueur = await storage.createJoueurToulouse(parseResult.data);
      res.status(201).json(joueur);
    } catch (err) {
      console.error("Error creating joueur:", err);
      res.status(500).json({ message: "Failed to create joueur" });
    }
  });

  app.post("/api/analytics/visit", async (req, res) => {
    try {
      const { page, visitorId } = req.body;
      if (!page || !["toulouse", "marrakech", "ramadan"].includes(page)) {
        return res.status(400).json({ message: "Invalid page" });
      }
      
      const clientIP = getClientIP(req);
      const location = await getLocationFromIP(clientIP);
      
      await storage.trackPageVisit(page, visitorId, location.city, location.country);
      res.status(201).json({ success: true });
    } catch (err) {
      console.error("Error tracking visit:", err);
      res.status(500).json({ message: "Failed to track visit" });
    }
  });

  app.get("/api/stats/:page", async (req, res) => {
    try {
      const { page } = req.params;
      if (!["toulouse", "marrakech", "ramadan"].includes(page)) {
        return res.status(400).json({ message: "Invalid page" });
      }
      const stats = await storage.getPageStats(page);
      res.json(stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_TOKEN });
      } else {
        res.status(401).json({ message: "Identifiants incorrects" });
      }
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Erreur de connexion" });
    }
  });

  // Toulouse games
  app.get("/api/games/toulouse", async (req, res) => {
    try {
      const games = await storage.getGamesToulouse();
      res.json(games);
    } catch (err) {
      console.error("Error fetching Toulouse games:", err);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post("/api/games/toulouse", async (req, res) => {
    try {
      if (!verifyAdminToken(req)) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      const parseResult = insertGameToulouseSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }
      const game = await storage.createGameToulouse(parseResult.data);
      res.status(201).json(game);
    } catch (err) {
      console.error("Error creating Toulouse game:", err);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.put("/api/games/toulouse/:id", async (req, res) => {
    try {
      if (!verifyAdminToken(req)) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      const parseResult = insertGameToulouseSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }
      const game = await storage.updateGameToulouse(id, parseResult.data);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (err) {
      console.error("Error updating Toulouse game:", err);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/games/toulouse/:id", async (req, res) => {
    try {
      if (!verifyAdminToken(req)) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      await storage.deleteGameToulouse(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting Toulouse game:", err);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  // Marrakech games
  app.get("/api/games/marrakech", async (req, res) => {
    try {
      const games = await storage.getGamesMarrakech();
      res.json(games);
    } catch (err) {
      console.error("Error fetching Marrakech games:", err);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post("/api/games/marrakech", async (req, res) => {
    try {
      if (!verifyAdminToken(req)) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      const parseResult = insertGameMarrakechSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }
      const game = await storage.createGameMarrakech(parseResult.data);
      res.status(201).json(game);
    } catch (err) {
      console.error("Error creating Marrakech game:", err);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  app.put("/api/games/marrakech/:id", async (req, res) => {
    try {
      if (!verifyAdminToken(req)) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      const parseResult = insertGameMarrakechSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: parseResult.error.flatten().fieldErrors 
        });
      }
      const game = await storage.updateGameMarrakech(id, parseResult.data);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (err) {
      console.error("Error updating Marrakech game:", err);
      res.status(500).json({ message: "Failed to update game" });
    }
  });

  app.delete("/api/games/marrakech/:id", async (req, res) => {
    try {
      if (!verifyAdminToken(req)) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid game ID" });
      }
      await storage.deleteGameMarrakech(id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting Marrakech game:", err);
      res.status(500).json({ message: "Failed to delete game" });
    }
  });

  return httpServer;
}
