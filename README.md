   
# 🎓 AI Personal Tutor
  
<div align="center">

![AI Personal Tutor Logo](./frontend/public/Logo.jpg)

**An intelligent learning companion powered by AI to enhance your educational journey**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

## 🌟 Overview

AI Personal Tutor is a comprehensive educational platform that leverages artificial intelligence to provide personalized learning experiences. Built with modern technologies and a microservices architecture, it offers a suite of tools designed to enhance studying, interview preparation, and knowledge acquisition.

## ✨ Features

### 📄 **PDF Summarization**
- Upload any PDF document and receive AI-generated summaries
- Extract key points and concepts for efficient studying
- Intelligent content analysis and structuring

### 🎤 **Interview Preparation**
- Practice both personal and technical interviews
- AI-generated questions tailored to your field
- Real-time feedback and improvement suggestions
- Resume analysis and optimization

### 🧠 **Quiz & QnA Generator**
- Create custom quizzes on any topic
- Generate question-answer sets for self-assessment
- Adaptive difficulty based on performance
- Track learning progress and identify weak areas

### 📰 **Current Affairs**
- Stay updated with latest news and events
- AI-curated summaries and analysis
- Contextual understanding of current events
- Relevance-based content filtering

### 🧭 **Topic Explorer**
- Deep dive into any subject with AI guidance
- Structured learning paths for complex topics
- Interactive exploration of concepts
- Personalized learning recommendations

## 🏗️ Architecture

The application follows a **microservices architecture** with the following components:

```
AI Personal Tutor/
├── 🎨 Frontend (Next.js + React)
└── 🔧 Backend Microservices
    ├── 🔐 Auth Service
    ├── 📄 Summary Service
    ├── 🎤 Interview Service
    ├── 🧠 Quiz & QnA Service
    ├── 📰 Current Affairs Service
    └── 🧭 Topics Service
```

### Frontend Stack
- **Framework**: Next.js 15.4.2 with React 19
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI, Material-UI
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios

### Backend Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3
- **AI Integration**: OpenAI API, LangChain
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** instance
- **Redis** server
- **OpenAI API** key
- **Supabase** account (optional)
- **AWS S3** credentials (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-personal-tutor.git
   cd ai-personal-tutor
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   # For each microservice
   cd Backend/Auth_microservice
   npm install
   
   cd ../Quiz_QnA\ microservice
   npm install
   
   cd ../Interview_microservice
   npm install
   
   cd ../Current-Affairs_microservice
   npm install
   
   cd ../Summary_microservice
   npm install
   
   cd ../Topics_microservice
   npm install
   ```

### Environment Configuration

Create `.env` files in each microservice directory with the following variables:

#### Auth Microservice
```env
PORT=5001
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Quiz & QnA Microservice
```env
PORT=5002
FRONTEND_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

#### Interview Microservice
```env
PORT=5003
CLIENT_URL=http://localhost:3000
REDIS_URL=your_redis_connection_string
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket_name
```

#### Frontend
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Running the Application

1. **Start Backend Services**
   ```bash
   # Terminal 1 - Auth Service
   cd Backend/Auth_microservice
   npm run dev
   
   # Terminal 2 - Quiz Service
   cd Backend/Quiz_QnA\ microservice
   npm run dev
   
   # Terminal 3 - Interview Service
   cd Backend/Interview_microservice
   npm run dev
   
   # Continue for other services...
   ```

2. **Start Frontend**
   ```bash
   # New terminal
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Auth API: http://localhost:5001
   - Quiz API: http://localhost:5002
   - Interview API: http://localhost:5003

## 📁 Project Structure

```
ai-personal-tutor/
├── 📁 frontend/                    # Next.js frontend application
│   ├── 📁 src/
│   │   ├── 📁 app/                # App router pages
│   │   ├── 📁 components/         # React components
│   │   ├── 📁 hooks/              # Custom React hooks
│   │   ├── 📁 lib/                # Utility libraries
│   │   ├── 📁 services/           # API service functions
│   │   └── 📁 types/              # TypeScript type definitions
│   ├── 📁 public/                 # Static assets
│   └── 📄 package.json
│
├── 📁 Backend/                     # Microservices backend
│   ├── 📁 Auth_microservice/       # Authentication service
│   │   └── 📁 src/
│   │       ├── 📁 Controllers/    # Route controllers
│   │       ├── 📁 Middlewares/    # Custom middleware
│   │       ├── 📁 Routes/         # API routes
│   │       ├── 📁 Utils/          # Utility functions
│   │       └── 📄 index.ts        # Service entry point
│   │
│   ├── 📁 Quiz_QnA microservice/   # Quiz and Q&A service
│   ├── 📁 Interview_microservice/  # Interview preparation service
│   ├── 📁 Current-Affairs_microservice/ # News and current affairs
│   ├── 📁 Summary_microservice/    # PDF summarization service
│   └── 📁 Topics_microservice/     # Topic exploration service
│
└── 📄 README.md                   # Project documentation
```

## 🔧 API Endpoints

### Authentication Service (Port 5001)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Quiz & QnA Service (Port 5002)
- `POST /api/quiz/generate` - Generate quiz questions
- `GET /api/quiz/:id` - Get quiz by ID
- `POST /api/qna/generate` - Generate Q&A pairs
- `GET /api/qna/:topic` - Get Q&A by topic

### Interview Service (Port 5003)
- `POST /api/interview/start` - Start interview session
- `POST /api/interview/question` - Get next question
- `POST /api/resume/upload` - Upload resume for analysis
- `GET /api/resume/analysis/:id` - Get resume analysis

## 🛡️ Security Features

- **JWT Authentication** with secure token management
- **Rate Limiting** to prevent API abuse
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Input Validation** and sanitization
- **Password Hashing** with bcrypt
- **Secure File Upload** with type validation

## 🎨 UI/UX Features

- **Dark/Light Theme** toggle
- **Responsive Design** for all devices
- **Smooth Animations** with Framer Motion
- **Modern UI Components** with Radix UI
- **Accessible Design** following WCAG guidelines
- **Progressive Web App** capabilities

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing powerful AI capabilities
- **Next.js Team** for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** for the flexible database solution
- **All Contributors** who help make this project better

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/ai-personal-tutor/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

<div align="center">

**Made with ❤️ for learners everywhere**

[⭐ Star this repo](https://github.com/your-username/ai-personal-tutor) | [🐛 Report Bug](https://github.com/your-username/ai-personal-tutor/issues) | [✨ Request Feature](https://github.com/your-username/ai-personal-tutor/issues)

</div>
