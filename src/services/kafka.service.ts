import { Kafka, Producer, Consumer, Admin, KafkaMessage, EachMessagePayload, logLevel } from 'kafkajs';
import { config } from '../config/env';
import { log } from '../config/logger';

/**
 * KafkaService - A singleton service for managing Kafka producer, consumer, and admin operations
 * 
 * Features:
 * - Singleton pattern to ensure single Kafka instance
 * - Producer for publishing messages
 * - Consumer for subscribing to topics
 * - Admin client for topic management
 * - Automatic reconnection handling
 * - Message handler registration
 * - Graceful shutdown
 */
class KafkaService {
  private static instance: KafkaService;
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private admin: Admin | null = null;
  private isProducerConnected = false;
  private isConsumerConnected = false;
  private messageHandlers: Map<string, (payload: EachMessagePayload) => Promise<void>> = new Map();

  private constructor() {
    const kafkaConfig: any = {
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      connectionTimeout: config.kafka.connectionTimeout,
      requestTimeout: config.kafka.requestTimeout,
      logLevel: logLevel.INFO,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    };

    // Add SSL configuration if enabled
    if (config.kafka.ssl) {
      kafkaConfig.ssl = true;
    }

    // Add SASL authentication if configured
    if (config.kafka.saslMechanism && config.kafka.saslUsername && config.kafka.saslPassword) {
      kafkaConfig.sasl = {
        mechanism: config.kafka.saslMechanism,
        username: config.kafka.saslUsername,
        password: config.kafka.saslPassword,
      };
    }

    this.kafka = new Kafka(kafkaConfig);

    log.info('Kafka service initialized', {
      clientId: config.kafka.clientId,
      brokers: config.kafka.brokers,
      ssl: config.kafka.ssl,
      sasl: !!config.kafka.saslMechanism,
    });
  }

