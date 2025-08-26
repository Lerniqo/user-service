import { testEmailConnection } from './services/email.service';

// Simple test to verify email configuration
async function testEmail() {
  console.log('Testing email configuration...');
  
  try {
    const isConnected = await testEmailConnection();
    if (isConnected) {
      console.log('✅ Email configuration is working correctly!');
    } else {
      console.log('❌ Email configuration failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();
