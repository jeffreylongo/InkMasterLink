import { 
  users, type User, type InsertUser,
  parlors, type Parlor, type InsertParlor,
  artists, type Artist, type InsertArtist,
  guestspots, type Guestspot, type InsertGuestspot,
  reviews, type Review, type InsertReview,
  schedules, type Schedule, type InsertSchedule,
  appointments, type Appointment, type InsertAppointment
} from "../shared/schema";
import { db } from "./db";
import { eq, like, or, and, desc, asc, sql, ilike } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Parlor methods
  getParlor(id: number): Promise<Parlor | undefined>;
  getAllParlors(limit?: number, offset?: number): Promise<Parlor[]>;
  searchParlors(searchTerm: string, limit?: number): Promise<Parlor[]>;
  getParlorsByState(state: string, limit?: number, offset?: number): Promise<Parlor[]>;
  getParlorsByCity(city: string, state: string, limit?: number, offset?: number): Promise<Parlor[]>;
  getFeaturedParlors(limit?: number): Promise<Parlor[]>;
  getSponsoredParlors(limit?: number): Promise<Parlor[]>;
  createParlor(parlor: InsertParlor): Promise<Parlor>;
  updateParlor(id: number, updates: Partial<InsertParlor>): Promise<Parlor | undefined>;
  deleteParlor(id: number): Promise<boolean>;
  
  // Artist methods
  getArtist(id: number): Promise<Artist | undefined>;
  getAllArtists(limit?: number, offset?: number): Promise<Artist[]>;
  searchArtists(searchTerm: string, limit?: number): Promise<Artist[]>;
  getFeaturedArtists(limit?: number): Promise<Artist[]>;
  getSponsoredArtists(limit?: number): Promise<Artist[]>;
  getTravelingArtists(limit?: number): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, updates: Partial<InsertArtist>): Promise<Artist | undefined>;
  deleteArtist(id: number): Promise<boolean>;
  
  // Guestspot methods
  getGuestspot(id: number): Promise<Guestspot | undefined>;
  getGuestspotsByParlor(parlorId: number): Promise<Guestspot[]>;
  getGuestspotsByArtist(artistId: number): Promise<Guestspot[]>;
  getOpenGuestspots(limit?: number): Promise<Guestspot[]>;
  getUpcomingGuestspots(limit?: number): Promise<Guestspot[]>;
  createGuestspot(guestspot: InsertGuestspot): Promise<Guestspot>;
  updateGuestspot(id: number, updates: Partial<InsertGuestspot>): Promise<Guestspot | undefined>;
  deleteGuestspot(id: number): Promise<boolean>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewsByTarget(targetId: number, targetType: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Schedule methods
  getSchedule(id: number): Promise<Schedule | undefined>;
  getArtistSchedule(artistId: number): Promise<Schedule[]>;
  getParlorSchedule(parlorId: number): Promise<Schedule[]>;
  getArtistAvailabilityOnDate(artistId: number, date: Date): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByArtist(artistId: number): Promise<Appointment[]>;
  getAppointmentsByClient(clientId: number): Promise<Appointment[]>;
  getAppointmentsByParlor(parlorId: number): Promise<Appointment[]>;
  getArtistAppointmentsInDateRange(artistId: number, startDate: Date, endDate: Date): Promise<Appointment[]>;
  getParlorAppointmentsInDateRange(parlorId: number, startDate: Date, endDate: Date): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  changeAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
}