  /**
   * Get the singleton instance of KafkaService
   */
  public static getInstance(): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService();
    }
    return KafkaService.instance;
  }

  /**
   * Initialize and connect the Kafka producer
   */
  public async connectProducer(): Promise<void> {
    if (this.isProducerConnected) {
      log.warn('Kafka producer is already connected');
      return;
    }

    try {
      this.producer = this.kafka.producer({
        allowAutoTopicCreation: true,
        transactionTimeout: 30000,
      });

      await this.producer.connect();
      this.isProducerConnected = true;

      log.info('Kafka producer connected successfully');
    } catch (error) {
      log.error('Failed to connect Kafka producer', { error });
      throw error;
    }
  }

  /**
   * Initialize and connect the Kafka consumer
   */
  public async connectConsumer(): Promise<void> {
    if (this.isConsumerConnected) {
      log.warn('Kafka consumer is already connected');
      return;
    }

    try {
      this.consumer = this.kafka.consumer({
        groupId: config.kafka.groupId,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      });

      await this.consumer.connect();
      this.isConsumerConnected = true;

      log.info('Kafka consumer connected successfully', {
        groupId: config.kafka.groupId,
      });

      // Start consuming messages if there are registered handlers
      if (this.messageHandlers.size > 0) {
        await this.startConsuming();
      }
    } catch (error) {
      log.error('Failed to connect Kafka consumer', { error });
      throw error;
    }
  }

  /**
   * Initialize the Kafka admin client
   */
  public async connectAdmin(): Promise<void> {
    if (this.admin) {
      log.warn('Kafka admin is already connected');
      return;
    }

    try {
      this.admin = this.kafka.admin();
      await this.admin.connect();

      log.info('Kafka admin connected successfully');
    } catch (error) {
      log.error('Failed to connect Kafka admin', { error });
      throw error;
    }
  }

  /**
   * Publish a message to a Kafka topic
   * @param topic - The topic to publish to
   * @param message - The message payload
   * @param key - Optional message key for partitioning
   */
  public async publish(
    topic: string,
    message: any,
    key?: string
  ): Promise<void> {
    if (!this.producer || !this.isProducerConnected) {
      throw new Error('Kafka producer is not connected. Call connectProducer() first.');
    }

    try {
      const messageValue = typeof message === 'string' ? message : JSON.stringify(message);

      await this.producer.send({
        topic,
        messages: [
          {
            key: key || null,
            value: messageValue,
            timestamp: Date.now().toString(),
          },
        ],
      });

      log.debug('Message published to Kafka', {
        topic,
        key,
        messageSize: messageValue.length,
      });
    } catch (error) {
      log.error('Failed to publish message to Kafka', {
        topic,
        error,
      });
      throw error;
    }
  }

  /**
   * Publish multiple messages to a Kafka topic in a batch
   * @param topic - The topic to publish to
   * @param messages - Array of message objects with value and optional key
   */
  public async publishBatch(
    topic: string,
    messages: Array<{ value: any; key?: string }>
  ): Promise<void> {
    if (!this.producer || !this.isProducerConnected) {
      throw new Error('Kafka producer is not connected. Call connectProducer() first.');
    }

    try {
      const kafkaMessages = messages.map((msg) => ({
        key: msg.key || null,
        value: typeof msg.value === 'string' ? msg.value : JSON.stringify(msg.value),
        timestamp: Date.now().toString(),
      }));

      await this.producer.send({
        topic,
        messages: kafkaMessages,
      });

      log.debug('Batch messages published to Kafka', {
        topic,
        count: messages.length,
      });
    } catch (error) {
      log.error('Failed to publish batch messages to Kafka', {
        topic,
        error,
      });
      throw error;
    }
  }

  /**
   * Subscribe to a Kafka topic and register a message handler
   * @param topic - The topic to subscribe to
   * @param handler - The function to handle incoming messages
   * @param fromBeginning - Whether to consume from the beginning of the topic
   */
  public async subscribe(
    topic: string,
    handler: (payload: EachMessagePayload) => Promise<void>,
    fromBeginning: boolean = false
  ): Promise<void> {
    if (!this.consumer) {
      throw new Error('Kafka consumer is not initialized. Call connectConsumer() first.');
    }

    try {
      await this.consumer.subscribe({
        topic,
        fromBeginning,
      });

      this.messageHandlers.set(topic, handler);

      log.info('Subscribed to Kafka topic', {
        topic,
        fromBeginning,
      });

      // Start consuming if not already running
      if (this.isConsumerConnected && this.messageHandlers.size === 1) {
        await this.startConsuming();
      }
    } catch (error) {
      log.error('Failed to subscribe to Kafka topic', {
        topic,
        error,
      });
      throw error;
    }
  }

  /**
   * Subscribe to multiple topics with pattern matching
   * @param pattern - Regex pattern to match topics
   * @param handler - The function to handle incoming messages
   * @param fromBeginning - Whether to consume from the beginning of the topic
   */
  public async subscribePattern(
    pattern: RegExp,
    handler: (payload: EachMessagePayload) => Promise<void>,
    fromBeginning: boolean = false
  ): Promise<void> {
    if (!this.consumer) {
      throw new Error('Kafka consumer is not initialized. Call connectConsumer() first.');
    }

    try {
      await this.consumer.subscribe({
        topic: pattern,
        fromBeginning,
      });

      this.messageHandlers.set(pattern.source, handler);

      log.info('Subscribed to Kafka topics with pattern', {
        pattern: pattern.source,
        fromBeginning,
      });

      // Start consuming if not already running
      if (this.isConsumerConnected && this.messageHandlers.size === 1) {
        await this.startConsuming();
      }
    } catch (error) {
      log.error('Failed to subscribe to Kafka topics with pattern', {
        pattern: pattern.source,
        error,
      });
      throw error;
    }
  }

  /**
   * Start consuming messages from subscribed topics
   */
  private async startConsuming(): Promise<void> {
    if (!this.consumer) {
      throw new Error('Kafka consumer is not initialized');
    }

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;

        try {
          log.debug('Received Kafka message', {
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
          });

          // Find the appropriate handler for this topic
          let handler = this.messageHandlers.get(topic);
          
          // If no exact match, check for pattern matches
          if (!handler) {
            for (const [pattern, patternHandler] of this.messageHandlers.entries()) {
              if (new RegExp(pattern).test(topic)) {
                handler = patternHandler;
                break;
              }
            }
          }

          if (handler) {
            await handler(payload);
          } else {
            log.warn('No handler found for topic', { topic });
          }
        } catch (error) {
          log.error('Error processing Kafka message', {
            topic,
            partition,
            offset: message.offset,
            error,
          });
        }
      },
    });

    log.info('Kafka consumer started consuming messages');
  }

  /**
   * Create a new topic
   * @param topic - The topic name to create
   * @param numPartitions - Number of partitions (default: 1)
   * @param replicationFactor - Replication factor (default: 1)
   */
  public async createTopic(
    topic: string,
    numPartitions: number = 1,
    replicationFactor: number = 1
  ): Promise<void> {
    if (!this.admin) {
      throw new Error('Kafka admin is not connected. Call connectAdmin() first.');
    }

    try {
      await this.admin.createTopics({
        topics: [
          {
            topic,
            numPartitions,
            replicationFactor,
          },
        ],
      });

      log.info('Kafka topic created successfully', {
        topic,
        numPartitions,
        replicationFactor,
      });
    } catch (error) {
      log.error('Failed to create Kafka topic', {
        topic,
        error,
      });
      throw error;
    }
  }

  /**
   * List all topics
   */
  public async listTopics(): Promise<string[]> {
    if (!this.admin) {
      throw new Error('Kafka admin is not connected. Call connectAdmin() first.');
    }

    try {
      const topics = await this.admin.listTopics();
      log.debug('Listed Kafka topics', { count: topics.length });
      return topics;
    } catch (error) {
      log.error('Failed to list Kafka topics', { error });
      throw error;
    }
  }

  /**
   * Delete topics
   * @param topics - Array of topic names to delete
   */
  public async deleteTopics(topics: string[]): Promise<void> {
    if (!this.admin) {
      throw new Error('Kafka admin is not connected. Call connectAdmin() first.');
    }

    try {
      await this.admin.deleteTopics({
        topics,
      });

      log.info('Kafka topics deleted successfully', { topics });
    } catch (error) {
      log.error('Failed to delete Kafka topics', {
        topics,
        error,
      });
      throw error;
    }
  }

  /**
   * Gracefully disconnect all Kafka clients
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.producer && this.isProducerConnected) {
        await this.producer.disconnect();
        this.isProducerConnected = false;
        log.info('Kafka producer disconnected');
      }

      if (this.consumer && this.isConsumerConnected) {
        await this.consumer.disconnect();
        this.isConsumerConnected = false;
        log.info('Kafka consumer disconnected');
      }

      if (this.admin) {
        await this.admin.disconnect();
        this.admin = null;
        log.info('Kafka admin disconnected');
      }

      log.info('Kafka service disconnected successfully');
    } catch (error) {
      log.error('Error disconnecting Kafka service', { error });
      throw error;
    }
  }

  /**
   * Check if producer is connected
   */
  public isProducerReady(): boolean {
    return this.isProducerConnected;
  }

  /**
   * Check if consumer is connected
   */
  public isConsumerReady(): boolean {
    return this.isConsumerConnected;
  }
}

// Export singleton instance
export const kafkaService = KafkaService.getInstance();
