# AWS Lambda Setup Guide for FinCoach

Complete guide to deploy and integrate the contradiction detection Lambda function.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [AWS Deployment](#aws-deployment)
4. [Next.js Integration](#nextjs-integration)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

```bash
# Install AWS CLI (macOS)
brew install awscli

# Verify installation
aws --version
# Expected: aws-cli/2.x.x or higher

# Install Node.js 20+ (if not already installed)
brew install node@20

# Verify Node version
node --version
# Expected: v20.x.x or higher
```

### AWS Account Setup

1. **Create AWS Account** (if you don't have one)
   - Visit: https://aws.amazon.com/free/
   - Sign up for free tier (1M Lambda requests/month FREE forever)

2. **Create IAM User with Programmatic Access**
   ```bash
   # In AWS Console:
   # 1. Go to IAM → Users → Add User
   # 2. Name: fincoach-deployer
   # 3. Access type: Programmatic access
   # 4. Attach policies:
   #    - AWSLambdaFullAccess
   #    - IAMFullAccess (for creating execution roles)
   # 5. Save Access Key ID and Secret Access Key
   ```

3. **Configure AWS CLI**
   ```bash
   aws configure
   # AWS Access Key ID: [paste your access key]
   # AWS Secret Access Key: [paste your secret key]
   # Default region name: us-east-1
   # Default output format: json
   
   # Verify configuration
   aws sts get-caller-identity
   # Should return your account ID and user ARN
   ```

---

## Local Development

### 1. Install Dependencies

```bash
cd /Users/leooladimu1984/x/FinCoach/aws/lambda/contradiction-detector

# Install Node.js dependencies
npm install
```

### 2. Build TypeScript

```bash
# Compile TypeScript to JavaScript
npm run build

# You should see: index.js created
ls -la index.js
```

### 3. Run Local Tests

```bash
# Test Lambda function locally (without AWS)
node test-local.js
```

**Expected Output:**
```
🧪 Testing Lambda function locally...

📊 Test Data:
- User: test-user-123
- Money Style: INTJ
- Transactions: 30
- Goals: 3
- Time Range: month

✅ Lambda execution successful!

🎯 Summary:
- Total contradictions detected: 5
- High severity: 2
- Medium severity: 2
- Low severity: 1

🔍 Detected Contradictions:

1. 🍽️ [HIGH] Dining Spending vs Savings Goal
   Your dining expenses ($850) are 183% over budget...
   💡 Consider meal prepping 3x/week...
```

✅ **If you see this output, your Lambda function is working correctly!**

---

## AWS Deployment

### Option A: Automated Deployment (Recommended)

```bash
# Make deploy script executable (already done)
chmod +x deploy.sh

# Deploy to AWS
./deploy.sh
```

**Expected Output:**
```
🚀 FinCoach Lambda Deployment
==============================

✅ AWS CLI configured

📦 Building TypeScript...
✅ Build successful

📦 Creating deployment package...
✅ Package created: function.zip

🔍 Checking if Lambda function exists...
📋 Function doesn't exist. Creating new function...
📋 Creating IAM role...
✅ IAM role created: arn:aws:iam::123456789012:role/fincoach-lambda-role
✅ Lambda function created!

🎉 Deployment complete!

📝 Function Details:
   Name: fincoach-contradiction-detector
   Region: us-east-1
   Runtime: nodejs20.x
```

### Option B: Manual Deployment via AWS Console

1. **Build and Package**
   ```bash
   npm run build
   npm run package  # Creates function.zip
   ```

2. **Create Function in AWS Console**
   - Go to: https://console.aws.amazon.com/lambda/
   - Click "Create function"
   - Function name: `fincoach-contradiction-detector`
   - Runtime: Node.js 20.x
   - Architecture: x86_64
   - Create new role: `fincoach-lambda-role`
   - Click "Create function"

3. **Upload Code**
   - In function page, click "Upload from" → ".zip file"
   - Select `function.zip`
   - Click "Save"

4. **Configure Settings**
   - Memory: 512 MB
   - Timeout: 30 seconds
   - Handler: `index.handler`

---

## AWS Testing

### Test via AWS CLI

```bash
# Invoke Lambda function
aws lambda invoke \
  --function-name fincoach-contradiction-detector \
  --payload file://test-event.json \
  --region us-east-1 \
  response.json

# View response
cat response.json | jq
```

### Test via AWS Console

1. Go to Lambda function page
2. Click "Test" tab
3. Create new test event:
   - Event name: `test-intj-user`
   - Paste contents of `test-event.json`
4. Click "Test"
5. View execution results

**Successful Response:**
```json
{
  "statusCode": 200,
  "body": "{\"success\":true,\"userId\":\"test-user-123\",\"contradictions\":[...],\"totalDetected\":5}"
}
```

---

## Next.js Integration

### Phase 1: Mock API (Current State ✅)

Already implemented at `/app/api/analyze/trigger/route.ts`

**Test the API:**
```bash
# Start Next.js dev server
cd /Users/leooladimu1984/x/FinCoach
npm run dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/analyze/trigger \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","timeRange":"month"}'
```

### Phase 2: Real Lambda Integration

1. **Install AWS SDK**
   ```bash
   cd /Users/leooladimu1984/x/FinCoach
   npm install @aws-sdk/client-lambda
   ```

2. **Uncomment Lambda Code**
   - Open `app/api/analyze/trigger/route.ts`
   - Find "PHASE 2: Real AWS Lambda Integration" section
   - Uncomment the code block
   - Comment out "PHASE 1: Mock Response" section

3. **Add Environment Variables** (see next section)

4. **Restart Next.js**
   ```bash
   npm run dev
   ```

---

## Environment Variables

### Local Development

Create `.env.local` in project root:

```bash
cd /Users/leooladimu1984/x/FinCoach
cat > .env.local <<EOF
# AWS Lambda Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
LAMBDA_FUNCTION_NAME=fincoach-contradiction-detector

# Optional: CloudWatch Logging
LOG_LEVEL=info
EOF
```

⚠️ **IMPORTANT:** Add `.env.local` to `.gitignore`
```bash
echo ".env.local" >> .gitignore
```

### Production (Vercel)

Add environment variables in Vercel Dashboard:

1. Go to: https://vercel.com/your-username/fincoach/settings/environment-variables
2. Add each variable:
   - `AWS_REGION`: `us-east-1`
   - `AWS_ACCESS_KEY_ID`: [your access key]
   - `AWS_SECRET_ACCESS_KEY`: [your secret key] (encrypted)
   - `LAMBDA_FUNCTION_NAME`: `fincoach-contradiction-detector`
3. Click "Save"
4. Redeploy your app

---

## Testing

### 1. Test Lambda Directly (AWS CLI)

```bash
cd /Users/leooladimu1984/x/FinCoach/aws/lambda/contradiction-detector

# Test with sample event
aws lambda invoke \
  --function-name fincoach-contradiction-detector \
  --payload file://test-event.json \
  response.json

# Check response
cat response.json | jq '.body | fromjson | .contradictions | length'
# Expected: 5 (or similar number)
```

### 2. Test Next.js API Route

```bash
# Health check
curl http://localhost:3000/api/analyze/trigger

# Trigger analysis
curl -X POST http://localhost:3000/api/analyze/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "timeRange": "month"
  }' | jq
```

### 3. Test from Frontend

Add a test button in Behavior page:

```typescript
// In app/(dashboard)/behavior/page.tsx
const testLambda = async () => {
  const response = await fetch('/api/analyze/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'test-user-123', timeRange: 'month' })
  });
  const data = await response.json();
  console.log('Lambda response:', data);
};

// Add button in JSX
<button onClick={testLambda} className="...">
  🧪 Test Lambda
</button>
```

---

## Monitoring

### CloudWatch Logs

```bash
# View real-time logs
aws logs tail /aws/lambda/fincoach-contradiction-detector --follow

# View recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/fincoach-contradiction-detector \
  --filter-pattern "ERROR"
```

### CloudWatch Metrics (AWS Console)

1. Go to: https://console.aws.amazon.com/cloudwatch/
2. Navigate to: Metrics → Lambda
3. View:
   - Invocations (should stay < 1M/month for free tier)
   - Duration (should be ~200ms)
   - Errors (should be 0)
   - Throttles (should be 0)

### Cost Monitoring

```bash
# Check current month's estimated costs
aws ce get-cost-and-usage \
  --time-period Start=2024-12-01,End=2024-12-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --filter file://<(echo '{"Services":{"Key":"SERVICE","Values":["AWS Lambda"]}}')
```

Expected for free tier: $0.00

---

## Troubleshooting

### Issue: "Command not found: aws"

```bash
# Install AWS CLI
brew install awscli

# Verify installation
which aws
```

### Issue: "Unable to locate credentials"

```bash
# Configure AWS CLI
aws configure

# Verify credentials
aws sts get-caller-identity
```

### Issue: Lambda timeout (Task timed out after 3.00 seconds)

```bash
# Increase timeout to 30 seconds
aws lambda update-function-configuration \
  --function-name fincoach-contradiction-detector \
  --timeout 30
```

### Issue: "AccessDenied" when deploying

Your IAM user needs these permissions:
- `lambda:CreateFunction`
- `lambda:UpdateFunctionCode`
- `lambda:UpdateFunctionConfiguration`
- `iam:CreateRole`
- `iam:AttachRolePolicy`

```bash
# Check current permissions
aws iam list-attached-user-policies --user-name your-username
```

### Issue: Lambda returns 500 error

```bash
# View error logs
aws logs tail /aws/lambda/fincoach-contradiction-detector --follow

# Common causes:
# 1. TypeScript compilation errors → Run `npm run build` locally
# 2. Missing handler function → Verify index.js has `exports.handler`
# 3. Runtime errors → Check CloudWatch logs for stack traces
```

### Issue: High AWS costs

```bash
# Check invocation count
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=fincoach-contradiction-detector \
  --start-time 2024-12-01T00:00:00Z \
  --end-time 2024-12-31T23:59:59Z \
  --period 86400 \
  --statistics Sum

# If over 1M/month:
# - Add caching layer (store results in Vercel KV for 24h)
# - Rate limit API endpoint
# - Only trigger on user action, not automatically
```

---

## Next Steps

1. ✅ **Complete local testing** (`node test-local.js`)
2. ✅ **Deploy to AWS** (`./deploy.sh`)
3. ⬜ **Install AWS SDK** (`npm install @aws-sdk/client-lambda`)
4. ⬜ **Add environment variables** (`.env.local`)
5. ⬜ **Enable real Lambda integration** (uncomment Phase 2 code)
6. ⬜ **Test end-to-end** (frontend → API → Lambda → response)
7. ⬜ **Add caching layer** (store results in Vercel KV)
8. ⬜ **Set up monitoring alerts** (CloudWatch alarms for errors)
9. ⬜ **Deploy to Vercel** (production deployment)

---

## Cost Estimate

### Free Tier (Forever)
- **Invocations**: 1M requests/month FREE
- **Compute**: 400k GB-seconds/month FREE
- **Storage**: First 25GB FREE

### Example Usage
- 10k daily users = 300k requests/month = **$0.00**
- 50k daily users = 1.5M requests/month = **~$0.20/month**
- 100k daily users = 3M requests/month = **~$0.40/month**

**With caching (24h TTL):**
- 100k daily users → ~100k Lambda calls/month = **$0.00** (within free tier)

---

## Resources

- [AWS Lambda Pricing](https://aws.amazon.com/lambda/pricing/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

---

**🎉 You're ready to deploy production-grade behavioral analysis!**
