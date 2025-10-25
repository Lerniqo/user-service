import { kafkaService } from '../services/kafka.service';
import { userEventsProducer } from '../services/user.events.service';
import { log } from '../config/logger';

/**
 * Kafka Connection Test Script
 * 
 * This script tests the Kafka connection and basic operations.
 * Run with: npx ts-node src/scripts/test-kafka.ts
 */

async function testKafkaConnection() {
  console.log('🚀 Starting Kafka connection test...\n');

  try {
    // Test 1: Connect Producer
    console.log('📤 Test 1: Connecting Kafka Producer...');
    await kafkaService.connectProducer();
    console.log('✅ Producer connected successfully\n');

    // Test 2: Publish a test message
    console.log('📨 Test 2: Publishing test message...');
    await kafkaService.publish('test.topic', {
      message: 'Hello from user-service',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Test message published successfully\n');

    // Test 3: Publish user event
    console.log('👤 Test 3: Publishing user created event...');
    await userEventsProducer.publishUserCreated(
      'test-user-123',
      'test@example.com',
      'Student',
      'Test User'
    );
    console.log('✅ User event published successfully\n');

    // Test 4: Connect Admin
    console.log('⚙️  Test 4: Connecting Kafka Admin...');
    await kafkaService.connectAdmin();
    console.log('✅ Admin connected successfully\n');

    // Test 5: List topics
    console.log('📋 Test 5: Listing topics...');
    const topics = await kafkaService.listTopics();
    console.log('✅ Topics found:', topics.length);
    console.log('   Topics:', topics.slice(0, 10).join(', '), topics.length > 10 ? '...' : '');
    console.log('');

    // Test 6: Create a test topic
    console.log('🆕 Test 6: Creating test topic...');
    try {
      await kafkaService.createTopic('user-service-test', 3, 1);
      console.log('✅ Test topic created successfully\n');
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('ℹ️  Topic already exists (OK)\n');
      } else {
        throw error;
      }
    }

    // Test 7: Batch publish
    console.log('📦 Test 7: Publishing batch messages...');
    await kafkaService.publishBatch('test.batch.topic', [
      { value: { id: 1, message: 'First message' }, key: 'msg-1' },
      { value: { id: 2, message: 'Second message' }, key: 'msg-2' },
      { value: { id: 3, message: 'Third message' }, key: 'msg-3' },
    ]);
    console.log('✅ Batch messages published successfully\n');

    // Test 8: Check connection status
    console.log('🔍 Test 8: Checking connection status...');
    const producerReady = kafkaService.isProducerReady();
    const consumerReady = kafkaService.isConsumerReady();
    console.log(`   Producer: ${producerReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log(`   Consumer: ${consumerReady ? '✅ Ready' : '❌ Not Ready'}`);
    console.log('');

    console.log('🎉 All tests passed successfully!\n');

    // Summary
    console.log('📊 Summary:');
    console.log('   - Producer: ✅ Connected and tested');
    console.log('   - Admin: ✅ Connected and tested');
    console.log('   - Publishing: ✅ Working');
    console.log('   - Topics: ✅ Created and listed');
    console.log('');

    console.log('💡 Next steps:');
    console.log('   1. Check Kafka UI at http://localhost:8080 (if running)');
    console.log('   2. Enable consumers in server.ts if needed');
    console.log('   3. Integrate event publishing in your controllers');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    log.error('Kafka test failed', error instanceof Error ? error : new Error(String(error)));
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up...');
    await kafkaService.disconnect();
    console.log('✅ Disconnected from Kafka\n');
    console.log('👋 Test completed!');
    process.exit(0);
  }
}

// Run the test
testKafkaConnection().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