// PostgreSQL database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Parlor methods
  async getParlor(id: number): Promise<Parlor | undefined> {
    const [parlor] = await db.select().from(parlors).where(eq(parlors.id, id));
    return parlor;
  }
  
  async getAllParlors(limit = 100, offset = 0): Promise<Parlor[]> {
    return db.select().from(parlors).limit(limit).offset(offset);
  }
  
  async searchParlors(searchTerm: string, limit = 100): Promise<Parlor[]> {
    return db.select()
      .from(parlors)
      .where(
        or(
          ilike(parlors.name, `%${searchTerm}%`),
          sql`${parlors.location}::jsonb->>'city' ILIKE ${`%${searchTerm}%`}`,
          sql`${parlors.location}::jsonb->>'state' ILIKE ${`%${searchTerm}%`}`,
          sql`${parlors.location}::jsonb->>'address' ILIKE ${`%${searchTerm}%`}`,
          sql`${parlors.location}::jsonb->>'postalCode' ILIKE ${`%${searchTerm}%`}`
        )
      )
      .limit(limit);
  }
  
  async getParlorsByState(state: string, limit = 100, offset = 0): Promise<Parlor[]> {
    return db.select()
      .from(parlors)
      .where(sql`${parlors.location}::jsonb->>'state' = ${state}`)
      .limit(limit)
      .offset(offset);
  }
  
  async getParlorsByCity(city: string, state: string, limit = 100, offset = 0): Promise<Parlor[]> {
    return db.select()
      .from(parlors)
      .where(
        and(
          sql`${parlors.location}::jsonb->>'city' ILIKE ${`%${city}%`}`,
          sql`${parlors.location}::jsonb->>'state' = ${state}`
        )
      )
      .limit(limit)
      .offset(offset);
  }
  
  async getFeaturedParlors(limit = 6): Promise<Parlor[]> {
    return db.select()
      .from(parlors)
      .where(eq(parlors.featured, true))
      .orderBy(desc(parlors.rating))
      .limit(limit);
  }
  
  async getSponsoredParlors(limit = 4): Promise<Parlor[]> {
    return db.select()
      .from(parlors)
      .where(eq(parlors.sponsored, true))
      .orderBy(desc(parlors.rating))
      .limit(limit);
  }
  
  async createParlor(parlor: InsertParlor): Promise<Parlor> {
    const [newParlor] = await db.insert(parlors).values(parlor).returning();
    return newParlor;
  }
  
  async updateParlor(id: number, updates: Partial<InsertParlor>): Promise<Parlor | undefined> {
    const [updatedParlor] = await db
      .update(parlors)
      .set(updates)
      .where(eq(parlors.id, id))
      .returning();
    return updatedParlor;
  }
  
  async deleteParlor(id: number): Promise<boolean> {
    const result = await db.delete(parlors).where(eq(parlors.id, id));
    return result.rowCount > 0;
  }
  
  // Artist methods
  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }
  
  async getAllArtists(limit = 100, offset = 0): Promise<Artist[]> {
    return db.select().from(artists).limit(limit).offset(offset);
  }
  
  async searchArtists(searchTerm: string, limit = 100): Promise<Artist[]> {
    return db.select()
      .from(artists)
      .where(
        or(
          ilike(artists.name, `%${searchTerm}%`),
          sql`${artists.specialty}::jsonb ?| array[${searchTerm}]`,
          sql`${artists.location}::jsonb->>'city' ILIKE ${`%${searchTerm}%`}`,
          sql`${artists.location}::jsonb->>'state' ILIKE ${`%${searchTerm}%`}`
        )
      )
      .limit(limit);
  }
  
  async getFeaturedArtists(limit = 6): Promise<Artist[]> {
    return db.select()
      .from(artists)
      .where(eq(artists.featured, true))
      .orderBy(desc(artists.rating))
      .limit(limit);
  }
  
  async getSponsoredArtists(limit = 4): Promise<Artist[]> {
    return db.select()
      .from(artists)
      .where(eq(artists.sponsored, true))
      .orderBy(desc(artists.rating))
      .limit(limit);
  }
  
  async getTravelingArtists(limit = 8): Promise<Artist[]> {
    return db.select()
      .from(artists)
      .where(sql`${artists.availability}::jsonb->>'travelWilling' = 'true'`)
      .orderBy(desc(artists.rating))
      .limit(limit);
  }
  
  async createArtist(artist: InsertArtist): Promise<Artist> {
    const [newArtist] = await db.insert(artists).values(artist).returning();
    return newArtist;
  }
  
  async updateArtist(id: number, updates: Partial<InsertArtist>): Promise<Artist | undefined> {
    const [updatedArtist] = await db
      .update(artists)
      .set(updates)
      .where(eq(artists.id, id))
      .returning();
    return updatedArtist;
  }
  
  async deleteArtist(id: number): Promise<boolean> {
    const result = await db.delete(artists).where(eq(artists.id, id));
    return result.rowCount > 0;
  }
  
  // Guestspot methods
  async getGuestspot(id: number): Promise<Guestspot | undefined> {
    const [guestspot] = await db.select().from(guestspots).where(eq(guestspots.id, id));
    return guestspot;
  }
  
  async getGuestspotsByParlor(parlorId: number): Promise<Guestspot[]> {
    return db.select()
      .from(guestspots)
      .where(eq(guestspots.parlorId, parlorId));
  }
  
  async getGuestspotsByArtist(artistId: number): Promise<Guestspot[]> {
    return db.select()
      .from(guestspots)
      .where(eq(guestspots.artistId, artistId));
  }
  
  async getOpenGuestspots(limit = 10): Promise<Guestspot[]> {
    return db.select()
      .from(guestspots)
      .where(eq(guestspots.status, 'open'))
      .orderBy(asc(guestspots.dateStart))
      .limit(limit);
  }
  
  async getUpcomingGuestspots(limit = 6): Promise<Guestspot[]> {
    const today = new Date();
    return db.select()
      .from(guestspots)
      .where(
        and(
          eq(guestspots.status, 'confirmed'),
          sql`${guestspots.dateStart} > ${today}`
        )
      )
      .orderBy(asc(guestspots.dateStart))
      .limit(limit);
  }
  
  async createGuestspot(guestspot: InsertGuestspot): Promise<Guestspot> {
    const [newGuestspot] = await db.insert(guestspots).values(guestspot).returning();
    return newGuestspot;
  }
  
  async updateGuestspot(id: number, updates: Partial<InsertGuestspot>): Promise<Guestspot | undefined> {
    const [updatedGuestspot] = await db
      .update(guestspots)
      .set(updates)
      .where(eq(guestspots.id, id))
      .returning();
    return updatedGuestspot;
  }
  
  async deleteGuestspot(id: number): Promise<boolean> {
    const result = await db.delete(guestspots).where(eq(guestspots.id, id));
    return result.rowCount > 0;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return db.select()
      .from(reviews)
      .where(eq(reviews.userId, userId));
  }
  
  async getReviewsByTarget(targetId: number, targetType: string): Promise<Review[]> {
    return db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.targetId, targetId),
          eq(reviews.targetType, targetType)
        )
      );
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    
    // Update target's rating
    await this.updateTargetRating(review.targetId, review.targetType);
    
    return newReview;
  }
  
  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [updatedReview] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    
    if (updatedReview) {
      // Update target's rating
      await this.updateTargetRating(updatedReview.targetId, updatedReview.targetType);
    }
    
    return updatedReview;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    // Get the review before deleting
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    
    if (!review) {
      return false;
    }
    
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    
    // Update target's rating
    await this.updateTargetRating(review.targetId, review.targetType);
    
    return result.rowCount > 0;
  }
  
  // Helper method to update target's rating
  private async updateTargetRating(targetId: number, targetType: string): Promise<void> {
    // Calculate average rating
    const avgResult = await db.select({
      avgRating: sql`AVG(${reviews.rating})::integer`,
      count: sql`COUNT(*)::integer`
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.targetId, targetId),
        eq(reviews.targetType, targetType)
      )
    );
    
    const avgRating = avgResult[0]?.avgRating || 0;
    const reviewCount = avgResult[0]?.count || 0;
    
    // Update the target's rating and review count
    if (targetType === 'artist') {
      await db.update(artists)
        .set({ 
          rating: avgRating,
          reviewCount: reviewCount
        })
        .where(eq(artists.id, targetId));
    } else if (targetType === 'parlor') {
      await db.update(parlors)
        .set({ 
          rating: avgRating,
          reviewCount: reviewCount
        })
        .where(eq(parlors.id, targetId));
    }
  }
  
  // Schedule methods
  async getSchedule(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule;
  }
  
  async getArtistSchedule(artistId: number): Promise<Schedule[]> {
    return db.select()
      .from(schedules)
      .where(eq(schedules.artistId, artistId))
      .orderBy(schedules.dayOfWeek, schedules.startTime);
  }
  
  async getParlorSchedule(parlorId: number): Promise<Schedule[]> {
    return db.select()
      .from(schedules)
      .where(eq(schedules.parlorId, parlorId))
      .orderBy(schedules.dayOfWeek, schedules.startTime);
  }
  
  async getArtistAvailabilityOnDate(artistId: number, date: Date): Promise<Schedule[]> {
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Get both recurring schedules for the day of week and specific schedules for the date
    return db.select()
      .from(schedules)
      .where(
        and(
          eq(schedules.artistId, artistId),
          or(
            and(
              eq(schedules.dayOfWeek, dayOfWeek),
              eq(schedules.isRecurring, true)
            ),
            sql`DATE(${schedules.specificDate}) = ${formattedDate}`
          ),
          eq(schedules.isAvailable, true)
        )
      )
      .orderBy(schedules.startTime);
  }
  
  async createSchedule(schedule: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db.insert(schedules).values(schedule).returning();
    return newSchedule;
  }
  
  async updateSchedule(id: number, updates: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const [updatedSchedule] = await db
      .update(schedules)
      .set(updates)
      .where(eq(schedules.id, id))
      .returning();
    return updatedSchedule;
  }
  
  async deleteSchedule(id: number): Promise<boolean> {
    const result = await db.delete(schedules).where(eq(schedules.id, id));
    return result.rowCount > 0;
  }
  
  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }
  
  async getAppointmentsByArtist(artistId: number): Promise<Appointment[]> {
    return db.select()
      .from(appointments)
      .where(eq(appointments.artistId, artistId))
      .orderBy(appointments.startTime);
  }
  
  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    return db.select()
      .from(appointments)
      .where(eq(appointments.clientId, clientId))
      .orderBy(appointments.startTime);
  }
  
  async getAppointmentsByParlor(parlorId: number): Promise<Appointment[]> {
    return db.select()
      .from(appointments)
      .where(eq(appointments.parlorId, parlorId))
      .orderBy(appointments.startTime);
  }
  
  async getArtistAppointmentsInDateRange(artistId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.artistId, artistId),
          sql`${appointments.startTime} >= ${startDate}`,
          sql`${appointments.endTime} <= ${endDate}`
        )
      )
      .orderBy(appointments.startTime);
  }
  
  async getParlorAppointmentsInDateRange(parlorId: number, startDate: Date, endDate: Date): Promise<Appointment[]> {
    return db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.parlorId, parlorId),
          sql`${appointments.startTime} >= ${startDate}`,
          sql`${appointments.endTime} <= ${endDate}`
        )
      )
      .orderBy(appointments.startTime);
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }
  
  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount > 0;
  }
  
  async changeAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }
}

// Export a singleton instance of DatabaseStorage
export const storage = new DatabaseStorage();