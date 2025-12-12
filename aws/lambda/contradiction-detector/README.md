# FinCoach Lambda - Contradiction Detection Engine

AWS Lambda function that analyzes user financial behavior and detects contradictions between stated goals and actual spending patterns.

## 🎯 Features

- **Spending vs Goals Analysis**: Compares discretionary spending against savings objectives
- **Category Pattern Detection**: Identifies budget overages in 5 major spending categories
- **Personality Alignment**: Validates spending behavior matches MBTI money style (J/P, S/N, T/F, E/I)
- **Goal Progress Tracking**: Calculates trajectory and warns if goals are off-track
- **Positive Pattern Recognition**: Celebrates milestones and healthy financial habits
- **Personality-Adapted Suggestions**: Adjusts language for Thinking vs Feeling types

## 📊 Architecture

```
┌─────────────────┐
│   Next.js App   │
│  (FinCoach UI)  │
└────────┬────────┘
         │
         │ HTTP POST
         ▼
┌─────────────────┐
│  API Gateway    │
│ /api/analyze    │
└────────┬────────┘
         │
         │ Invoke
         ▼
┌─────────────────┐
│  AWS Lambda     │
│  Contradiction  │
│    Detector     │
└────────┬────────┘
         │
         │ Return
         ▼
┌─────────────────┐
│  Vercel KV DB   │
│   (Storage)     │
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js 20+** installed
2. **AWS CLI** installed: `brew install awscli`
3. **AWS Account** with credentials configured: `aws configure`

### Local Testing

Test the Lambda function locally without deploying:

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run local test
node test-local.js
```

Expected output:
```
🧪 Testing Lambda function locally...
✅ Lambda execution successful!
🎯 Summary:
- Total contradictions detected: 5
- High severity: 2
- Medium severity: 2
- Low severity: 1
```

