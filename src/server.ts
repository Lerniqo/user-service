import app from './app';
import { config } from './config/env';

This user service includes a comprehensive Kafka client implementation for event-driven communication with other microservices.import { log } from './config/logger';

import { kafkaService } from './services/kafka.service';

## Featuresimport { initializeConsumers } from './services/kafka.consumer.handlers';



- ✅ **Producer**: Publish messages to Kafka topicsconst PORT: number = config.server.port;

- ✅ **Consumer**: Subscribe to and consume messages from topics

- ✅ **Admin**: Create and manage topics// Handle uncaught exceptions and unhandled rejections

- ✅ **Event Types**: Strongly-typed event definitionsprocess.on('uncaughtException', (error: Error) => {

- ✅ **Auto-reconnection**: Automatic reconnection handling  log.error('Uncaught Exception', error);

- ✅ **Graceful Shutdown**: Proper cleanup on service termination  process.exit(1);

- ✅ **Error Handling**: Comprehensive error logging});

- ✅ **Pattern Matching**: Subscribe to multiple topics with regex patterns

process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {

## Files Structure  log.error('Unhandled Promise Rejection', reason instanceof Error ? reason : new Error(String(reason)), {

    promise: promise.toString()

```  });

src/  process.exit(1);

├── services/});

│   ├── kafka.service.ts                  # Main Kafka service (singleton)

│   ├── user.events.service.ts           # User event publisher helpers// Graceful shutdown handling

│   └── kafka.consumer.handlers.ts       # Consumer message handlersprocess.on('SIGTERM', async () => {

├── types/  log.info('SIGTERM received, shutting down gracefully');

│   └── kafka.events.ts                  # Event type definitions  await gracefulShutdown();

└── config/});

    └── env.ts                           # Kafka configuration

```process.on('SIGINT', async () => {

  log.info('SIGINT received, shutting down gracefully');

## Environment Variables  await gracefulShutdown();

});

Add these environment variables to your `.env` file:

async function gracefulShutdown() {

```env  try {

# Kafka Configuration    // Disconnect Kafka clients

KAFKA_BROKERS=localhost:9092              # Comma-separated list of brokers    await kafkaService.disconnect();

KAFKA_CLIENT_ID=user-service              # Unique client identifier    

KAFKA_GROUP_ID=user-service-group         # Consumer group ID    // Close server

    server.close(() => {

# Optional: SSL Configuration      log.info('Server closed successfully');

KAFKA_SSL=false                           # Enable SSL (true/false)      process.exit(0);

    });

# Optional: SASL Authentication

KAFKA_SASL_MECHANISM=                     # plain, scram-sha-256, or scram-sha-512    // Force shutdown after 10 seconds

KAFKA_SASL_USERNAME=                      # SASL username    setTimeout(() => {

KAFKA_SASL_PASSWORD=                      # SASL password      log.error('Forced shutdown after timeout');

      process.exit(1);

# Optional: Timeouts (in milliseconds)    }, 10000);

KAFKA_CONNECTION_TIMEOUT=30000            # Connection timeout  } catch (error) {

KAFKA_REQUEST_TIMEOUT=30000               # Request timeout    log.error('Error during shutdown', error instanceof Error ? error : new Error(String(error)));

```    process.exit(1);

  }

## Quick Start}



### 1. Install Dependenciesconst server = app.listen(PORT, async () => {

  log.info('User Service started successfully', {

Already installed via package.json:    port: PORT,

- `kafkajs`: Kafka client library    environment: config.server.nodeEnv,

    nodeVersion: process.version,

### 2. Start Kafka Locally (Development)    timestamp: new Date().toISOString()

  });

Using Docker:

  // Initialize Kafka

```bash  try {

# Create docker-compose.kafka.yml    log.info('Initializing Kafka services...');

docker-compose -f docker-compose.kafka.yml up -d    

```    // Connect Kafka producer

    await kafkaService.connectProducer();

Sample `docker-compose.kafka.yml`:    

    // Initialize Kafka consumers (if needed)

```yaml    // Uncomment the line below when you're ready to consume messages

version: '3.8'    // await initializeConsumers();

services:    

  zookeeper:    log.info('Kafka services initialized successfully');

    image: confluentinc/cp-zookeeper:latest  } catch (error) {

    environment:    log.error('Failed to initialize Kafka services', error instanceof Error ? error : new Error(String(error)));

      ZOOKEEPER_CLIENT_PORT: 2181    log.warn('Server will continue without Kafka functionality');

      ZOOKEEPER_TICK_TIME: 2000  }

    ports:}).on('error', (error) => {

      - "2181:2181"  log.error('Server failed to start', error, {

    port: PORT,

  kafka:    environment: config.server.nodeEnv

    image: confluentinc/cp-kafka:latest  });

    depends_on:  process.exit(1);

      - zookeeper});

    ports:

      - "9092:9092"export default server; 
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

### 3. Publishing Events

#### Using the User Events Producer

```typescript
import { userEventsProducer } from './services/user.events.service';

// In your controller or service
async function registerUser(email: string, password: string, role: string) {
  // ... user registration logic ...
  
  // Publish event
  await userEventsProducer.publishUserCreated(
    user.id,
    user.email,
    user.role,
    user.fullName
  );
}
```

#### Using the Kafka Service Directly

```typescript
import { kafkaService } from './services/kafka.service';

// Publish a single message
await kafkaService.publish('my-topic', {
  userId: '123',
  action: 'profile_updated'
}, 'user-123'); // Optional key for partitioning

// Publish multiple messages in a batch
await kafkaService.publishBatch('my-topic', [
  { value: { userId: '123', action: 'login' }, key: 'user-123' },
  { value: { userId: '456', action: 'logout' }, key: 'user-456' }
]);
```

### 4. Consuming Events

#### Enable Consumers

In `server.ts`, uncomment this line:

```typescript
await initializeConsumers();
```

#### Add Consumer Handlers

In `kafka.consumer.handlers.ts`:

```typescript
import { EachMessagePayload } from 'kafkajs';
import { kafkaService } from './kafka.service';

// Define your handler
export async function handleNotificationEvents(payload: EachMessagePayload): Promise<void> {
  const { topic, partition, message } = payload;
  const event = JSON.parse(message.value?.toString() || '{}');
  
  // Your business logic here
  console.log('Received event:', event);
}

// Subscribe in initializeConsumers
export async function initializeConsumers(): Promise<void> {
  await kafkaService.connectConsumer();
  
  // Subscribe to specific topic
  await kafkaService.subscribe(
    'notification.sent',
    handleNotificationEvents,
    false // fromBeginning
  );
  
  // Subscribe with pattern matching
  await kafkaService.subscribePattern(
    /^notification\..*/,
    handleNotificationEvents,
    false
  );
}
```

### 5. Admin Operations

```typescript
import { kafkaService } from './services/kafka.service';

// Connect admin client
await kafkaService.connectAdmin();

// Create a topic
await kafkaService.createTopic('my-new-topic', 3, 1); // 3 partitions, replication factor 1

// List all topics
const topics = await kafkaService.listTopics();
console.log('Topics:', topics);

// Delete topics
await kafkaService.deleteTopics(['old-topic-1', 'old-topic-2']);
```

## Event Types

### Available User Events

All events are defined in `src/types/kafka.events.ts`:

1. **USER_CREATED** - When a new user registers
2. **USER_UPDATED** - When user profile is updated
3. **USER_DELETED** - When a user is deleted
4. **USER_VERIFIED** - When email is verified
5. **USER_PASSWORD_RESET** - When password is reset
6. **USER_PROFILE_COMPLETED** - When user completes their profile
7. **USER_LOGIN** - When user logs in
8. **USER_LOGOUT** - When user logs out

### Event Structure

All events follow this structure:

```typescript
{
  eventId: string;           // Unique event identifier (UUID)
  eventType: string;         // Type of event (e.g., 'USER_CREATED')
  timestamp: string;         // ISO 8601 timestamp
  service: string;           // Service name ('user-service')
  version: string;           // Event version ('1.0.0')
  data: {                    // Event-specific data
    // ... event payload ...
  }
}
```

## Integration Examples

### Example 1: Publish Event on User Registration

In `users.controller.ts`:

```typescript
import { userEventsProducer } from '../services/user.events.service';

async function register(req: Request, res: Response) {
  try {
    // Create user
    const user = await prisma.user.create({ ... });
    
    // Publish event
    await userEventsProducer.publishUserCreated(
      user.id,
      user.email,
      user.role
    );
    
    res.status(201).json({ success: true, user });
  } catch (error) {
    // Error handling
  }
}
```

### Example 2: Consume Events from Another Service

```typescript
// In kafka.consumer.handlers.ts
export async function handlePaymentEvents(payload: EachMessagePayload): Promise<void> {
  const event = JSON.parse(payload.message.value?.toString() || '{}');
  
  if (event.eventType === 'SUBSCRIPTION_ACTIVATED') {
    // Update user's subscription status
    await prisma.user.update({
      where: { id: event.data.userId },
      data: { subscriptionStatus: 'active' }
    });
  }
}

// Subscribe to payment events
await kafkaService.subscribe(
  'payment.subscription.activated',
  handlePaymentEvents
);
```

## Best Practices

### 1. Error Handling

Events are "fire-and-forget" - failures should be logged but not throw errors:

```typescript
try {
  await userEventsProducer.publishUserCreated(...);
} catch (error) {
  log.error('Failed to publish event', { error });
  // Don't throw - continue with request
}
```

### 2. Message Keys

Use consistent keys for partitioning:

```typescript
// Good - ensures all events for same user go to same partition
await kafkaService.publish('user.updated', event, userId);

// Avoid - random partitioning makes ordering harder
await kafkaService.publish('user.updated', event);
```

### 3. Topic Naming Convention

Use dot notation: `<service>.<entity>.<action>`

Examples:
- `user.account.created`
- `payment.subscription.activated`
- `notification.email.sent`

### 4. Schema Evolution

When changing event structure:
1. Increment the version number
2. Support backward compatibility
3. Document breaking changes

### 5. Consumer Idempotency

Always handle duplicate messages:

```typescript
export async function handleEvent(payload: EachMessagePayload): Promise<void> {
  const event = JSON.parse(payload.message.value?.toString() || '{}');
  
  // Check if already processed
  const processed = await redis.get(`event:${event.eventId}`);
  if (processed) {
    log.info('Event already processed', { eventId: event.eventId });
    return;
  }
  
  // Process event
  // ...
  
  // Mark as processed
  await redis.set(`event:${event.eventId}`, '1', 'EX', 86400);
}
```

## Monitoring

### Check Kafka Status

```typescript
// Check if producer is ready
if (kafkaService.isProducerReady()) {
  console.log('Producer is connected');
}

// Check if consumer is ready
if (kafkaService.isConsumerReady()) {
  console.log('Consumer is connected');
}
```

### Logging

All Kafka operations are logged using Winston. Check logs for:
- Connection status
- Published messages
- Consumed messages
- Errors and warnings

## Troubleshooting

### Issue: "Kafka producer is not connected"

**Solution**: Ensure Kafka is running and brokers are accessible:

```bash
# Check if Kafka is running
docker ps | grep kafka

# Test connectivity
telnet localhost 9092
```

### Issue: "Consumer not receiving messages"

**Checks**:
1. Is `initializeConsumers()` called in `server.ts`?
2. Are topics created?
3. Is consumer subscribed to correct topics?
4. Check consumer group offset

```typescript
// List topics to verify they exist
const topics = await kafkaService.listTopics();
console.log(topics);
```

### Issue: "SASL authentication failed"

**Solution**: Verify SASL credentials in `.env`:

```env
KAFKA_SASL_MECHANISM=plain
KAFKA_SASL_USERNAME=your-username
KAFKA_SASL_PASSWORD=your-password
```

## Production Considerations

1. **Replication**: Use replication factor ≥ 3 for production topics
2. **Partitions**: Plan partitions based on expected throughput
3. **Retention**: Configure appropriate retention policies
4. **Monitoring**: Use Kafka monitoring tools (Kafka Manager, Confluent Control Center)
5. **Security**: Enable SSL and SASL authentication
6. **Compression**: Enable compression for large messages

## Additional Resources

- [KafkaJS Documentation](https://kafka.js.org/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Kafka Guide](https://docs.confluent.io/)

## Support

For issues or questions, please refer to:
- Project documentation
- KafkaJS GitHub issues
- Team communication channels
