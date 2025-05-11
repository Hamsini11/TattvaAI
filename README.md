# Tattva AI - Discover Your Natural Balance

An AI-powered Ayurvedic wellness platform that bridges 5,000-year-old wisdom with modern technology to provide personalized health guidance based on classical texts.

![Python](https://img.shields.io/badge/Python-3.11-3776ab?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Claude AI](https://img.shields.io/badge/Claude-3.7-8B5CF6?style=flat-square&logo=anthropic)

## 🌟 Overview

Tattva AI is a full-stack application that helps users discover their Ayurvedic constitution (Prakriti) through an intelligent conversational assessment. The platform provides personalized recommendations for diet, lifestyle, yoga, and daily routines based on authentic classical texts.

### Key Features

- **AI-Powered Assessment**: Conversational prakriti evaluation using Claude 3.7
- **Classical Text Integration**: Indexed knowledge from 8+ major Ayurvedic texts
- **Personalized Recommendations**: Tailored guidance based on individual constitution
- **Real-time Chat**: Instant responses with multi-level caching
- **Visual Analytics**: Interactive dosha distribution charts
- **Knowledge Retrieval**: TF-IDF search through processed Ayurvedic literature

## 🏗️ Architecture
Frontend (React/TS) ←→ Backend (FastAPI) ←→ Database (PostgreSQL)
↓
Claude API (Anthropic)
↓
Document Search (TF-IDF)

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ or Bun
- PostgreSQL 14+
- Anthropic API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tattva-ai.git
   cd tattva-ai

2. **Backend Setup**
   ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows: .\venv\Scripts\activate
    pip install -r requirements.txt

    # Set up environment variables
    cp .env.example .env
    # Edit .env with your configuration

3. **Database Setup**
   ```bash
   # Create database
    createdb tattva_db

    # Run migrations
    python database.py

4. **Process Ayurvedic Texts**
   ```bash
     cd database
     python ayurveda_processor.py

5. **Frontend Setup**
   ```bash
     cd frontend
     npm install
     cp .env.example .env

6. **Start the Application**
  Terminal 1 (Backend):
   ```bash
       cd backend
       uvicorn app:app --reload
  Terminal 2 (Frontend):
  ```bash
    cd frontend/tattva-harmony-bot
    npm run dev


