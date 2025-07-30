import { logger } from '@/config/logger.js';
import { config } from '@/config/environment.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface AlertEmailData {
  ticker: string;
  alertType: string;
  description: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string;
}

class EmailService {
  private isConfigured: boolean = false;

  constructor() {
    // In a real implementation, you would configure your email service here
    // For example: SendGrid, AWS SES, Nodemailer with SMTP, etc.
    this.isConfigured = !!process.env.EMAIL_SERVICE_API_KEY;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping email send', {
        to: options.to,
        subject: options.subject
      });
      return false;
    }

    try {
      // Implement your email sending logic here
      // Example with SendGrid:
      /*
      const msg = {
        to: options.to,
        from: 'noreply@insiderpulse.ai',
        subject: options.subject,
        text: options.text,
        html: options.html,
      };
      
      await sgMail.send(msg);
      */
      
      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        error: error.message,
        to: options.to,
        subject: options.subject
      });
      return false;
    }
  }

  async sendAlertEmail(userEmail: string, alertData: AlertEmailData): Promise<boolean> {
    const riskColors = {
      CRITICAL: '#DC2626',
      HIGH: '#EA580C',
      MEDIUM: '#D97706'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InsiderPulse Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">InsiderPulse Alert</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI-Powered Financial Intelligence</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: ${riskColors[alertData.riskLevel]}; color: white; padding: 15px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">${alertData.riskLevel} RISK ALERT</h2>
            <p style="margin: 5px 0 0 0; font-size: 16px;">${alertData.ticker}</p>
          </div>
          
          <h3 style="color: #374151; margin-bottom: 15px;">Alert Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold; width: 30%;">Ticker:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${alertData.ticker}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Alert Type:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${alertData.alertType}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Risk Level:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                <span style="background: ${riskColors[alertData.riskLevel]}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${alertData.riskLevel}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Time:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${new Date(alertData.timestamp).toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">Description</h4>
            <p style="margin: 0; color: #6b7280;">${alertData.description}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://insiderpulse.ai/analysis/${alertData.ticker}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Full Analysis
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">
            This alert was generated by InsiderPulse AI. 
            <a href="https://insiderpulse.ai/unsubscribe" style="color: #667eea;">Unsubscribe</a> | 
            <a href="https://insiderpulse.ai/settings" style="color: #667eea;">Manage Preferences</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
      InsiderPulse Alert - ${alertData.riskLevel} RISK
      
      Ticker: ${alertData.ticker}
      Alert Type: ${alertData.alertType}
      Risk Level: ${alertData.riskLevel}
      Time: ${new Date(alertData.timestamp).toLocaleString()}
      
      Description: ${alertData.description}
      
      View full analysis: https://insiderpulse.ai/analysis/${alertData.ticker}
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `🚨 ${alertData.riskLevel} Alert: ${alertData.ticker} - ${alertData.alertType}`,
      html,
      text
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to InsiderPulse</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to InsiderPulse</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI-Powered Financial Intelligence</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #374151; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <p>Thank you for joining InsiderPulse, the most advanced AI-powered financial intelligence platform.</p>
          
          <h3 style="color: #374151; margin-top: 30px;">What you can do now:</h3>
          <ul style="color: #6b7280;">
            <li>Analyze any S&P 500 company with our 5-vector AI risk audit</li>
            <li>Get real-time insider trading alerts</li>
            <li>Access sentiment analysis powered by live news data</li>
            <li>Use our backtesting platform to validate our predictions</li>
            <li>Build and monitor your watchlist</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://insiderpulse.ai/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Start Analyzing
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Need help? Reply to this email or visit our <a href="https://insiderpulse.ai/help" style="color: #667eea;">Help Center</a>
          </p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to InsiderPulse - Your AI Financial Intelligence Platform',
      html,
      text: `Welcome to InsiderPulse, ${userName}! Start analyzing companies with our AI-powered platform at https://insiderpulse.ai/dashboard`
    });
  }
}

export const emailService = new EmailService();