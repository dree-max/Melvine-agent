require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Anthropic = require('@anthropic-ai/sdk');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── SECURITY MIDDLEWARE ────────────────────────────────────────
app.use(helmet());

// ── CORS CONFIGURATION ─────────────────────────────────────────
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// ── BODY PARSER ────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// ── RATE LIMITING ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/chat', limiter);

// ── LOGGING MIDDLEWARE ─────────────────────────────────────────
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// ── INITIALIZE ANTHROPIC CLIENT ────────────────────────────────
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  logger.error('ANTHROPIC_API_KEY environment variable is not set');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

// ── VALIDATION UTILITIES ───────────────────────────────────────
const validateChatRequest = (body) => {
  const errors = [];

  if (!body.messages || !Array.isArray(body.messages)) {
    errors.push('messages must be an array');
  } else if (body.messages.length === 0) {
    errors.push('messages array cannot be empty');
  }

  if (!body.system || typeof body.system !== 'string') {
    errors.push('system prompt is required');
  }

  if (body.max_tokens && (typeof body.max_tokens !== 'number' || body.max_tokens < 1 || body.max_tokens > 4096)) {
    errors.push('max_tokens must be between 1 and 4096');
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
};

// ── ROUTES ─────────────────────────────────────────────────────

/**
 * Health Check
 * GET /
 */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    agent: 'Melvine Personal AI Assistant',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Chat with Claude
 * POST /chat
 * Body: { system: string, messages: Array, max_tokens?: number }
 */
app.post('/chat', async (req, res) => {
  try {
    const { system, messages, max_tokens } = req.body;

    // Validate request
    const validation = validateChatRequest(req.body);
    if (!validation.valid) {
      logger.warn({ errors: validation.errors });
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.errors,
      });
    }

    logger.info({
      event: 'chat_request',
      messageCount: messages.length,
      maxTokens: max_tokens || 600,
    });

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: max_tokens || 600,
      system,
      messages,
    });

    logger.info({
      event: 'chat_success',
      tokensUsed: response.usage?.output_tokens || 0,
    });

    res.status(200).json({
      success: true,
      content: response.content,
      usage: response.usage,
    });
  } catch (err) {
    logger.error({
      event: 'chat_error',
      error: err.message,
      statusCode: err.status || 500,
    });

    const statusCode = err.status || 500;
    const message = NODE_ENV === 'production' 
      ? 'An error occurred processing your request' 
      : err.message;

    res.status(statusCode).json({
      error: message,
      ...(NODE_ENV !== 'production' && { details: err.message }),
    });
  }
});

/**
 * Health check for deployment
 * GET /health
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 HANDLER ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// ── ERROR HANDLER ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error({
    event: 'unhandled_error',
    error: err.message,
    stack: NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});

// ── START SERVER ───────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`✨ Melvine AI Assistant running on port ${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
});

module.exports = app;
