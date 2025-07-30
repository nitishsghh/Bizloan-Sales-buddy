import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./Auth";
import { insertClientSchema, insertLeadSchema, insertCheckInSchema, insertEmployeeSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Employee authentication routes
  app.post('/api/auth/employee/login', async (req, res) => {
    try {
      const { employeeId, mobileNumber, password } = loginSchema.parse(req.body);
      
      const employee = await storage.authenticateEmployee(employeeId, mobileNumber, password);
      if (!employee) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Store employee info in session
      (req.session as any).employee = employee;
      res.json({ employee, message: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/employee/logout', (req, res) => {
    (req.session as any).employee = null;
    res.json({ message: "Logout successful" });
  });

  app.get('/api/auth/employee/current', (req, res) => {
    const employee = (req.session as any)?.employee;
    if (!employee) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(employee);
  });

  // Protected employee routes
  const requireEmployeeAuth = (req: any, res: any, next: any) => {
    const employee = req.session?.employee;
    if (!employee) {
      return res.status(401).json({ message: "Employee authentication required" });
    }
    req.employee = employee;
    next();
  };

  // Client routes
  app.post('/api/clients', requireEmployeeAuth, async (req: any, res) => {
    try {
      const clientData = insertClientSchema.parse({
        ...req.body,
        createdBy: req.employee.id,
      });
      
      const client = await storage.createClient(clientData);
      
      // Automatically create a lead for the client
      const lead = await storage.createLead({
        clientId: client.id,
        assignedTo: req.employee.id,
        status: 'green',
      });

      res.json({ client, lead });
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.get('/api/clients', requireEmployeeAuth, async (req: any, res) => {
    try {
      const clients = await storage.getClientsByEmployee(req.employee.id);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Lead routes
  app.get('/api/leads', requireEmployeeAuth, async (req: any, res) => {
    try {
      const leads = await storage.getLeadsByEmployee(req.employee.id);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/statistics', requireEmployeeAuth, async (req: any, res) => {
    try {
      const stats = await storage.getLeadStatistics(req.employee.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching lead statistics:", error);
      res.status(500).json({ message: "Failed to fetch lead statistics" });
    }
  });

  app.patch('/api/leads/:id/status', requireEmployeeAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const lead = await storage.updateLeadStatus(id, status);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead status:", error);
      res.status(500).json({ message: "Failed to update lead status" });
    }
  });

  // Check-in routes
  app.post('/api/checkins', requireEmployeeAuth, async (req: any, res) => {
    try {
      const checkInData = insertCheckInSchema.parse({
        ...req.body,
        employeeId: req.employee.id,
        checkInTime: new Date(),
      });
      
      const checkIn = await storage.createCheckIn(checkInData);
      res.json(checkIn);
    } catch (error) {
      console.error("Error creating check-in:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  app.get('/api/checkins/active', requireEmployeeAuth, async (req: any, res) => {
    try {
      const checkIn = await storage.getActiveCheckIn(req.employee.id);
      res.json(checkIn);
    } catch (error) {
      console.error("Error fetching active check-in:", error);
      res.status(500).json({ message: "Failed to fetch active check-in" });
    }
  });

  app.patch('/api/checkins/:id/checkout', requireEmployeeAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const checkIn = await storage.updateCheckOut(id);
      res.json(checkIn);
    } catch (error) {
      console.error("Error checking out:", error);
      res.status(500).json({ message: "Failed to check out" });
    }
  });

  // Admin routes
  app.get('/api/admin/employees', requireEmployeeAuth, async (req: any, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/admin/employees', requireEmployeeAuth, async (req: any, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.json({ employee });
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.delete('/api/admin/employees/:id', requireEmployeeAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmployee(id);
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
