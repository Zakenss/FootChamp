import { db } from "./db";
import { eq, sql, desc, asc } from "drizzle-orm";
import { 
  leadsToulouse, leadsMarrakech, pageVisits, tournamentRegistrations, gamesMarrakech, gamesToulouse, joueurToulouse,
  type LeadToulouse, type InsertLeadToulouse,
  type LeadMarrakech, type InsertLeadMarrakech,
  type PageVisit,
  type TournamentRegistration, type InsertTournamentRegistration,
  type GameMarrakech, type InsertGameMarrakech,
  type GameToulouse, type InsertGameToulouse,
  type JoueurToulouse, type InsertJoueurToulouse
} from "@shared/schema";

export interface IStorage {
  createLeadToulouse(lead: InsertLeadToulouse): Promise<LeadToulouse>;
  createLeadMarrakech(lead: InsertLeadMarrakech): Promise<LeadMarrakech>;
  createTournamentRegistration(registration: InsertTournamentRegistration): Promise<TournamentRegistration>;
  trackPageVisit(page: string, visitorId?: string, city?: string | null, country?: string | null): Promise<PageVisit>;
  getPageStats(page: string): Promise<{
    totalVisits: number;
    uniqueVisitors: number;
    leadsCount: number;
    conversionRate: number;
    cityCounts: Record<string, number>;
  }>;
  createGameMarrakech(game: InsertGameMarrakech): Promise<GameMarrakech>;
  getGamesMarrakech(): Promise<GameMarrakech[]>;
  updateGameMarrakech(id: number, game: Partial<InsertGameMarrakech>): Promise<GameMarrakech>;
  deleteGameMarrakech(id: number): Promise<void>;
  createGameToulouse(game: InsertGameToulouse): Promise<GameToulouse>;
  getGamesToulouse(): Promise<GameToulouse[]>;
  updateGameToulouse(id: number, game: Partial<InsertGameToulouse>): Promise<GameToulouse>;
  deleteGameToulouse(id: number): Promise<void>;
  createJoueurToulouse(joueur: InsertJoueurToulouse): Promise<JoueurToulouse>;
}

export class DatabaseStorage implements IStorage {
  async createLeadToulouse(insertLead: InsertLeadToulouse): Promise<LeadToulouse> {
    const [lead] = await db.insert(leadsToulouse).values(insertLead).returning();
    return lead;
  }

  async createLeadMarrakech(insertLead: InsertLeadMarrakech): Promise<LeadMarrakech> {
    const [lead] = await db.insert(leadsMarrakech).values(insertLead).returning();
    return lead;
  }

  async createTournamentRegistration(registration: InsertTournamentRegistration): Promise<TournamentRegistration> {
    const [result] = await db.insert(tournamentRegistrations).values(registration).returning();
    return result;
  }

  async trackPageVisit(page: string, visitorId?: string, city?: string | null, country?: string | null): Promise<PageVisit> {
    const [visit] = await db.insert(pageVisits).values({ 
      page, 
      visitorId: visitorId || null,
      city: city || null,
      country: country || null
    }).returning();
    return visit;
  }

  async getPageStats(page: string): Promise<{
    totalVisits: number;
    uniqueVisitors: number;
    leadsCount: number;
    conversionRate: number;
    cityCounts: Record<string, number>;
  }> {
    const allVisits = await db.select().from(pageVisits).where(eq(pageVisits.page, page));
    const uniqueVisitorIds = new Set(allVisits.filter(v => v.visitorId).map(v => v.visitorId));
    
    let leadsCount = 0;
    if (page === "toulouse") {
      const leads = await db.select().from(leadsToulouse);
      leadsCount = leads.length;
    } else if (page === "marrakech") {
      const leads = await db.select().from(leadsMarrakech);
      leadsCount = leads.length;
    } else if (page === "ramadan") {
      const registrations = await db.select().from(tournamentRegistrations);
      leadsCount = registrations.length;
    }
    
    const cityCounts: Record<string, number> = {};
    for (const visit of allVisits) {
      const cityName = visit.city || "Unknown";
      cityCounts[cityName] = (cityCounts[cityName] || 0) + 1;
    }
    
    const totalVisits = allVisits.length;
    const conversionRate = totalVisits > 0 ? (leadsCount / totalVisits) * 100 : 0;
    
    return {
      totalVisits,
      uniqueVisitors: uniqueVisitorIds.size,
      leadsCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cityCounts,
    };
  }

  async createGameMarrakech(game: InsertGameMarrakech): Promise<GameMarrakech> {
    const [result] = await db.insert(gamesMarrakech).values(game).returning();
    return result;
  }

  async getGamesMarrakech(): Promise<GameMarrakech[]> {
    return await db.select().from(gamesMarrakech).orderBy(asc(gamesMarrakech.displayOrder), desc(gamesMarrakech.createdAt));
  }

  async updateGameMarrakech(id: number, game: Partial<InsertGameMarrakech>): Promise<GameMarrakech> {
    const [result] = await db.update(gamesMarrakech).set(game).where(eq(gamesMarrakech.id, id)).returning();
    return result;
  }

  async deleteGameMarrakech(id: number): Promise<void> {
    await db.delete(gamesMarrakech).where(eq(gamesMarrakech.id, id));
  }

  async createGameToulouse(game: InsertGameToulouse): Promise<GameToulouse> {
    const [result] = await db.insert(gamesToulouse).values(game).returning();
    return result;
  }

  async getGamesToulouse(): Promise<GameToulouse[]> {
    return await db.select().from(gamesToulouse).orderBy(asc(gamesToulouse.displayOrder), desc(gamesToulouse.createdAt));
  }

  async updateGameToulouse(id: number, game: Partial<InsertGameToulouse>): Promise<GameToulouse> {
    const [result] = await db.update(gamesToulouse).set(game).where(eq(gamesToulouse.id, id)).returning();
    return result;
  }

  async deleteGameToulouse(id: number): Promise<void> {
    await db.delete(gamesToulouse).where(eq(gamesToulouse.id, id));
  }

  async createJoueurToulouse(joueur: InsertJoueurToulouse): Promise<JoueurToulouse> {
    const [result] = await db.insert(joueurToulouse).values(joueur).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
