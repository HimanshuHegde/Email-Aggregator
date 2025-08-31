# Real-Time Email Synchronization System

A comprehensive email management system with real-time IMAP synchronization, AI-powered categorization, and Slack integration.

## 🏗️ Architecture

- **Backend**: Node.js, Express.js, Socket.io, TypeScript
- **Frontend**: React, Tailwind CSS, TypeScript
- **Database**: Elasticsearch (Docker)
- **Real-time**: Socket.io for live updates
- **Email**: IMAP connections with IDLE mode
- **AI**: Email categorization engine
- **Integrations**: Slack notifications, Webhooks

## ✨ Features

### 1. Real-Time Email Synchronization
- Sync multiple IMAP accounts simultaneously (minimum 2)
- Fetch last 30 days of emails on initial setup
- Persistent IMAP connections using IDLE mode for instant updates
- No cron jobs - purely event-driven synchronization

### 2. Searchable Storage with Elasticsearch
- Locally hosted Elasticsearch instance via Docker
- Full-text email search capabilities
- Advanced indexing for optimal search performance
- Filter by folder and account

### 3. AI-Based Email Categorization
Automatic email classification into:
- **Interested** - Potential leads showing interest
- **Meeting Booked** - Confirmed meeting requests
- **Not Interested** - Declined or negative responses  
- **Spam** - Unwanted emails
- **Out of Office** - Automated replies

### 4. Slack & Webhook Integration
- Instant Slack notifications for "Interested" emails
- Webhook triggers for external automation
- Configurable webhook URLs (default: webhook.site)

### 5. Frontend Interface
- Clean, responsive UI built with React and Tailwind
- Real-time email display with live updates
- Advanced filtering by folder, account, and category
- Elasticsearch-powered search functionality

## 🚀 Local Setup

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn package manager

### 1. Start Elasticsearch Container

First, start the Elasticsearch instance using Docker:

```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  elasticsearch:9.1.2
```

Verify Elasticsearch is running:
```bash
curl http://localhost:9200
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 4. Environment Configuration

Create environment files for backend:

#### Backend Environment (`.env`)
```env
USER_ACCOUNTS = [{"email":"awps797@gmail.com","password":"rwua fekf ycxq gubn"},{"email":"797portfolio@gmail.com","password":"ftwi mtbh pmyi ohsa"}]
ES_PASS = 1234567890
GEMINI_API_KEY = AIzaSyA6O8bJDAfLklo8bQAF0j9XMVVQGGMNlXg
SLACK_WEBHOOK_URL = https://hooks.slack.com/services/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
WEBHOOK_SITE_URL = https://webhook.site/a51eb180-2c7c-41cb-9bcb-d006c6f01437
```


### 5. Start the Development Servers

#### Start Backend Server
```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3001`

#### Start Frontend Server
In a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🔧 Demo Environment Setup

### Demo Slack Integration
- Create a Slack app at https://api.slack.com
- Generate an Incoming Webhook URL
- Add the URL to your backend `.env` file

### Demo Webhook Testing
- Visit https://webhook.site to get a unique webhook URL
- Use this URL in your backend configuration
- Monitor webhook calls in real-time

