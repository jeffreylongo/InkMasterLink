import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, text, boolean, integer, timestamp, jsonb, time } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  created: timestamp('created').notNull().defaultNow(),
  profile: jsonb('profile').notNull().default({})
});

// Parlors/Shops table
export const parlors = pgTable('parlors', {
  id: serial('id').primaryKey(),
  originalId: varchar('original_id', { length: 100 }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: integer('owner_id').references(() => users.id),
  images: jsonb('images').notNull().default([]),
  featuredImage: varchar('featured_image', { length: 255 }),
  featured: boolean('featured').notNull().default(false),
  sponsored: boolean('sponsored').notNull().default(false),
  location: jsonb('location').notNull().default({}),
  contact: jsonb('contact').notNull().default({}),
  social: jsonb('social').notNull().default({}),
  hours: jsonb('hours').notNull().default({}),
  amenities: jsonb('amenities').notNull().default([]),
  rating: integer('rating').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow()
});

// Artists table
export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  specialty: jsonb('specialty').notNull().default([]),
  experienceYears: integer('experience_years'),
  profileImage: varchar('profile_image', { length: 255 }),
  images: jsonb('images').notNull().default([]),
  featured: boolean('featured').notNull().default(false),
  sponsored: boolean('sponsored').notNull().default(false),
  portfolio: jsonb('portfolio').notNull().default([]),
  location: jsonb('location').notNull().default({}),
  social: jsonb('social').notNull().default({}),
  availability: jsonb('availability').notNull().default({}),
  rating: integer('rating').notNull().default(0),
  reviewCount: integer('review_count').notNull().default(0),
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow()
});

// Guestspots table
export const guestspots = pgTable('guestspots', {
  id: serial('id').primaryKey(),
  parlorId: integer('parlor_id').references(() => parlors.id).notNull(),
  artistId: integer('artist_id').references(() => artists.id),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  dateStart: timestamp('date_start').notNull(),
  dateEnd: timestamp('date_end').notNull(),
  description: text('description'),
  requirements: text('requirements'),
  priceInfo: text('price_info'),
  applicants: jsonb('applicants').notNull().default([]),
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow()
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  targetId: integer('target_id').notNull(),
  targetType: varchar('target_type', { length: 20 }).notNull(),
  rating: integer('rating').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow()
});

// Schedule availability table
export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').references(() => artists.id).notNull(),
  parlorId: integer('parlor_id').references(() => parlors.id),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 (Sunday-Saturday)
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  isRecurring: boolean('is_recurring').notNull().default(true),
  specificDate: timestamp('specific_date'), // For non-recurring availability
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow()
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').references(() => users.id).notNull(),
  artistId: integer('artist_id').references(() => artists.id).notNull(),
  parlorId: integer('parlor_id').references(() => parlors.id).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  serviceType: varchar('service_type', { length: 100 }).notNull(),
  description: text('description'),
  notes: text('notes'),
  deposit: integer('deposit'),
  price: integer('price'),
  referenceImages: jsonb('reference_images').notNull().default([]),
  created: timestamp('created').notNull().defaultNow(),
  updated: timestamp('updated').notNull().defaultNow()
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  artists: many(artists),
  reviews: many(reviews),
  appointments: many(appointments, { relationName: 'clientAppointments' })
}));

export const parlorsRelations = relations(parlors, ({ many, one }) => ({
  guestspots: many(guestspots),
  owner: one(users, {
    fields: [parlors.ownerId],
    references: [users.id]
  }),
  schedules: many(schedules),
  appointments: many(appointments)
}));

export const artistsRelations = relations(artists, ({ many, one }) => ({
  user: one(users, {
    fields: [artists.userId],
    references: [users.id]
  }),
  guestspots: many(guestspots),
  schedules: many(schedules),
  appointments: many(appointments, { relationName: 'artistAppointments' })
}));

export const guestspotsRelations = relations(guestspots, ({ one }) => ({
  parlor: one(parlors, {
    fields: [guestspots.parlorId],
    references: [parlors.id]
  }),
  artist: one(artists, {
    fields: [guestspots.artistId],
    references: [artists.id]
  })
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  })
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  artist: one(artists, {
    fields: [schedules.artistId],
    references: [artists.id]
  }),
  parlor: one(parlors, {
    fields: [schedules.parlorId],
    references: [parlors.id]
  })
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
    relationName: 'clientAppointments'
  }),
  artist: one(artists, {
    fields: [appointments.artistId],
    references: [artists.id],
    relationName: 'artistAppointments'
  }),
  parlor: one(parlors, {
    fields: [appointments.parlorId],
    references: [parlors.id]
  })
}));

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Parlor = typeof parlors.$inferSelect;
export type InsertParlor = typeof parlors.$inferInsert;

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = typeof artists.$inferInsert;

export type Guestspot = typeof guestspots.$inferSelect;
export type InsertGuestspot = typeof guestspots.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;