import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailResultsSchema, lifeCategories, lifeCategoryLabels, type CalculatedResults } from "@shared/schema";
import nodemailer from "nodemailer";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Email results endpoint
  app.post("/api/email-results", async (req, res) => {
    try {
      // Check if Gmail credentials are configured
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return res.status(500).json({ 
          success: false, 
          message: "Email service is not configured. Please contact support." 
        });
      }

      const validatedData = emailResultsSchema.parse(req.body);
      
      // Calculate results from assessment data
      const results = calculateResults(validatedData.assessmentData);
      
      // Create Gmail transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      // Generate email HTML content
      const emailHTML = generateEmailHTML(results, validatedData.name);
      
      // Send email
      await transporter.sendMail({
        from: `"Wheel of Life Assessment" <${process.env.GMAIL_USER}>`,
        to: validatedData.email,
        subject: "Your Wheel of Life Assessment Results",
        html: emailHTML,
      });

      res.json({ success: true, message: "Results sent successfully!" });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send email. Please check your email address and try again." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateResults(assessmentData: any): CalculatedResults {
  const results: CalculatedResults = {
    satisfaction: {} as Record<string, number>,
    motivation: {} as Record<string, number>,
    improvement: {} as Record<string, number>,
    priority: {} as Record<string, number>,
    priorityRanked: []
  };

  // Calculate improvement potential and priority for each category
  lifeCategories.forEach(category => {
    const satisfaction = assessmentData.satisfaction[category] || 1;
    const motivation = assessmentData.motivation[category] || 1;
    
    results.satisfaction[category] = satisfaction;
    results.motivation[category] = motivation;
    results.improvement[category] = 10 - satisfaction;
    results.priority[category] = (10 - satisfaction) * motivation;
  });

  // Create ranked priority list
  results.priorityRanked = lifeCategories
    .map(category => ({
      category,
      label: lifeCategoryLabels[category],
      satisfaction: results.satisfaction[category],
      motivation: results.motivation[category],
      improvement: results.improvement[category],
      priority: results.priority[category]
    }))
    .sort((a, b) => b.priority - a.priority);

  return results;
}

function generateEmailHTML(results: CalculatedResults, name?: string): string {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const topPriorities = results.priorityRanked.slice(0, 3);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #1c1c1c; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-family: 'Playfair Display', serif; font-size: 28px; color: #1c1c1c; margin-bottom: 10px; }
        .priority-item { background: #f4f1ec; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #e8e9ca; }
        .score { font-weight: bold; color: #1c1c1c; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e9ca; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Your Wheel of Life Results</h1>
        </div>
        
        <p>${greeting}</p>
        
        <p>Thank you for completing your Wheel of Life assessment. Here are your personalized results:</p>
        
        <h2>Your Top Priority Areas:</h2>
        
        ${topPriorities.map((item, index) => `
          <div class="priority-item">
            <h3>${index + 1}. ${item.label}</h3>
            <p>Current Satisfaction: <span class="score">${item.satisfaction}/10</span></p>
            <p>Motivation to Improve: <span class="score">${item.motivation}/10</span></p>
            <p>Priority Score: <span class="score">${item.priority}</span></p>
          </div>
        `).join('')}
        
        <h2>Your Growth Insights:</h2>
        <p>Your assessment reveals areas with the greatest potential for meaningful improvement. Focus on your highest priority areas first, as these represent the intersection of need and motivation.</p>
        
        <p>Remember: Small, consistent actions in high-priority areas often create momentum that spreads to other life domains.</p>
        
        <div class="footer">
          <p>Keep growing and remember to reassess periodically to track your progress!</p>
          <br>
          <p><strong>Janette Possul</strong><br>
          Mental Health & Well-being Coach<br>
          <a href="https://www.janettepossul.com" style="color: #1c1c1c; text-decoration: none;">www.janettepossul.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
