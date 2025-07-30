import {
  users,
  employees,
  clients,
  leads,
  checkIns,
  type User,
  type UpsertUser,
  type Employee,
  type InsertEmployee,
  type Client,
  type InsertClient,
  type Lead,
  type InsertLead,
  type CheckIn,
  type InsertCheckIn,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Employee operations
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  getEmployeeByMobile(mobileNumber: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  authenticateEmployee(employeeId: string, mobileNumber: string, password: string): Promise<Employee | null>;
  getAllEmployees(): Promise<Employee[]>;
  deleteEmployee(id: string): Promise<void>;
  
  // Client operations
  createClient(client: InsertClient): Promise<Client>;
  getClientsByEmployee(employeeId: string): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsByEmployee(employeeId: string): Promise<(Lead & { client: Client })[]>;
  updateLeadStatus(leadId: string, status: string): Promise<Lead>;
  getLeadStatistics(employeeId: string): Promise<Record<string, number>>;
  
  // Check-in operations
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getActiveCheckIn(employeeId: string): Promise<CheckIn | undefined>;
  updateCheckOut(checkInId: string): Promise<CheckIn>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Employee operations
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeId, employeeId));
    return employee;
  }

  async getEmployeeByMobile(mobileNumber: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.mobileNumber, mobileNumber));
    return employee;
  }

  async createEmployee(employeeData: InsertEmployee): Promise<Employee> {
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const [employee] = await db
      .insert(employees)
      .values({
        ...employeeData,
        password: hashedPassword,
      })
      .returning();
    return employee;
  }

  async authenticateEmployee(employeeId: string, mobileNumber: string, password: string): Promise<Employee | null> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.employeeId, employeeId),
          eq(employees.mobileNumber, mobileNumber),
          eq(employees.isActive, true)
        )
      );

    if (!employee) return null;

    const isValidPassword = await bcrypt.compare(password, employee.password);
    return isValidPassword ? employee : null;
  }

  // Client operations
  async createClient(clientData: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(clientData).returning();
    return client;
  }

  async getClientsByEmployee(employeeId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.createdBy, employeeId))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  // Lead operations
  async createLead(leadData: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(leadData).returning();
    return lead;
  }

  async getLeadsByEmployee(employeeId: string): Promise<(Lead & { client: Client })[]> {
    return await db
      .select({
        id: leads.id,
        clientId: leads.clientId,
        status: leads.status,
        assignedTo: leads.assignedTo,
        lastContactDate: leads.lastContactDate,
        nextFollowUp: leads.nextFollowUp,
        notes: leads.notes,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        client: clients,
      })
      .from(leads)
      .innerJoin(clients, eq(leads.clientId, clients.id))
      .where(eq(leads.assignedTo, employeeId))
      .orderBy(desc(leads.createdAt));
  }

  async updateLeadStatus(leadId: string, status: string): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, leadId))
      .returning();
    return lead;
  }

  async getLeadStatistics(employeeId: string): Promise<Record<string, number>> {
    const stats = await db
      .select({
        status: leads.status,
        count: count(),
      })
      .from(leads)
      .where(eq(leads.assignedTo, employeeId))
      .groupBy(leads.status);

    const result: Record<string, number> = {
      followUp: 0,
      green: 0,
      amber: 0,
      red: 0,
      query: 0,
      los: 0,
      sanctioned: 0,
      disbursed: 0,
      total: 0,
      rejected: 0,
      preLeads: 0,
      leadsInProcess: 0,
    };

    let total = 0;
    stats.forEach(({ status, count: statusCount }) => {
      if (status in result) {
        result[status] = statusCount;
      }
      total += statusCount;
    });

    result.total = total;
    return result;
  }

  // Check-in operations
  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    const [checkIn] = await db.insert(checkIns).values(checkInData).returning();
    return checkIn;
  }

  async getActiveCheckIn(employeeId: string): Promise<CheckIn | undefined> {
    const [checkIn] = await db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.employeeId, employeeId),
          sql`${checkIns.checkOutTime} IS NULL`
        )
      )
      .orderBy(desc(checkIns.checkInTime));
    return checkIn;
  }

  async updateCheckOut(checkInId: string): Promise<CheckIn> {
    const [checkIn] = await db
      .update(checkIns)
      .set({ checkOutTime: new Date() })
      .where(eq(checkIns.id, checkInId))
      .returning();
    return checkIn;
  }

  // Admin operations
  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(desc(employees.createdAt));
  }

  async deleteEmployee(id: string): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }
}

export const storage = new DatabaseStorage();
