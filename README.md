# Email Aggregator
Note: Since backend is hosted in render it might go to sleep due to inactivity due to which data fetching could take a bit longer than expected or could even lead to an error.if u do come across an error just refresh it.
A comprehensive email management system with real-time IMAP synchronization, AI-powered categorization, and Slack integration.


## 🏗️ Architecture

- **Backend**: Node.js, Express.js, Socket.io, TypeScript
- **Frontend**: React, Tailwind CSS, TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.io for live updates
- **Email**: IMAP connections with IDLE mode,Nodemailer for sending mails
- **AI**: Email categorization engine using gemini api
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





