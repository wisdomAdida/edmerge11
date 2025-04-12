// Import PostgreSQL properly for ESM
import pkg from 'pg';
const { Client } = pkg;
import { v4 as uuidv4 } from 'uuid'; // UUID for unique transaction IDs

// RabbitMQ service class for real-time messaging
class RabbitMQService {
  private url: string;
  private connection: any;
  private channel: any;

  constructor(url: string) {
    this.url = url;
    this.initialize();
  }

  private async initialize() {
    try {
      // In a real implementation, you would use amqplib
      // For now, we'll create a placeholder for the real implementation
      console.log(`RabbitMQ initialized with URL: ${this.url}`);
    } catch (error) {
      console.error('Failed to initialize RabbitMQ:', error);
    }
  }

  public async sendMessage({ queue, message }: { queue: string, message: any }) {
    try {
      // In a real implementation, you would use the channel to publish
      console.log(`Message sent to queue ${queue}:`, message);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
}

// PostgreSQL client setup
const client = new Client({
  host: 'ep-sparkling-fog-a4cl3kwk.us-east-1.aws.neon.tech',
  user: 'neondb_owner',
  database: 'neondb',
  password: 'npg_0Fdc6pDCAzBo',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // Needed for some cloud DB connections
  }
});

// Connect to database immediately when module is loaded
(async () => {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err);
  }
})();

// Initialize RabbitMQ service for real-time notifications
const rabbitMQ = new RabbitMQService('amqp://localhost'); // You should use your actual RabbitMQ URL here

// Transaction class to handle all operations
export class Transaction {
  private transactionId: string;
  private userId: number;
  private amount: number;
  private transactionType: string;
  private transactionStatus: string;

  constructor(userId: number, amount: number, transactionType: string) {
    this.transactionId = uuidv4();
    this.userId = userId;
    this.amount = amount;
    this.transactionType = transactionType;
    this.transactionStatus = 'pending';
  }

  // Record a transaction in the database
  public async recordTransaction() {
    try {
      const query = `
        INSERT INTO transactions
        (transaction_id, user_id, amount, transaction_type, transaction_status, created_at)
        VALUES($1, $2, $3, $4, $5, NOW())
        RETURNING *`;

      const values = [
        this.transactionId,
        this.userId,
        this.amount,
        this.transactionType,
        this.transactionStatus
      ];

      const res = await client.query(query, values);
      console.log(`Transaction recorded: ${this.transactionId}`, res.rows[0]);

      // Send real-time notification that transaction was recorded
      await this.sendRealTimeNotification('Transaction initiated');

      return res.rows[0];
    } catch (err) {
      console.error('Error recording transaction:', err);
      throw new Error(`Database transaction failed: ${err.message}`);
    }
  }

  // Update transaction status (e.g., success, failed)
  public async updateTransactionStatus(status: string) {
    try {
      const query = `
        UPDATE transactions 
        SET transaction_status = $1, updated_at = NOW() 
        WHERE transaction_id = $2 
        RETURNING *`;

      const values = [status, this.transactionId];
      const res = await client.query(query, values);

      if (res.rowCount === 0) {
        throw new Error(`Transaction with ID ${this.transactionId} not found`);
      }

      this.transactionStatus = status;
      console.log(`Transaction status updated: ${this.transactionId} to ${status}`);

      return res.rows[0];
    } catch (err) {
      console.error('Error updating transaction status:', err);
      throw new Error(`Failed to update transaction status: ${err.message}`);
    }
  }

  // Real-time notifications using RabbitMQ
  public async sendRealTimeNotification(message: string) {
    try {
      await rabbitMQ.sendMessage({
        queue: 'transaction_notifications',
        message: {
          transactionId: this.transactionId,
          userId: this.userId,
          status: this.transactionStatus,
          amount: this.amount,
          type: this.transactionType,
          timestamp: new Date().toISOString(),
          message,
        },
      });
      console.log(`Real-time notification sent for transaction: ${this.transactionId}`);
      return true;
    } catch (err) {
      console.error('Error sending real-time notification:', err);
      // Don't throw here - notifications shouldn't break the transaction flow
      return false;
    }
  }

  // Check if user has sufficient balance for debit transactions
  private async checkUserBalance(userId: number, amount: number): Promise<boolean> {
    try {
      const query = 'SELECT balance FROM users WHERE user_id = $1';
      const res = await client.query(query, [userId]);

      if (res.rows.length === 0) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const balance = parseFloat(res.rows[0].balance);
      return balance >= amount;
    } catch (err) {
      console.error('Error checking user balance:', err);
      throw new Error(`Failed to check user balance: ${err.message}`);
    }
  }

