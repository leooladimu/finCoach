/**
 * Local test runner for Lambda function
 * Run with: node test-local.js
 */

const { handler } = require('./index');

// Sample test data
const testEvent = {
  userId: 'test-user-123',
  profile: {
    type: 'INTJ',
    scores: {
      EI: -5,
      SN: 3,
      TF: 4,
      JP: 6,
    },
    statedPreferences: {
      riskTolerance: 'moderate',
      savingsGoal: 50000,
      priorityGoals: ['Buy a house', 'Build emergency fund'],
      spendingStyle: 'planner',
    },
  },
  transactions: [
    // Housing
    { id: '1', date: '2024-12-01', amount: 2100, category: 'Housing', merchant: 'Rent Payment' },
    // Food & Dining (overspending)
    { id: '2', date: '2024-12-05', amount: 85, category: 'Food & Dining', merchant: 'Upscale Restaurant' },
    { id: '3', date: '2024-12-07', amount: 120, category: 'Food & Dining', merchant: 'Fine Dining' },
    { id: '4', date: '2024-12-10', amount: 45, category: 'Food & Dining', merchant: 'Cafe' },
    { id: '5', date: '2024-12-12', amount: 95, category: 'Food & Dining', merchant: 'Dinner Out' },
    { id: '6', date: '2024-12-15', amount: 35, category: 'Food & Dining', merchant: 'Lunch' },
    { id: '7', date: '2024-12-18', amount: 150, category: 'Food & Dining', merchant: 'Group Dinner' },
    { id: '8', date: '2024-12-20', amount: 60, category: 'Food & Dining', merchant: 'Brunch' },
    { id: '9', date: '2024-12-22', amount: 40, category: 'Food & Dining', merchant: 'Coffee Shop' },
    // Entertainment (overspending)
    { id: '10', date: '2024-12-03', amount: 180, category: 'Entertainment', merchant: 'Concert Tickets' },
    { id: '11', date: '2024-12-08', amount: 65, category: 'Entertainment', merchant: 'Streaming Services' },
    { id: '12', date: '2024-12-14', amount: 95, category: 'Entertainment', merchant: 'Sports Event' },
    // Shopping (impulse buys - many small purchases for INTJ)
    { id: '13', date: '2024-12-02', amount: 15, category: 'Shopping', merchant: 'Online Store' },
    { id: '14', date: '2024-12-04', amount: 12, category: 'Shopping', merchant: 'Quick Purchase' },
    { id: '15', date: '2024-12-06', amount: 18, category: 'Shopping', merchant: 'Impulse Buy' },
    { id: '16', date: '2024-12-09', amount: 22, category: 'Shopping', merchant: 'Small Item' },
    { id: '17', date: '2024-12-11', amount: 14, category: 'Shopping', merchant: 'Another Store' },
    { id: '18', date: '2024-12-13', amount: 19, category: 'Shopping', merchant: 'Random Purchase' },
    { id: '19', date: '2024-12-16', amount: 16, category: 'Shopping', merchant: 'Quick Buy' },
    { id: '20', date: '2024-12-19', amount: 11, category: 'Shopping', merchant: 'Small Store' },
    { id: '21', date: '2024-12-21', amount: 25, category: 'Shopping', merchant: 'Online Shopping' },
    // Transportation (good - under budget)
    { id: '22', date: '2024-12-01', amount: 120, category: 'Transportation', merchant: 'Gas' },
    { id: '23', date: '2024-12-10', amount: 45, category: 'Transportation', merchant: 'Public Transit' },
    { id: '24', date: '2024-12-20', amount: 85, category: 'Transportation', merchant: 'Gas' },
    // Utilities
    { id: '25', date: '2024-12-05', amount: 150, category: 'Utilities', merchant: 'Electric' },
    { id: '26', date: '2024-12-10', amount: 80, category: 'Utilities', merchant: 'Internet' },
    // Groceries (essential)
    { id: '27', date: '2024-12-02', amount: 180, category: 'Groceries', merchant: 'Supermarket' },
    { id: '28', date: '2024-12-09', amount: 145, category: 'Groceries', merchant: 'Grocery Store' },
    { id: '29', date: '2024-12-16', amount: 165, category: 'Groceries', merchant: 'Market' },
    { id: '30', date: '2024-12-23', amount: 190, category: 'Groceries', merchant: 'Supermarket' },
  ],
  goals: [
    {
      id: 'house-downpayment',
      title: 'House Down Payment',
      targetAmount: 50000,
      currentAmount: 12000,
      targetDate: '2025-12-31',
      category: 'savings',
    },
    {
      id: 'emergency-fund',
      title: 'Emergency Fund',
      targetAmount: 15000,
      currentAmount: 3500,
      targetDate: '2025-06-30',
      category: 'savings',
    },
    {
      id: 'vacation',
      title: 'Europe Vacation',
      targetAmount: 5000,
      currentAmount: 4200,
      targetDate: '2025-08-01',
      category: 'leisure',
    },
  ],
  timeRange: 'month',
};

// Run the handler
async function test() {
  console.log('🧪 Testing Lambda function locally...\n');
  console.log('📊 Test Data:');
  console.log(`- User: ${testEvent.userId}`);
  console.log(`- Money Style: ${testEvent.profile.type}`);
  console.log(`- Transactions: ${testEvent.transactions.length}`);
  console.log(`- Goals: ${testEvent.goals.length}`);
  console.log(`- Time Range: ${testEvent.timeRange}\n`);

  try {
    const result = await handler(testEvent);
    
    console.log('✅ Lambda execution successful!\n');
    console.log('📋 Response:');
    console.log(JSON.stringify(JSON.parse(result.body), null, 2));
    
    const body = JSON.parse(result.body);
    console.log(`\n🎯 Summary:`);
    console.log(`- Total contradictions detected: ${body.totalDetected}`);
    console.log(`- High severity: ${body.breakdown.high}`);
    console.log(`- Medium severity: ${body.breakdown.medium}`);
    console.log(`- Low severity: ${body.breakdown.low}`);
    
    if (body.contradictions && body.contradictions.length > 0) {
      console.log('\n🔍 Detected Contradictions:');
      body.contradictions.forEach((c, i) => {
        console.log(`\n${i + 1}. ${c.emoji} [${c.severity.toUpperCase()}] ${c.title}`);
        console.log(`   ${c.description}`);
        console.log(`   💡 ${c.suggestion}`);
      });
    }
  } catch (error) {
    console.error('❌ Lambda execution failed:', error);
    process.exit(1);
  }
}

test();
