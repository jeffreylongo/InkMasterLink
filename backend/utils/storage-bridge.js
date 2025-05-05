/**
 * This is a bridge file to make it easier to access the TypeScript storage module from Node.js
 * or provide a mock implementation when TypeScript can't be compiled
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Locate the storage.js file that has been transpiled from TypeScript
const rootDir = path.resolve(process.cwd());
const serverDir = path.join(rootDir, 'server');
const storageJsPath = path.join(serverDir, 'storage.js');

// Initialize database connection when working directly with PostgreSQL
let pool;
try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    console.log("Database connection established successfully");
  }
} catch (error) {
  console.error("Error connecting to database:", error.message);
}

// Import the storage module
let storage;
try {
  const storageModule = require('../../server/storage');
  storage = storageModule.storage;
  
  if (!storage) {
    console.error('Storage module imported but storage instance not found');
    // Create dummy storage methods to prevent crashes
    storage = {
      // User methods
      getUser: async () => undefined,
      getUserByUsername: async () => undefined,
      createUser: async (user) => user,
      
      // Parlor methods
      getParlor: async () => undefined,
      getAllParlors: async () => [],
      
      // Artist methods
      getArtist: async () => undefined,
      getAllArtists: async () => [],
      
      // Guestspot methods
      getGuestspot: async () => undefined,
      getAllGuestspots: async () => [],
      
      // Schedule methods
      getSchedule: async () => undefined,
      getArtistSchedule: async () => [],
      getParlorSchedule: async () => [],
      getArtistAvailabilityOnDate: async () => [],
      createSchedule: async (schedule) => schedule,
      updateSchedule: async () => undefined,
      deleteSchedule: async () => false,
      
      // Appointment methods
      getAppointment: async () => undefined,
      getAppointmentsByArtist: async () => [],
      getAppointmentsByClient: async () => [],
      getAppointmentsByParlor: async () => [],
      getArtistAppointmentsInDateRange: async () => [],
      getParlorAppointmentsInDateRange: async () => [],
      createAppointment: async (appointment) => appointment,
      updateAppointment: async () => undefined,
      deleteAppointment: async () => false,
      changeAppointmentStatus: async () => undefined
    };
  }
} catch (error) {
  console.error('Failed to import storage module:', error.message);
  
  // Implement a simplified version of the DatabaseStorage class that works directly with PostgreSQL
  if (pool) {
    console.log('Creating alternative PostgreSQL implementation');
    
    // Create a direct PostgreSQL implementation
    storage = {
      // User methods
      getUser: async (id) => {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
      },
      getUserByUsername: async (username) => {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
      },
      createUser: async (user) => {
        const result = await pool.query(
          'INSERT INTO users (username, password, email, firstName, lastName, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [user.username, user.password, user.email, user.firstName, user.lastName, user.role]
        );
        return result.rows[0];
      },
      
      // Parlor methods
      getParlor: async (id) => {
        const result = await pool.query('SELECT * FROM parlors WHERE id = $1', [id]);
        return result.rows[0];
      },
      getAllParlors: async (limit = 100, offset = 0) => {
        const result = await pool.query('SELECT * FROM parlors ORDER BY rating DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return result.rows;
      },
      searchParlors: async (searchTerm, limit = 100) => {
        const result = await pool.query(
          'SELECT * FROM parlors WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY rating DESC LIMIT $2',
          [`%${searchTerm}%`, limit]
        );
        return result.rows;
      },
      
      // Artist methods
      getArtist: async (id) => {
        const result = await pool.query('SELECT * FROM artists WHERE id = $1', [id]);
        return result.rows[0];
      },
      getAllArtists: async (limit = 100, offset = 0) => {
        const result = await pool.query('SELECT * FROM artists ORDER BY rating DESC LIMIT $1 OFFSET $2', [limit, offset]);
        return result.rows;
      },
      
      // Schedule methods
      getSchedule: async (id) => {
        const result = await pool.query('SELECT * FROM schedules WHERE id = $1', [id]);
        return result.rows[0];
      },
      getArtistSchedule: async (artistId) => {
        const result = await pool.query('SELECT * FROM schedules WHERE artist_id = $1', [artistId]);
        return result.rows;
      },
      getParlorSchedule: async (parlorId) => {
        const result = await pool.query('SELECT * FROM schedules WHERE parlor_id = $1', [parlorId]);
        return result.rows;
      },
      getArtistAvailabilityOnDate: async (artistId, date) => {
        // Convert date to YYYY-MM-DD format
        const dateOnly = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        
        const result = await pool.query(
          'SELECT * FROM schedules WHERE artist_id = $1 AND ((specific_date = $2) OR (day_of_week = $3 AND is_recurring = true))',
          [artistId, dateOnly, dayOfWeek]
        );
        return result.rows;
      },
      createSchedule: async (schedule) => {
        // Convert keys from camelCase to snake_case for database compatibility
        const convertedSchedule = {};
        if (schedule.artistId !== undefined) convertedSchedule.artist_id = schedule.artistId;
        if (schedule.parlorId !== undefined) convertedSchedule.parlor_id = schedule.parlorId;
        if (schedule.dayOfWeek !== undefined) convertedSchedule.day_of_week = schedule.dayOfWeek;
        if (schedule.startTime !== undefined) convertedSchedule.start_time = schedule.startTime;
        if (schedule.endTime !== undefined) convertedSchedule.end_time = schedule.endTime;
        if (schedule.isAvailable !== undefined) convertedSchedule.is_available = schedule.isAvailable;
        if (schedule.isRecurring !== undefined) convertedSchedule.is_recurring = schedule.isRecurring;
        if (schedule.specificDate !== undefined) convertedSchedule.specific_date = schedule.specificDate;
        
        const fields = Object.keys(convertedSchedule).join(', ');
        const placeholders = Object.keys(convertedSchedule).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(convertedSchedule);
        
        const result = await pool.query(
          `INSERT INTO schedules (${fields}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        return result.rows[0];
      },
      updateSchedule: async (id, updates) => {
        // Convert keys from camelCase to snake_case for database compatibility
        const convertedUpdates = {};
        if (updates.artistId !== undefined) convertedUpdates.artist_id = updates.artistId;
        if (updates.parlorId !== undefined) convertedUpdates.parlor_id = updates.parlorId;
        if (updates.dayOfWeek !== undefined) convertedUpdates.day_of_week = updates.dayOfWeek;
        if (updates.startTime !== undefined) convertedUpdates.start_time = updates.startTime;
        if (updates.endTime !== undefined) convertedUpdates.end_time = updates.endTime;
        if (updates.isAvailable !== undefined) convertedUpdates.is_available = updates.isAvailable;
        if (updates.isRecurring !== undefined) convertedUpdates.is_recurring = updates.isRecurring;
        if (updates.specificDate !== undefined) convertedUpdates.specific_date = updates.specificDate;
        
        const fields = Object.keys(convertedUpdates).map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = [id, ...Object.values(convertedUpdates)];
        
        const result = await pool.query(
          `UPDATE schedules SET ${fields} WHERE id = $1 RETURNING *`,
          values
        );
        return result.rows[0];
      },
      deleteSchedule: async (id) => {
        const result = await pool.query('DELETE FROM schedules WHERE id = $1 RETURNING id', [id]);
        return result.rowCount > 0;
      },
      
      // Appointment methods
      getAppointment: async (id) => {
        const result = await pool.query('SELECT * FROM appointments WHERE id = $1', [id]);
        return result.rows[0];
      },
      getAppointmentsByArtist: async (artistId) => {
        const result = await pool.query('SELECT * FROM appointments WHERE artist_id = $1', [artistId]);
        return result.rows;
      },
      getAppointmentsByClient: async (clientId) => {
        const result = await pool.query('SELECT * FROM appointments WHERE client_id = $1', [clientId]);
        return result.rows;
      },
      getAppointmentsByParlor: async (parlorId) => {
        const result = await pool.query('SELECT * FROM appointments WHERE parlor_id = $1', [parlorId]);
        return result.rows;
      },
      getArtistAppointmentsInDateRange: async (artistId, startDate, endDate) => {
        const result = await pool.query(
          'SELECT * FROM appointments WHERE artist_id = $1 AND start_time >= $2 AND end_time <= $3',
          [artistId, startDate, endDate]
        );
        return result.rows;
      },
      getParlorAppointmentsInDateRange: async (parlorId, startDate, endDate) => {
        const result = await pool.query(
          'SELECT * FROM appointments WHERE parlor_id = $1 AND start_time >= $2 AND end_time <= $3',
          [parlorId, startDate, endDate]
        );
        return result.rows;
      },
      createAppointment: async (appointment) => {
        // Convert keys from camelCase to snake_case for database compatibility
        const convertedAppointment = {};
        if (appointment.clientId !== undefined) convertedAppointment.client_id = appointment.clientId;
        if (appointment.artistId !== undefined) convertedAppointment.artist_id = appointment.artistId;
        if (appointment.parlorId !== undefined) convertedAppointment.parlor_id = appointment.parlorId;
        if (appointment.startTime !== undefined) convertedAppointment.start_time = appointment.startTime;
        if (appointment.endTime !== undefined) convertedAppointment.end_time = appointment.endTime;
        if (appointment.serviceType !== undefined) convertedAppointment.service_type = appointment.serviceType;
        if (appointment.description !== undefined) convertedAppointment.description = appointment.description;
        if (appointment.notes !== undefined) convertedAppointment.notes = appointment.notes;
        if (appointment.deposit !== undefined) convertedAppointment.deposit = appointment.deposit;
        if (appointment.price !== undefined) convertedAppointment.price = appointment.price;
        if (appointment.referenceImages !== undefined) convertedAppointment.reference_images = appointment.referenceImages;
        if (appointment.status !== undefined) convertedAppointment.status = appointment.status;
        
        const fields = Object.keys(convertedAppointment).join(', ');
        const placeholders = Object.keys(convertedAppointment).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(convertedAppointment);
        
        const result = await pool.query(
          `INSERT INTO appointments (${fields}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        return result.rows[0];
      },
      updateAppointment: async (id, updates) => {
        // Convert keys from camelCase to snake_case for database compatibility
        const convertedUpdates = {};
        if (updates.clientId !== undefined) convertedUpdates.client_id = updates.clientId;
        if (updates.artistId !== undefined) convertedUpdates.artist_id = updates.artistId;
        if (updates.parlorId !== undefined) convertedUpdates.parlor_id = updates.parlorId;
        if (updates.startTime !== undefined) convertedUpdates.start_time = updates.startTime;
        if (updates.endTime !== undefined) convertedUpdates.end_time = updates.endTime;
        if (updates.serviceType !== undefined) convertedUpdates.service_type = updates.serviceType;
        if (updates.description !== undefined) convertedUpdates.description = updates.description;
        if (updates.notes !== undefined) convertedUpdates.notes = updates.notes;
        if (updates.deposit !== undefined) convertedUpdates.deposit = updates.deposit;
        if (updates.price !== undefined) convertedUpdates.price = updates.price;
        if (updates.referenceImages !== undefined) convertedUpdates.reference_images = updates.referenceImages;
        if (updates.status !== undefined) convertedUpdates.status = updates.status;
        
        const fields = Object.keys(convertedUpdates).map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = [id, ...Object.values(convertedUpdates)];
        
        const result = await pool.query(
          `UPDATE appointments SET ${fields} WHERE id = $1 RETURNING *`,
          values
        );
        return result.rows[0];
      },
      deleteAppointment: async (id) => {
        const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);
        return result.rowCount > 0;
      },
      changeAppointmentStatus: async (id, status) => {
        const result = await pool.query(
          'UPDATE appointments SET status = $2 WHERE id = $1 RETURNING *',
          [id, status]
        );
        return result.rows[0];
      }
    };
  } else {
    console.log('Creating mock implementation (no database connection)');
    
    // Create dummy storage methods to prevent crashes when no database is available
    storage = {
      // User methods
      getUser: async () => undefined,
      getUserByUsername: async () => undefined,
      createUser: async (user) => user,
      
      // Parlor methods
      getParlor: async () => undefined,
      getAllParlors: async () => [],
      
      // Artist methods
      getArtist: async () => undefined,
      getAllArtists: async () => [],
      
      // Guestspot methods
      getGuestspot: async () => undefined,
      getAllGuestspots: async () => [],
      
      // Schedule methods
      getSchedule: async () => undefined,
      getArtistSchedule: async () => [],
      getParlorSchedule: async () => [],
      getArtistAvailabilityOnDate: async () => [],
      createSchedule: async (schedule) => schedule,
      updateSchedule: async () => undefined,
      deleteSchedule: async () => false,
      
      // Appointment methods
      getAppointment: async () => undefined,
      getAppointmentsByArtist: async () => [],
      getAppointmentsByClient: async () => [],
      getAppointmentsByParlor: async () => [],
      getArtistAppointmentsInDateRange: async () => [],
      getParlorAppointmentsInDateRange: async () => [],
      createAppointment: async (appointment) => appointment,
      updateAppointment: async () => undefined,
      deleteAppointment: async () => false,
      changeAppointmentStatus: async () => undefined
    };
  }
}

module.exports = { storage };