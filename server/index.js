import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables with error handling
const dotenvResult = dotenv.config();
if (dotenvResult.error) {
  console.error('Error loading .env file:', dotenvResult.error.message);
  console.log('Continuing with system environment variables...');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Azure Language API configuration
let azureConfigured = false;
let azureEndpoint = '';
let azureKey = '';

const initializeAzureConfig = () => {
  try {
    const endpoint = process.env.AZURE_TEXT_ANALYTICS_ENDPOINT;
    const key = process.env.AZURE_TEXT_ANALYTICS_KEY;
    
    console.log('🔍 Azure Configuration Check:');
    console.log(`   Endpoint provided: ${!!endpoint}`);
    console.log(`   Key provided: ${!!key}`);
    
    if (!endpoint || !key) {
      console.log('⚠️  Azure Text Analytics credentials not found in environment variables');
      console.log('   Please set AZURE_TEXT_ANALYTICS_ENDPOINT and AZURE_TEXT_ANALYTICS_KEY in your .env file');
      return false;
    }
    
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   Key length: ${key.length} characters`);
    console.log(`   Key preview: ${key.substring(0, 8)}...${key.substring(key.length - 8)}`);
    
    // Validate endpoint format
    if (!endpoint.startsWith('https://') || !endpoint.includes('cognitiveservices.azure.com')) {
      console.error('❌ Invalid Azure endpoint format. Expected: https://your-resource-name.cognitiveservices.azure.com/');
      console.error(`   Your endpoint: ${endpoint}`);
      return false;
    }
    
    // Ensure endpoint ends with /
    azureEndpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/';
    azureKey = key;
    
    // Updated key validation - Azure keys can be 32 or 64+ characters
    if (key.length < 32) {
      console.error('❌ Invalid Azure API key format. Key appears to be too short.');
      return false;
    }
    
    console.log('✅ Azure Language API configuration initialized successfully');
    console.log(`   Using endpoint: ${azureEndpoint}`);
    azureConfigured = true;
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize Azure Language API configuration:', error.message);
    return false;
  }
};

// Initialize Azure configuration
initializeAzureConfig();

// Azure Language API functions for different features
const callAzureLanguageAPI = async (requestBody) => {
  const url = `${azureEndpoint}language/:analyze-text?api-version=2023-04-01`;
  
  console.log('🔵 Making Azure API call to:', url);
  console.log('🔵 Request body:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': azureKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  console.log('🔵 Azure API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Azure API error response:', errorText);
    throw new Error(`Azure API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Azure API response:', JSON.stringify(result, null, 2));
  
  if (result.results?.errors?.length > 0) {
    console.error('❌ Azure API returned errors:', result.results.errors);
    throw new Error(`Azure API error: ${JSON.stringify(result.results.errors)}`);
  }

  return result;
};

// Sentiment Analysis
const analyzeSentiment = async (text) => {
  const requestBody = {
    kind: "SentimentAnalysis",
    analysisInput: {
      documents: [{ id: "1", text: text, language: "en" }]
    },
    parameters: { modelVersion: "latest" }
  };

  const result = await callAzureLanguageAPI(requestBody);
  return result.results.documents[0];
};

// Key Phrase Extraction
const extractKeyPhrases = async (text) => {
  const requestBody = {
    kind: "KeyPhraseExtraction",
    analysisInput: {
      documents: [{ id: "1", text: text, language: "en" }]
    },
    parameters: { modelVersion: "latest" }
  };

  const result = await callAzureLanguageAPI(requestBody);
  return result.results.documents[0];
};

// Named Entity Recognition
const recognizeEntities = async (text) => {
  const requestBody = {
    kind: "EntityRecognition",
    analysisInput: {
      documents: [{ id: "1", text: text, language: "en" }]
    },
    parameters: { modelVersion: "latest" }
  };

  const result = await callAzureLanguageAPI(requestBody);
  const rawResult = result.results.documents[0];
  
  // Process the result to match the expected format
  const entitiesByCategory = {};
  rawResult.entities.forEach(entity => {
    if (!entitiesByCategory[entity.category]) {
      entitiesByCategory[entity.category] = [];
    }
    entitiesByCategory[entity.category].push(entity);
  });

  return {
    entities: rawResult.entities,
    entitiesByCategory: entitiesByCategory,
    totalEntities: rawResult.entities.length,
    categories: Object.keys(entitiesByCategory)
  };
};

// Text Summarization - Fixed implementation
const summarizeText = async (text) => {
  console.log('🔵 Starting text summarization for text length:', text.length);
  
  // Calculate appropriate sentence count based on text length
  const wordCount = text.trim().split(/\s+/).length;
  let sentenceCount = 3; // default
  
  if (wordCount > 1000) sentenceCount = 5;
  else if (wordCount > 500) sentenceCount = 4;
  else if (wordCount > 200) sentenceCount = 3;
  else sentenceCount = 2;
  
  console.log(`🔵 Text has ${wordCount} words, requesting ${sentenceCount} sentences`);

  const requestBody = {
    kind: "ExtractiveSummarization",
    analysisInput: {
      documents: [{ id: "1", text: text, language: "en" }]
    },
    parameters: {
      modelVersion: "latest",
      sentenceCount: sentenceCount,
      sortBy: "Rank"
    }
  };

  try {
    const result = await callAzureLanguageAPI(requestBody);
    const summaryResult = result.results.documents[0];
    
    console.log('✅ Summarization successful, sentences found:', summaryResult.sentences?.length || 0);
    
    if (!summaryResult.sentences || summaryResult.sentences.length === 0) {
      console.log('⚠️ No sentences returned from Azure summarization');
      return {
        summary: "Unable to generate summary for this text.",
        sentences: [],
        originalLength: text.length,
        summaryLength: 0,
        compressionRatio: "0%",
        sentenceCount: 0
      };
    }
    
    const summary = summaryResult.sentences.map(sentence => sentence.text).join(' ');
    const compressionRatio = (summary.length / text.length * 100).toFixed(1);
    
    return {
      summary: summary,
      sentences: summaryResult.sentences,
      originalLength: text.length,
      summaryLength: summary.length,
      compressionRatio: `${compressionRatio}%`,
      sentenceCount: summaryResult.sentences.length
    };
    
  } catch (error) {
    console.error('❌ Summarization failed:', error.message);
    
    // Return a fallback response instead of throwing
    return {
      summary: "Text summarization is temporarily unavailable. Please try again later.",
      sentences: [],
      originalLength: text.length,
      summaryLength: 0,
      compressionRatio: "0%",
      sentenceCount: 0,
      error: error.message
    };
  }
};

// Language Detection
const detectLanguage = async (text) => {
  const requestBody = {
    kind: "LanguageDetection",
    analysisInput: {
      documents: [{ id: "1", text: text }]
    },
    parameters: { modelVersion: "latest" }
  };

  const result = await callAzureLanguageAPI(requestBody);
  return result.results.documents[0];
};

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    name: 'SentimentIQ Pro - Advanced Text Analytics API',
    version: '2.0.0',
    description: 'Comprehensive text analysis platform powered by Azure AI Language',
    status: 'running',
    features: [
      'Sentiment Analysis',
      'Key Phrase Extraction',
      'Named Entity Recognition',
      'Text Summarization',
      'Language Detection'
    ],
    endpoints: {
      health: 'GET /health',
      analyze: 'POST /api/analyze-text',
      sentiment: 'POST /api/analyze-sentiment',
      keyPhrases: 'POST /api/extract-key-phrases',
      entities: 'POST /api/recognize-entities',
      summarize: 'POST /api/summarize-text',
      detectLanguage: 'POST /api/detect-language',
      testAzure: 'GET /api/test-azure',
      diagnostics: 'GET /api/diagnostics'
    },
    azure_configured: azureConfigured,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    azure_configured: azureConfigured,
    timestamp: new Date().toISOString() 
  });
});