  // Update user balance after successful transaction
  private async updateUserBalance(): Promise<void> {
    try {
      let operation = '';
      if (this.transactionType === 'credit') {
        operation = 'balance + $2';
      } else if (this.transactionType === 'debit') {
        operation = 'balance - $2';
      } else {
        throw new Error(`Invalid transaction type: ${this.transactionType}`);
      }

      const query = `UPDATE users SET balance = ${operation}, updated_at = NOW() WHERE user_id = $1`;
      const res = await client.query(query, [this.userId, this.amount]);

      if (res.rowCount === 0) {
        throw new Error(`User with ID ${this.userId} not found`);
      }

      console.log(`User balance updated for user ${this.userId}`);
    } catch (err) {
      console.error('Error updating user balance:', err);
      throw new Error(`Failed to update user balance: ${err.message}`);
    }
  }

  // Process transaction logic (e.g., check balances, update records)
  public async processTransaction() {
    try {
      // For debit transactions, check if user has sufficient balance
      if (this.transactionType === 'debit') {
        const hasSufficientBalance = await this.checkUserBalance(this.userId, this.amount);

        if (!hasSufficientBalance) {
          await this.updateTransactionStatus('failed');
          await this.sendRealTimeNotification('Transaction failed: Insufficient funds');
          return { success: false, message: 'Insufficient funds' };
        }
      }

      // Record the transaction in the database
      const transactionData = await this.recordTransaction();

      // Update user balance in real-time
      await this.updateUserBalance();

      // Complete the transaction
      await this.updateTransactionStatus('completed');
      await this.sendRealTimeNotification('Transaction completed successfully');

      return { 
        success: true, 
        message: 'Transaction processed successfully',
        transaction: {
          id: this.transactionId,
          userId: this.userId,
          amount: this.amount,
          type: this.transactionType,
          status: this.transactionStatus
        }
      };
    } catch (error) {
      console.error('Transaction processing failed:', error);

      // Update transaction status to failed
      try {
        await this.updateTransactionStatus('failed');
        await this.sendRealTimeNotification(`Transaction failed: ${error.message}`);
      } catch (statusError) {
        console.error('Failed to update transaction status:', statusError);
      }

      return { success: false, message: error.message };
    }
  }

  // Get transaction by ID
  public static async getTransactionById(transactionId: string) {
    try {
      const query = 'SELECT * FROM transactions WHERE transaction_id = $1';
      const res = await client.query(query, [transactionId]);

      if (res.rows.length === 0) {
        return null;
      }

      return res.rows[0];
    } catch (err) {
      console.error('Error retrieving transaction:', err);
      throw new Error(`Failed to retrieve transaction: ${err.message}`);
    }
  }

  // Get transactions by user ID
  public static async getTransactionsByUserId(userId: number) {
    try {
      const query = 'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC';
      const res = await client.query(query, [userId]);
      return res.rows;
    } catch (err) {
      console.error('Error retrieving user transactions:', err);
      throw new Error(`Failed to retrieve user transactions: ${err.message}`);
    }
  }
}

// Create a function to gracefully close connections when the application shuts down
export async function closeConnections() {
  try {
    await client.end();
    console.log('PostgreSQL connection closed');
    // In a real implementation, you would also close RabbitMQ connections
    console.log('RabbitMQ connection closed');
  } catch (err) {
    console.error('Error closing connections:', err);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Application shutting down...');
  await closeConnections();
  process.exit(0);
});
// Add this at the end of your transaction.ts file
// This creates and exports a transactionManager instance

// Transaction manager class to handle transaction creation and management
export class TransactionManager {
  // Create a new transaction
  createTransaction(userId: number, amount: number, transactionType: string): Transaction {
    return new Transaction(userId, amount, transactionType);
  }

  // Process a transaction directly
  async processTransaction(userId: number, amount: number, transactionType: string) {
    const transaction = this.createTransaction(userId, amount, transactionType);
    return await transaction.processTransaction();
  }

  // Get a user's transaction history
  async getUserTransactions(userId: number) {
    return await Transaction.getTransactionsByUserId(userId);
  }

  // Get transaction details by ID
  async getTransactionById(transactionId: string) {
    return await Transaction.getTransactionById(transactionId);
  }
}

// Create and export a singleton instance
export const transactionManager = new TransactionManager();