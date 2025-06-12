# SentimentIQ Pro - Advanced Text Analytics Platform

A comprehensive full-stack web application that provides professional-grade text analysis using Azure AI Language services. Built with React, TypeScript, and Express.js, featuring multiple AI-powered text analytics capabilities.

## 🚀 Features

### Frontend
- **Beautiful, Responsive Interface**: Modern glassmorphism design with smooth animations
- **Multi-Feature Analysis**: Comprehensive text analytics with selectable features
- **Real-time Processing**: Instant analysis with visual feedback
- **Interactive Results**: Detailed visualizations and insights
- **Feature Selection**: Choose which AI features to apply to your text
- **Mobile-First Design**: Optimized for all screen sizes

### Backend
- **Secure API**: Express.js server with proper CORS and security measures
- **Azure AI Integration**: Full integration with Azure Language services
- **Multiple Endpoints**: Dedicated endpoints for each analysis feature
- **Comprehensive Analysis**: Single endpoint for multi-feature analysis
- **Health Monitoring**: Built-in health check and diagnostics

### AI-Powered Features

#### 🎯 Sentiment Analysis
- Emotional tone detection (positive, negative, neutral)
- Confidence scores for each sentiment
- Intensity and magnitude analysis
- Visual sentiment indicators

#### 🔑 Key Phrase Extraction
- Automatic identification of important topics
- Contextual phrase extraction
- Topic clustering and organization
- Relevance scoring

#### 👥 Named Entity Recognition
- Person, location, and organization identification
- Entity categorization and classification
- Confidence scoring for each entity
- Visual entity grouping

#### 📄 Text Summarization
- Extractive summarization with key sentences
- Compression ratio analysis
- Ranked sentence extraction
- Summary quality metrics

#### 🌍 Language Detection
- Automatic language identification
- Confidence scoring
- ISO language code support
- Multi-language text support

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Azure Cognitive Services account with Language resource

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure Azure Language credentials:
   - Create an Azure account and Language resource
   - Get your endpoint URL and API key
   - Update `.env` with your Azure credentials

### Development

Start both frontend and backend servers:
```bash
npm run dev
```

This runs:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Azure Language Setup

#### Creating Azure Resources

1. **Create Azure Account**: Sign up at [portal.azure.com](https://portal.azure.com)

2. **Create Language Resource**:
   - Go to "Create a resource" → "AI + Machine Learning" → "Language"
   - Choose your subscription and resource group
   - Select a region (choose one close to your users)
   - Choose pricing tier (F0 for free tier, S for standard)

3. **Get Credentials**:
   - After deployment, go to your Language resource
   - Navigate to "Keys and Endpoint"
   - Copy your endpoint URL and one of the keys

4. **Configure Environment**:
   ```env
   AZURE_TEXT_ANALYTICS_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
   AZURE_TEXT_ANALYTICS_KEY=your-api-key-here
   ```

## 📡 API Endpoints

### Comprehensive Analysis
- **POST /api/analyze-text**: Multi-feature text analysis
- **Request**: `{ "text": "...", "features": ["sentiment", "keyPhrases", "entities", "summary", "language"] }`

### Individual Features
- **POST /api/analyze-sentiment**: Sentiment analysis only
- **POST /api/extract-key-phrases**: Key phrase extraction
- **POST /api/recognize-entities**: Named entity recognition
- **POST /api/summarize-text**: Text summarization
- **POST /api/detect-language**: Language detection

### Monitoring
- **GET /health**: Health check endpoint
- **GET /api/test-azure**: Test Azure connection
- **GET /api/diagnostics**: Configuration diagnostics

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend Stack
- **Express.js** with TypeScript support
- **Azure AI Language API**
- **CORS** for cross-origin requests
- **dotenv** for environment management

### Key Components
- `TextAnalyzer`: Main analysis interface with feature selection
- `ComprehensiveResults`: Multi-feature results display
- `FeatureSelector`: Interactive feature selection
- `TextInput`: Enhanced textarea with validation
- `ErrorMessage`: User-friendly error handling

## 🔒 Security Features

- **Input Validation**: Comprehensive text validation and sanitization
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Variables**: Secure API key management
- **Error Handling**: Secure error messages without sensitive data exposure

## 💰 Azure Pricing Information

- **Free Tier (F0)**: 5,000 transactions per month across all features
- **Standard Tier (S)**: Pay per transaction, higher limits
- **Pricing**: Check [Azure Cognitive Services pricing](https://azure.microsoft.com/pricing/details/cognitive-services/language-service/)

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Netlify
- Vercel
- Azure Static Web Apps
- AWS S3/CloudFront

### Backend Deployment
The backend can be deployed to:
- Azure App Service
- Heroku
- AWS Lambda
- Digital Ocean

### Environment Variables for Production
```env
AZURE_TEXT_ANALYTICS_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
AZURE_TEXT_ANALYTICS_KEY=your-api-key-here
PORT=3001
NODE_ENV=production
```

## 🧪 Testing

Test the application with various text types:

### Example Use Cases
- **Product Reviews**: Analyze customer feedback sentiment and extract key topics
- **News Articles**: Summarize content and identify key entities
- **Social Media Posts**: Detect sentiment and extract trending phrases
- **Business Documents**: Identify key information and summarize content
- **Multi-language Content**: Detect language and analyze accordingly

## 🔧 Development Mode

The application includes comprehensive error handling and fallback mechanisms for development without Azure credentials.

## 📊 Features Comparison

| Feature | Description | Use Cases |
|---------|-------------|-----------|
| Sentiment Analysis | Emotional tone detection | Customer feedback, social media monitoring |
| Key Phrases | Important topic extraction | Content categorization, SEO analysis |
| Named Entities | Person/place/organization ID | Information extraction, content tagging |
| Text Summary | Automatic summarization | Document processing, content curation |
| Language Detection | Language identification | Multi-language support, content routing |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce
4. Use `/api/diagnostics` endpoint for configuration issues

---

Built with  using modern web technologies and Azure AI Language for comprehensive text analytics.