// Comprehensive text analysis endpoint (combines multiple features)
app.post('/api/analyze-text', async (req, res) => {
  try {
    console.log('📝 Received comprehensive text analysis request');
    const { text, features = ['sentiment', 'keyPhrases', 'entities', 'summary', 'language'] } = req.body;
    
    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a string'
      });
    }
    
    if (text.length > 5120) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text must be less than 5,120 characters to comply with Azure Language API limits'
      });
    }
    
    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Empty text',
        message: 'Please provide some text to analyze'
      });
    }

    const results = {
      text: text,
      wordCount: text.trim().split(/\s+/).length,
      characterCount: text.length,
      timestamp: new Date().toISOString(),
      features: {}
    };

    if (!azureConfigured) {
      return res.status(503).json({
        error: 'Azure not configured',
        message: 'Azure Language API is not properly configured for comprehensive analysis'
      });
    }

    // Run analyses based on requested features
    const analysisPromises = [];

    if (features.includes('sentiment')) {
      analysisPromises.push(
        analyzeSentiment(text)
          .then(result => ({ type: 'sentiment', data: result }))
          .catch(error => ({ type: 'sentiment', error: error.message }))
      );
    }

    if (features.includes('keyPhrases')) {
      analysisPromises.push(
        extractKeyPhrases(text)
          .then(result => ({ type: 'keyPhrases', data: result }))
          .catch(error => ({ type: 'keyPhrases', error: error.message }))
      );
    }

    if (features.includes('entities')) {
      analysisPromises.push(
        recognizeEntities(text)
          .then(result => ({ type: 'entities', data: result }))
          .catch(error => ({ type: 'entities', error: error.message }))
      );
    }

    if (features.includes('summary') && text.length > 200) {
      analysisPromises.push(
        summarizeText(text)
          .then(result => ({ type: 'summary', data: result }))
          .catch(error => ({ type: 'summary', error: error.message }))
      );
    }

    if (features.includes('language')) {
      analysisPromises.push(
        detectLanguage(text)
          .then(result => ({ type: 'language', data: result }))
          .catch(error => ({ type: 'language', error: error.message }))
      );
    }

    const analysisResults = await Promise.all(analysisPromises);

    // Process results
    analysisResults.forEach(result => {
      if (result.error) {
        console.error(`❌ ${result.type} analysis failed:`, result.error);
        results.features[result.type] = { error: result.error };
      } else {
        results.features[result.type] = result.data;
      }
    });

    console.log('✅ Comprehensive analysis completed');
    res.json(results);

  } catch (error) {
    console.error('❌ Comprehensive analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: 'Unable to analyze text at this time. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Individual feature endpoints
app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (text.length > 5120) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text must be less than 5,120 characters to comply with Azure Language API limits'
      });
    }

    if (!azureConfigured) {
      return res.status(503).json({
        error: 'Azure not configured',
        message: 'Azure Language API is not properly configured'
      });
    }

    const result = await analyzeSentiment(text);
    
    // Convert to our format
    const sentiment = result.sentiment;
    const confidenceScores = result.confidenceScores;
    let score = 0;
    
    if (sentiment === 'positive') {
      score = confidenceScores.positive;
    } else if (sentiment === 'negative') {
      score = -confidenceScores.negative;
    }
    
    const magnitude = Math.max(
      confidenceScores.positive,
      confidenceScores.negative,
      confidenceScores.neutral
    );
    
    let intensity = 'low';
    if (magnitude > 0.6) intensity = 'high';
    else if (magnitude > 0.3) intensity = 'medium';

    const response = {
      sentiment,
      score: parseFloat(score.toFixed(3)),
      magnitude: parseFloat(magnitude.toFixed(3)),
      intensity,
      wordCount: text.trim().split(/\s+/).length,
      analysis: {
        isPositive: score > 0.1,
        isNegative: score < -0.1,
        isNeutral: Math.abs(score) <= 0.1,
        confidence: magnitude > 0.5 ? 'high' : magnitude > 0.25 ? 'medium' : 'low'
      },
      confidenceScores: confidenceScores
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Sentiment analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

app.post('/api/extract-key-phrases', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (text.length > 5120) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text must be less than 5,120 characters to comply with Azure Language API limits'
      });
    }

    if (!azureConfigured) {
      return res.status(503).json({
        error: 'Azure not configured',
        message: 'Azure Language API is not properly configured'
      });
    }

    const result = await extractKeyPhrases(text);
    res.json({
      keyPhrases: result.keyPhrases,
      count: result.keyPhrases.length,
      wordCount: text.trim().split(/\s+/).length
    });

  } catch (error) {
    console.error('❌ Key phrase extraction error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

app.post('/api/recognize-entities', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (text.length > 5120) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text must be less than 5,120 characters to comply with Azure Language API limits'
      });
    }

    if (!azureConfigured) {
      return res.status(503).json({
        error: 'Azure not configured',
        message: 'Azure Language API is not properly configured'
      });
    }

    const result = await recognizeEntities(text);
    res.json(result);

  } catch (error) {
    console.error('❌ Entity recognition error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

app.post('/api/summarize-text', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (text.length < 200) {
      return res.status(400).json({
        error: 'Text too short',
        message: 'Text must be at least 200 characters for summarization'
      });
    }

    if (text.length > 5120) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text must be less than 5,120 characters to comply with Azure Language API limits'
      });
    }

    if (!azureConfigured) {
      return res.status(503).json({
        error: 'Azure not configured',
        message: 'Azure Language API is not properly configured'
      });
    }

    console.log('📝 Processing summarization request for text length:', text.length);
    const result = await summarizeText(text);
    
    console.log('✅ Summarization completed, returning result');
    res.json(result);

  } catch (error) {
    console.error('❌ Text summarization error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

app.post('/api/detect-language', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Text is required and must be a non-empty string'
      });
    }

    if (text.length > 5120) {
      return res.status(400).json({
        error: 'Text too long',
        message: 'Text must be less than 5,120 characters to comply with Azure Language API limits'
      });
    }

    if (!azureConfigured) {
      return res.status(503).json({
        error: 'Azure not configured',
        message: 'Azure Language API is not properly configured'
      });
    }

    const result = await detectLanguage(text);
    res.json({
      detectedLanguage: result.detectedLanguage,
      confidence: result.detectedLanguage.confidenceScore,
      iso6391Name: result.detectedLanguage.iso6391Name,
      name: result.detectedLanguage.name
    });

  } catch (error) {
    console.error('❌ Language detection error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// Diagnostics endpoint
app.get('/api/diagnostics', (req, res) => {
  const endpoint = process.env.AZURE_TEXT_ANALYTICS_ENDPOINT;
  const key = process.env.AZURE_TEXT_ANALYTICS_KEY;
  
  res.json({
    environment_variables: {
      endpoint_set: !!endpoint,
      endpoint_value: endpoint || 'NOT_SET',
      endpoint_format_valid: endpoint ? (endpoint.startsWith('https://') && endpoint.includes('cognitiveservices.azure.com')) : false,
      key_set: !!key,
      key_length: key ? key.length : 0,
      key_preview: key ? `${key.substring(0, 8)}...${key.substring(key.length - 8)}` : 'NOT_SET'
    },
    client_status: {
      azure_configured: azureConfigured,
      api_endpoint: azureConfigured ? `${azureEndpoint}language/:analyze-text?api-version=2023-04-01` : 'NOT_CONFIGURED'
    },
    available_features: [
      'Sentiment Analysis',
      'Key Phrase Extraction',
      'Named Entity Recognition',
      'Text Summarization',
      'Language Detection'
    ],
    recommendations: [
      'Ensure your Azure Language resource is deployed and active',
      'Use Key 1 or Key 2 from the "Keys and Endpoint" section in Azure portal',
      'Make sure the endpoint URL is exactly as shown in Azure portal',
      'Verify your Azure subscription is active and the resource has not been suspended'
    ]
  });
});

// Test Azure connection endpoint
app.get('/api/test-azure', async (req, res) => {
  if (!azureConfigured) {
    return res.status(503).json({
      error: 'Azure not configured',
      message: 'Azure Language API is not properly configured'
    });
  }
  
  try {
    console.log('🔵 Testing Azure Language API connection...');
    
    const testText = 'This is a test message for Azure Language API analysis.';
    const result = await analyzeSentiment(testText);
    
    console.log('✅ Azure Language API connection test successful');
    res.json({
      status: 'success',
      message: 'Azure Language API connection is working perfectly!',
      test_result: {
        sentiment: result.sentiment,
        confidence: result.confidenceScores,
        text_analyzed: testText
      },
      endpoint_used: `${azureEndpoint}language/:analyze-text?api-version=2023-04-01`,
      available_features: [
        'Sentiment Analysis',
        'Key Phrase Extraction', 
        'Named Entity Recognition',
        'Text Summarization',
        'Language Detection'
      ]
    });
    
  } catch (error) {
    console.error('❌ Azure Language API connection test failed:', error.message);
    res.status(503).json({
      error: 'Azure connection failed',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Handle server startup
const server = app.listen(PORT, () => {
  console.log(`✅ SentimentIQ Pro Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API info: http://localhost:${PORT}/`);
  console.log(`🔧 Test Azure: http://localhost:${PORT}/api/test-azure`);
  console.log(`🔍 Diagnostics: http://localhost:${PORT}/api/diagnostics`);
  
  if (!azureConfigured) {
    console.log('⚠️  Running without Azure Language API');
    console.log('   Configure Azure credentials to enable all features');
  } else {
    console.log('🔵 Azure Language API configured with features:');
    console.log('   ✓ Sentiment Analysis');
    console.log('   ✓ Key Phrase Extraction');
    console.log('   ✓ Named Entity Recognition');
    console.log('   ✓ Text Summarization');
    console.log('   ✓ Language Detection');
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port or stop the existing process.`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});