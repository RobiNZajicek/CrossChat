/**
 * Manual Webhook Test Script
 * 
 * Test Alpha → Beta webhook communication
 * 
 * Usage: node test-webhook.js
 */

const crypto = require('crypto');

const WEBHOOK_SECRET = 'development_secret_key_change_in_production';
const BETA_URL = 'http://localhost:3001/api/webhook';

function generateSignature(payload, secret) {
  const payloadString = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadString);
  return `sha256=${hmac.digest('hex')}`;
}

async function testChatMessage() {
  console.log('\n🧪 Testing chat.message webhook...\n');
  
  const payload = {
    event: 'chat.message',
    timestamp: Date.now(),
    source: 'localhost:3000',
    signature: '',
    data: {
      id: crypto.randomUUID(),
      user: 'test_user_123',
      text: 'Hello from Alpha! This is a test message.',
      platform: 'twitch',
      streamerId: 'test_streamer_001',
      timestamp: Date.now(),
      moderationScore: 5,
      metadata: {
        badges: ['subscriber', 'moderator'],
        color: '#FF0000'
      }
    }
  };
  
  payload.signature = generateSignature(payload, WEBHOOK_SECRET);
  
  try {
    const response = await fetch(BETA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
        'X-Webhook-Source': 'localhost:3000',
        'User-Agent': 'CrossChat-Test/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ chat.message webhook SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ chat.message webhook FAILED');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('❌ chat.message webhook ERROR');
    console.log('Error:', error.message);
  }
}

async function testModerationBan() {
  console.log('\n🧪 Testing moderation.ban webhook...\n');
  
  const payload = {
    event: 'moderation.ban',
    timestamp: Date.now(),
    source: 'localhost:3000',
    signature: '',
    data: {
      user: 'toxic_user_456',
      streamerId: 'test_streamer_001',
      reason: 'Banned words detected',
      moderationScore: 85,
      permanent: false,
      duration: 600000,
      expiresAt: Date.now() + 600000,
      triggeredBy: 'ai_moderation',
      details: {
        bannedWords: ['badword1', 'badword2'],
        spamScore: 40,
        capsScore: 20
      }
    }
  };
  
  payload.signature = generateSignature(payload, WEBHOOK_SECRET);
  
  try {
    const response = await fetch(BETA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
        'X-Webhook-Source': 'localhost:3000',
        'User-Agent': 'CrossChat-Test/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ moderation.ban webhook SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ moderation.ban webhook FAILED');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('❌ moderation.ban webhook ERROR');
    console.log('Error:', error.message);
  }
}

async function testStreamStart() {
  console.log('\n🧪 Testing stream.start webhook...\n');
  
  const payload = {
    event: 'stream.start',
    timestamp: Date.now(),
    source: 'localhost:3000',
    signature: '',
    data: {
      streamerId: 'test_streamer_001',
      username: 'test_streamer',
      startedAt: Date.now(),
      platforms: ['twitch', 'youtube', 'kick']
    }
  };
  
  payload.signature = generateSignature(payload, WEBHOOK_SECRET);
  
  try {
    const response = await fetch(BETA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
        'X-Webhook-Source': 'localhost:3000',
        'User-Agent': 'CrossChat-Test/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ stream.start webhook SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ stream.start webhook FAILED');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('❌ stream.start webhook ERROR');
    console.log('Error:', error.message);
  }
}

async function testStreamEnd() {
  console.log('\n🧪 Testing stream.end webhook...\n');
  
  const payload = {
    event: 'stream.end',
    timestamp: Date.now(),
    source: 'localhost:3000',
    signature: '',
    data: {
      streamerId: 'test_streamer_001',
      username: 'test_streamer',
      startedAt: Date.now() - 3600000,
      endedAt: Date.now(),
      duration: 3600000,
      messageCount: 1523,
      uniqueUsers: 342,
      bannedUsers: 5,
      averageToxicity: 12.5,
      platformBreakdown: {
        twitch: 892,
        youtube: 456,
        kick: 175
      }
    }
  };
  
  payload.signature = generateSignature(payload, WEBHOOK_SECRET);
  
  try {
    const response = await fetch(BETA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
        'X-Webhook-Source': 'localhost:3000',
        'User-Agent': 'CrossChat-Test/1.0'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ stream.end webhook SUCCESS');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ stream.end webhook FAILED');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log('❌ stream.end webhook ERROR');
    console.log('Error:', error.message);
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Alpha ↔ Beta Webhook Test Suite    ║');
  console.log('╚════════════════════════════════════════╝');
  
  console.log('\n📋 Test Configuration:');
  console.log(`   Beta URL: ${BETA_URL}`);
  console.log(`   Secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
  console.log('\n⚠️  Make sure Beta server is running on port 3001!\n');
  
  await testChatMessage();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testModerationBan();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testStreamStart();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testStreamEnd();
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║        All Tests Completed!           ║');
  console.log('╚════════════════════════════════════════╝\n');
}

runAllTests();


