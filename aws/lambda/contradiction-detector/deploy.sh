#!/bin/bash

# FinCoach Lambda Deployment Script
# Prerequisites:
# 1. AWS CLI installed (brew install awscli)
# 2. AWS credentials configured (aws configure)
# 3. Lambda function created in AWS Console or via CLI

set -e  # Exit on error

FUNCTION_NAME="fincoach-contradiction-detector"
REGION="us-east-1"  # Change to your preferred region
RUNTIME="nodejs20.x"
HANDLER="index.handler"
ROLE_NAME="fincoach-lambda-role"

echo "🚀 FinCoach Lambda Deployment"
echo "=============================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install with: brew install awscli"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Build TypeScript
echo "📦 Building TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
if [ -f function.zip ]; then
    rm function.zip
fi
zip -r function.zip index.js package.json
echo "✅ Package created: function.zip"
echo ""

# Check if function exists
echo "🔍 Checking if Lambda function exists..."
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION &> /dev/null; then
    echo "✅ Function exists, updating code..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION
    echo "✅ Function code updated!"
else
    echo "📋 Function doesn't exist. Creating new function..."
    
    # Check if role exists
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo "📋 Creating IAM role..."
        
        # Create trust policy
        cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
        
        # Create role
        aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document file://trust-policy.json
        
        # Attach basic execution policy
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        
        # Get role ARN
        ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
        
        echo "✅ IAM role created: $ROLE_ARN"
        echo "⏳ Waiting 10 seconds for role to propagate..."
        sleep 10
        
        # Clean up
        rm trust-policy.json
    fi
    
    # Create function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role $ROLE_ARN \
        --handler $HANDLER \
        --zip-file fileb://function.zip \
        --timeout 30 \
        --memory-size 512 \
        --region $REGION \
        --description "FinCoach behavioral contradiction detection engine"
    
    echo "✅ Lambda function created!"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Function Details:"
echo "   Name: $FUNCTION_NAME"
echo "   Region: $REGION"
echo "   Runtime: $RUNTIME"
echo ""
echo "🧪 Test your function:"
echo "   aws lambda invoke --function-name $FUNCTION_NAME --payload file://test-event.json response.json"
echo ""
echo "📊 View logs:"
echo "   aws logs tail /aws/lambda/$FUNCTION_NAME --follow"
echo ""
