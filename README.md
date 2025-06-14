# SentimentIQ Pro - Advanced Text Analytics Platform

A comprehensive full-stack web application that provides professional-grade text analysis using Azure AI Language services. Built with React, TypeScript, Express.js, and Supabase, featuring multiple AI-powered text analytics capabilities with user authentication and tier-based access control.

## 🚀 Features

### Frontend
- **Beautiful, Responsive Interface**: Modern glassmorphism design with smooth animations
- **Multi-Feature Analysis**: Comprehensive text analytics with selectable features
- **Real-time Processing**: Instant analysis with visual feedback
- **Interactive Results**: Detailed visualizations and insights
- **Feature Selection**: Choose which AI features to apply to your text
- **Mobile-First Design**: Optimized for all screen sizes
- **User Authentication**: Secure login/registration with email confirmation
- **Tier-Based Access**: Guest, Standard, and Pro plans with different feature access

### Backend
- **Secure API**: Express.js server with proper CORS and security measures
- **Azure AI Integration**: Full integration with Azure Language services
- **Multiple Endpoints**: Dedicated endpoints for each analysis feature
- **Comprehensive Analysis**: Single endpoint for multi-feature analysis
- **Health Monitoring**: Built-in health check and diagnostics
- **Supabase Integration**: User management and analysis history storage

### Database & Authentication
- **Supabase Backend**: PostgreSQL database with Row Level Security (RLS)
- **User Profiles**: Extended user information with tier management
- **Analysis History**: Persistent storage of user analysis results
- **Admin Dashboard**: Super admin interface for system monitoring
- **Visitor Tracking**: Comprehensive analytics and logging system
- **System Logs**: Detailed error tracking and performance monitoring

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
- Supabase account and project

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your credentials in `.env`:
   - **Supabase**: Get URL and anon key from your Supabase project settings
   - **Azure Language**: Get endpoint URL and API key from Azure portal
   - Update the file with your actual credentials

### Development

Start both frontend and backend servers:
```bash
npm run dev
```

This runs:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Supabase Setup

#### Database Configuration

