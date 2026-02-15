import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leadsToulouse = pgTable("leads_toulouse", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  preferredDate: text("preferred_date").array(),
  preferredTimeSlot: text("preferred_time_slot").array(),
  matchType: text("match_type").array(),
  duration: text("duration").array(),
  additionalPlayers: text("additional_players"),
  level: text("level"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leadsMarrakech = pgTable("leads_marrakech", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  preferredDate: text("preferred_date").array(),
  preferredTimeSlot: text("preferred_time_slot").array(),
  matchType: text("match_type").array(),
  duration: text("duration").array(),
  additionalPlayers: text("additional_players"),
  level: text("level"),
  preferredPitch: text("preferred_pitch"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadToulouseSchema = createInsertSchema(leadsToulouse).pick({
  name: true,
  email: true,
  phone: true,
  preferredDate: true,
  preferredTimeSlot: true,
  matchType: true,
  duration: true,
  additionalPlayers: true,
  level: true,
});

export const insertLeadMarrakechSchema = createInsertSchema(leadsMarrakech).pick({
  name: true,
  email: true,
  phone: true,
  preferredDate: true,
  preferredTimeSlot: true,
  matchType: true,
  duration: true,
  additionalPlayers: true,
  level: true,
  preferredPitch: true,
});

export type LeadToulouse = typeof leadsToulouse.$inferSelect;
export type InsertLeadToulouse = z.infer<typeof insertLeadToulouseSchema>;
export type LeadMarrakech = typeof leadsMarrakech.$inferSelect;
export type InsertLeadMarrakech = z.infer<typeof insertLeadMarrakechSchema>;

export const pageVisits = pgTable("page_visits", {
  id: serial("id").primaryKey(),
  page: text("page").notNull(),
  visitorId: text("visitor_id"),
  city: text("city"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PageVisit = typeof pageVisits.$inferSelect;

export const tournamentRegistrations = pgTable("tournament_registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  teamSize: text("team_size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTournamentRegistrationSchema = createInsertSchema(tournamentRegistrations).pick({
  name: true,
  phone: true,
  teamSize: true,
});

export type TournamentRegistration = typeof tournamentRegistrations.$inferSelect;
export type InsertTournamentRegistration = z.infer<typeof insertTournamentRegistrationSchema>;

export const gamesMarrakech = pgTable("games_marrakech", {
  id: serial("id").primaryKey(),
  venue: text("venue").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  matchType: text("match_type").notNull(),
  price: integer("price").notNull(),
  status: text("status").notNull().default("available"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameMarrakechSchema = createInsertSchema(gamesMarrakech).pick({
  venue: true,
  date: true,
  time: true,
  matchType: true,
  price: true,
  status: true,
  displayOrder: true,
});

export type GameMarrakech = typeof gamesMarrakech.$inferSelect;
export type InsertGameMarrakech = z.infer<typeof insertGameMarrakechSchema>;

export const gamesToulouse = pgTable("games_toulouse", {
  id: serial("id").primaryKey(),
  venue: text("venue").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  matchType: text("match_type").notNull(),
  price: integer("price").notNull(),
  duration: text("duration"),
  status: text("status").notNull().default("available"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGameToulouseSchema = createInsertSchema(gamesToulouse).pick({
  venue: true,
  date: true,
  time: true,
  matchType: true,
  price: true,
  duration: true,
  status: true,
  displayOrder: true,
});

export type GameToulouse = typeof gamesToulouse.$inferSelect;
export type InsertGameToulouse = z.infer<typeof insertGameToulouseSchema>;

export const joueurToulouse = pgTable("joueur_toulouse", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  venue: text("venue").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  numberOfPersons: integer("number_of_persons").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJoueurToulouseSchema = createInsertSchema(joueurToulouse).pick({
  gameId: true,
  venue: true,
  date: true,
  time: true,
  name: true,
  phone: true,
  numberOfPersons: true,
});

export type JoueurToulouse = typeof joueurToulouse.$inferSelect;
export type InsertJoueurToulouse = z.infer<typeof insertJoueurToulouseSchema>;
