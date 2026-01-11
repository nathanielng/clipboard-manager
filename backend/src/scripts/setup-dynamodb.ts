#!/usr/bin/env node
/**
 * DynamoDB Table Setup Script
 * Creates the ClipboardEntries table in AWS DynamoDB
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists
} from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'ClipboardEntries';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const client = new DynamoDBClient({ region: AWS_REGION });

async function createTable() {
  console.log(`\n🔧 Setting up DynamoDB table: ${TABLE_NAME}`);
  console.log(`📍 Region: ${AWS_REGION}\n`);

  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      const existingTable = await client.send(describeCommand);
      console.log(`✓ Table "${TABLE_NAME}" already exists!`);
      console.log(`  Status: ${existingTable.Table?.TableStatus}`);
      console.log(`  Items: ${existingTable.Table?.ItemCount || 0}`);
      return;
    } catch (error: any) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
      // Table doesn't exist, create it
    }

    // Create table
    const createCommand = new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S' // String
        },
        {
          AttributeName: 'createdAt',
          AttributeType: 'S' // ISO timestamp string
        }
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH' // Partition key
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'createdAt-index',
          KeySchema: [
            {
              AttributeName: 'createdAt',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,  // Adjust based on your needs
        WriteCapacityUnits: 5  // Adjust based on your needs
      },
      Tags: [
        {
          Key: 'Application',
          Value: 'ClipboardManager'
        },
        {
          Key: 'Environment',
          Value: process.env.NODE_ENV || 'development'
        }
      ]
    });

    console.log('⏳ Creating table...');
    await client.send(createCommand);

    // Wait for table to be active
    console.log('⏳ Waiting for table to become active...');
    await waitUntilTableExists(
      { client, maxWaitTime: 120 },
      { TableName: TABLE_NAME }
    );

    console.log(`\n✅ Table "${TABLE_NAME}" created successfully!`);
    console.log('\nTable Details:');
    console.log(`  - Partition Key: id (String)`);
    console.log(`  - Global Secondary Index: createdAt-index`);
    console.log(`  - Billing Mode: Provisioned`);
    console.log(`  - Read Capacity: 5 units`);
    console.log(`  - Write Capacity: 5 units`);
    console.log('\n💡 Tip: Consider switching to On-Demand billing for variable workloads');
    console.log('   Run: aws dynamodb update-table --table-name ' + TABLE_NAME + ' --billing-mode PAY_PER_REQUEST');

  } catch (error) {
    console.error('\n❌ Error creating table:', error);
    if (error instanceof Error) {
      console.error('   ', error.message);
    }
    process.exit(1);
  }
}

// For On-Demand billing (alternative, more cost-effective for low/variable traffic)
async function createTableOnDemand() {
  console.log(`\n🔧 Setting up DynamoDB table (On-Demand): ${TABLE_NAME}`);
  console.log(`📍 Region: ${AWS_REGION}\n`);

  try {
    // Check if table already exists
    try {
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      await client.send(describeCommand);
      console.log(`✓ Table "${TABLE_NAME}" already exists!`);
      return;
    } catch (error: any) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    const createCommand = new CreateTableCommand({
      TableName: TABLE_NAME,
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST', // On-demand billing
      Tags: [
        {
          Key: 'Application',
          Value: 'ClipboardManager'
        }
      ]
    });

    console.log('⏳ Creating table...');
    await client.send(createCommand);

    await waitUntilTableExists(
      { client, maxWaitTime: 120 },
      { TableName: TABLE_NAME }
    );

    console.log(`\n✅ Table "${TABLE_NAME}" created successfully!`);
    console.log('  - Billing Mode: On-Demand (Pay Per Request)');

  } catch (error) {
    console.error('\n❌ Error creating table:', error);
    process.exit(1);
  }
}

// Check for command line argument
const args = process.argv.slice(2);
const useOnDemand = args.includes('--on-demand') || args.includes('-o');

if (useOnDemand) {
  createTableOnDemand();
} else {
  createTable();
}