1. **Create Supabase Project**: Sign up at [supabase.com](https://supabase.com)

2. **Run Migrations**: The project includes migration files that will set up:
   - User profiles table with tier management
   - Analysis history storage
   - System logging and visitor tracking
   - Row Level Security policies

3. **Configure Authentication**:
   - Enable email authentication in Supabase dashboard
   - Set up email templates for confirmation
   - Configure redirect URLs for email confirmation

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

## 🔐 User Tiers & Features

### Guest Mode (No Registration)
- **Features**: Sentiment Analysis only
- **Limitations**: No history, no advanced features
- **Access**: Immediate, no account required

### Standard Plan
- **Features**: Sentiment Analysis + Key Phrase Extraction
- **Benefits**: Analysis history, account dashboard
- **Limitations**: Limited to 2 features
- **Support**: Email support

### Pro Plan
- **Features**: All AI features (5 total)
- **Benefits**: Unlimited history, priority support, API access
- **Advanced**: Export reports, admin dashboard access
- **Support**: Priority support

## 📡 API Endpoints

### Authentication
- **POST /auth/login**: User login
- **POST /auth/register**: User registration
- **POST /auth/logout**: User logout
- **GET /auth/user**: Get current user profile

### Comprehensive Analysis
- **POST /api/analyze-text**: Multi-feature text analysis
- **Request**: `{ "text": "...", "features": ["sentiment", "keyPhrases", "entities", "summary", "language"] }`

### Individual Features
- **POST /api/analyze-sentiment**: Sentiment analysis only
- **POST /api/extract-key-phrases**: Key phrase extraction
- **POST /api/recognize-entities**: Named entity recognition
- **POST /api/summarize-text**: Text summarization
- **POST /api/detect-language**: Language detection

### Monitoring & Admin
- **GET /health**: Health check endpoint
- **GET /api/test-azure**: Test Azure connection
- **GET /api/diagnostics**: Configuration diagnostics
- **Admin Dashboard**: Super admin interface (Pro users only)

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- **Supabase Client** for authentication

### Backend Stack
- **Express.js** with TypeScript support
- **Azure AI Language API**
- **Supabase** for database and auth
- **CORS** for cross-origin requests
- **dotenv** for environment management

### Database Schema
- **profiles**: User information and tier management
- **analysis_history**: Persistent analysis storage
- **system_logs**: Error tracking and monitoring
- **visitor_logs**: Analytics and visitor tracking
- **visitor_actions**: User action tracking

### Key Components
- `TextAnalyzer`: Main analysis interface with feature selection
- `ComprehensiveResults`: Multi-feature results display
- `FeatureSelector`: Interactive feature selection with tier restrictions
- `UserProfile`: User management and tier display
- `AuthModal`: Login/registration with email confirmation
- `AdminDashboard`: Super admin system monitoring

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Input Validation**: Comprehensive text validation and sanitization
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Variables**: Secure API key management
- **Error Handling**: Secure error messages without sensitive data exposure
- **Session Management**: Secure authentication with automatic refresh
- **Admin Access Control**: Restricted admin dashboard access

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
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Azure
AZURE_TEXT_ANALYTICS_ENDPOINT=your-azure-endpoint
AZURE_TEXT_ANALYTICS_KEY=your-azure-key

# Server
PORT=3001
NODE_ENV=production
```

## 🧪 Testing

The project includes comprehensive test cases covering:

### Unit Tests
- Authentication service functions
- Text analysis service functions
- Utility functions and helpers
- Component rendering and interactions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows
- Feature access control

### End-to-End Tests
- Complete user workflows
- Multi-feature analysis scenarios
- Error handling and edge cases
- Admin dashboard functionality

### Test Categories
- **Authentication Tests**: Login, registration, logout, session management
- **Analysis Tests**: All AI features individually and in combinations
- **Tier Tests**: Feature access control for different user tiers
- **Error Tests**: Network errors, validation errors, API failures
- **Edge Cases**: Empty text, very long text, special characters
- **Admin Tests**: Dashboard access, user management, system monitoring

Run tests with:
```bash
npm test
```

## 🧪 Example Use Cases

### Product Reviews
- Analyze customer feedback sentiment and extract key topics
- Identify mentioned entities (products, competitors, locations)
- Generate summaries of review themes

### News Articles
- Summarize content and identify key entities
- Detect article language and sentiment
- Extract main topics and themes

### Social Media Posts
- Detect sentiment and extract trending phrases
- Identify mentioned people, places, organizations
- Analyze emotional intensity and engagement

### Business Documents
- Identify key information and summarize content
- Extract important entities and topics
- Analyze document sentiment and tone

### Multi-language Content
- Detect language and analyze accordingly
- Provide consistent analysis across languages
- Support international content processing

## 🔧 Development Mode

The application includes comprehensive error handling and fallback mechanisms for development without Azure credentials.

## 📊 Features Comparison

| Feature | Guest | Standard | Pro |
|---------|-------|----------|-----|
| Sentiment Analysis | ✅ | ✅ | ✅ |
| Key Phrases | ❌ | ✅ | ✅ |
| Named Entities | ❌ | ❌ | ✅ |
| Text Summary | ❌ | ❌ | ✅ |
| Language Detection | ❌ | ❌ | ✅ |
| Analysis History | ❌ | ✅ | ✅ |
| Export Reports | ❌ | ❌ | ✅ |
| Admin Dashboard | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

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

## 🔍 Monitoring & Analytics

### Admin Dashboard Features
- **User Management**: View, edit, and manage user accounts
- **System Monitoring**: Real-time system health and performance
- **Analytics**: Usage statistics and feature popularity
- **Error Tracking**: Comprehensive error logging and analysis
- **Visitor Tracking**: Detailed visitor analytics and behavior
- **Database Stats**: Performance metrics and optimization insights

### Logging System
- **System Logs**: Comprehensive error and event tracking
- **Visitor Logs**: User behavior and interaction tracking
- **Performance Monitoring**: Response times and system health
- **Security Monitoring**: Authentication attempts and access patterns

---

Built with ❤️ using modern web technologies and Azure AI Language for comprehensive text analytics.