### Deploy to AWS

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy (creates function if doesn't exist, updates if exists)
./deploy.sh
```

The script will:
1. ✅ Check AWS CLI is installed and configured
2. 📦 Build TypeScript to JavaScript
3. 🗜️ Create deployment package (function.zip)
4. 🔍 Check if function exists in AWS
5. 🚀 Create or update Lambda function
6. 📋 Create IAM role if needed

### Test in AWS

```bash
# Invoke Lambda with test event
aws lambda invoke \
  --function-name fincoach-contradiction-detector \
  --payload file://test-event.json \
  --region us-east-1 \
  response.json

# View the response
cat response.json | jq
```

### View Logs

```bash
# Tail CloudWatch logs in real-time
aws logs tail /aws/lambda/fincoach-contradiction-detector --follow
```

## 📝 Event Schema

Lambda expects this JSON structure:

```typescript
{
  userId: string;
  profile: {
    type: string;  // MBTI type (e.g., "INTJ")
    scores: {
      EI: number;  // -10 to +10
      SN: number;
      TF: number;
      JP: number;
    };
    statedPreferences: {
      riskTolerance: "conservative" | "moderate" | "aggressive";
      savingsGoal: number;
      priorityGoals: string[];
      spendingStyle: "planner" | "flexible" | "impulsive";
    };
  };
  transactions: Array<{
    id: string;
    date: string;  // ISO date
    amount: number;
    category: string;
    merchant: string;
  }>;
  goals: Array<{
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;  // ISO date
    category: string;
  }>;
  timeRange: "week" | "month" | "year";
}
```

## 📤 Response Schema

Lambda returns:

```typescript
{
  statusCode: 200,
  body: JSON.stringify({
    success: true,
    userId: string,
    contradictions: Array<{
      id: string;
      type: string;
      severity: "high" | "medium" | "low";
      emoji: string;
      title: string;
      description: string;
      stated: { label: string; value: any };
      actual: { label: string; value: any };
      suggestion: string;
      potentialSavings?: number;
    }>,
    analysisTimestamp: string,
    totalDetected: number,
    breakdown: {
      high: number;
      medium: number;
      low: number;
    }
  })
}
```

## 🧮 Analysis Algorithms

### 1. Spending vs Goals
- Calculates discretionary spending (non-essential categories)
- Flags if >25% of income spent on discretionary vs savings goal
- **Example**: User wants to save $50k/year but spends $15k on dining/entertainment

### 2. Category Patterns
- Analyzes 5 categories: Food & Dining, Entertainment, Shopping, Transportation, Utilities
- Recommended budgets: 15%, 10%, 10%, 10%, 10% respectively
- Flags if category spending >30% over recommendation
- **Example**: User spends $900/month on dining (budget: $600)

### 3. Personality Alignment
- **Judgers (J>5)**: Flags if >40% transactions are small impulse buys (<$20)
- **Perceivers (P>5)**: Flags if income varies by >30% month-to-month
- **Sensors (S>5)**: Flags if >15% spent on abstract/future investments without emergency fund
- **Intuitives (N>5)**: Flags if <5% spent on growth/learning opportunities
- **Example**: INTJ makes 15 small purchases under $20 (contradicts structured style)

### 4. Goal Progress
- Calculates required monthly savings to meet goal by target date
- Compares to actual progress
- Flags if <75% of required pace
- **Example**: Need $3,000/month for house fund, only saving $1,800/month

### 5. Positive Patterns
- Celebrates when goals are >75% complete
- Celebrates when essential spending is 60-75% (healthy balance)
- **Example**: "You're at 84% of your vacation fund - almost there!"

## 💰 AWS Free Tier

This Lambda function stays within AWS Free Tier limits:

- **Compute**: 1 million requests/month FREE (forever)
- **Duration**: 400,000 GB-seconds/month FREE
- **Invocations**: ~0.2 seconds per request @ 512MB = 100k+ free requests/month

**Cost Example**:
- 10,000 daily users = 300k requests/month = **$0.00** (within free tier)
- 100,000 daily users = 3M requests/month = **~$0.40/month**

## 🔐 Security

### IAM Role Permissions

The Lambda function requires:
- `AWSLambdaBasicExecutionRole` (CloudWatch Logs access)
- No database access needed (stateless function)

### Environment Variables

Optional (set in Lambda console):
```bash
LOG_LEVEL=info
ALERT_THRESHOLD_HIGH=3  # Number of high-severity contradictions to alert
```

## 🔗 Integration with Next.js

Create an API route in your Next.js app:

```typescript
// app/api/analyze/trigger/route.ts
import { NextResponse } from 'next/server';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({ region: 'us-east-1' });

export async function POST(req: Request) {
  const { userId } = await req.json();
  
  // Fetch user data from Vercel KV
  const profile = await kv.hgetall(`user:${userId}:profile`);
  const transactions = await kv.lrange(`user:${userId}:transactions`, 0, -1);
  const goals = await kv.lrange(`user:${userId}:goals`, 0, -1);
  
  // Invoke Lambda
  const command = new InvokeCommand({
    FunctionName: 'fincoach-contradiction-detector',
    Payload: JSON.stringify({ userId, profile, transactions, goals, timeRange: 'month' }),
  });
  
  const response = await lambda.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.Payload));
  const body = JSON.parse(result.body);
  
  // Store results in Vercel KV
  await kv.hset(`user:${userId}:contradictions`, body.contradictions);
  
  return NextResponse.json(body);
}
```

Install AWS SDK:
```bash
npm install @aws-sdk/client-lambda
```

## 📊 Monitoring

### CloudWatch Metrics
- Invocations
- Duration (avg ~200ms)
- Errors
- Throttles

### Custom Metrics
Add CloudWatch metric publishing:
```typescript
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

await cloudwatch.send(new PutMetricDataCommand({
  Namespace: 'FinCoach',
  MetricData: [{
    MetricName: 'ContradictionsDetected',
    Value: contradictions.length,
    Unit: 'Count',
  }],
}));
```

## 🧪 Testing Strategy

1. **Local Testing**: `node test-local.js` (instant feedback)
2. **AWS Testing**: `aws lambda invoke` (real environment)
3. **Integration Testing**: Call from Next.js API route
4. **Load Testing**: Use AWS SAM CLI or Artillery.io

## 📦 Deployment Pipeline

For CI/CD integration:

```yaml
# .github/workflows/deploy-lambda.yml
name: Deploy Lambda
on:
  push:
    branches: [main]
    paths: ['aws/lambda/contradiction-detector/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Deploy
        run: |
          cd aws/lambda/contradiction-detector
          ./deploy.sh
```

## 🚨 Troubleshooting

### Build fails
```bash
# Check TypeScript errors
npm run build

# Check node_modules
rm -rf node_modules package-lock.json
npm install
```

### Deployment fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam list-attached-role-policies --role-name fincoach-lambda-role
```

### Lambda timeout
```bash
# Increase timeout to 60 seconds
aws lambda update-function-configuration \
  --function-name fincoach-contradiction-detector \
  --timeout 60
```

## 📚 Resources

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [AWS Free Tier Details](https://aws.amazon.com/free/)
- [TypeScript Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html)

## 📄 License

MIT - FinCoach Project

---

**Built with ❤️ for smarter financial coaching**
