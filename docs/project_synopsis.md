# Synopsis: LexMap – A Judicial Reasoning Visualization Platform

## Introduction

LexMap is a full-stack web application designed to transform complex legal judgments into structured and interactive reasoning graphs. Legal documents are often lengthy and difficult to interpret, making it challenging to understand how conclusions are derived from claims, precedents, and arguments.

This project addresses the problem by converting unstructured legal text into a structured graph model. It extracts key argumentative components such as claims, precedents, reasoning steps, and conclusions, and represents them visually. The system allows users to actively explore judicial reasoning rather than passively reading dense legal content.

## System Overview

The system follows a client-server architecture, with a clear separation between frontend and backend components.

The backend is built using Node.js and Express, providing a REST API that processes legal text and generates structured reasoning graphs. The frontend is developed using React 18, TypeScript, and Vite, enabling users to input legal text and visualize the reasoning graph interactively using React Flow and Dagre.

The application currently supports both JSON-based output and graphical visualization, making it suitable for both technical and non-technical users.

## Current Project Status (Approximately 75% Complete)

The project has progressed significantly beyond the initial prototype stage and is now around 75% complete.

The core pipeline is fully functional and stable. The system successfully processes legal text, extracts reasoning components, constructs graph relationships, and renders them visually in real time. The backend API, reasoning engine, graph builder, and frontend visualization are all integrated and working seamlessly.

Phase 2 features such as improved extraction logic and partial structural enhancements are underway, while Phase 3 features such as advanced NLP, export functionality, and deployment remain pending.

## Work Completed

The following major components have been successfully implemented:

- Fully functional Express backend server with REST API (POST /api/process)
- Rule-based reasoning engine for sentence classification
- Graph builder for constructing nodes and edges
- Data models for Node, Edge, and CaseGraph
- React frontend with input panel and API integration
- JSON output view for structured data inspection
- Interactive graph visualization using React Flow
- Automatic layout using Dagre
- Toggle functionality between JSON and Graph views
- Error handling (HTTP 400, 500) and input validation

The system now supports a complete end-to-end pipeline from input to visualization.

## Team Contribution

The project has been developed collaboratively with defined roles:

**Kanishk Sigar (Team Lead & Core Developer):**
Led the entire system design and architecture. Implemented the backend server, API routes, reasoning engine, and core logic. Managed integration across frontend and backend and ensured end-to-end functionality.

**Priyanshi Chand (Frontend & Data Modeling):**
Contributed to graph data models and frontend setup. Worked on React integration, input handling, and API communication.

**Aayush Bhatt (Visualization & UI Logic):**
Implemented graph visualization using React Flow and Dagre. Developed JSON output panel, view toggling, and assisted in frontend testing and UI improvements.

## System Working (Step-by-Step Flow)

The system operates through the following steps:

1. User enters legal judgment text into the frontend interface.
2. Frontend sends a POST request to /api/process via Axios.
3. Backend receives the text and forwards it to the reasoning engine.
4. Text is split into sentences using regex-based segmentation.
5. Each sentence is classified into claim, conclusion, or precedent.
6. Nodes are created based on classification.
7. Graph builder generates relationships between nodes.
8. Structured JSON (nodes + edges) is returned to the frontend.
9. Frontend renders the output as JSON or an interactive graph.
10. Dagre automatically arranges the graph layout for readability.

## Initialization and Usage

The system can be run locally using the following steps:

1. Clone the project repository (monorepo structure).
2. Install dependencies in both frontend and backend directories.
3. Start backend server (localhost:5000).
4. Start frontend server (localhost:5173).
5. Open the application in a browser.
6. Input legal text and trigger processing.
7. View output as JSON or graph visualization.

## Challenges Faced
- Rule-based extraction lacks contextual understanding for complex legal language.
- Graph relationships can become overly dense due to simple mapping logic.
- Sentence splitting issues with legal abbreviations.
- No persistent storage implemented yet.
- Limited automated testing coverage.

## Future Work (Remaining 25%)
- PostgreSQL integration for data persistence
- User authentication and history tracking
- PDF upload and parsing system
- Advanced NLP-based reasoning extraction
- Improved relationship mapping (context-aware)
- Export functionality (PDF/image)
- Automated testing and deployment

## Conclusion

LexMap has evolved into a near-complete system that effectively transforms legal text into structured reasoning graphs. With approximately 75% of development completed, the project already demonstrates strong functionality, integration, and usability.

The remaining work focuses on enhancing accuracy, scalability, and real-world usability. Once completed, the system will serve as a powerful tool for legal analysis, education, and research by making judicial reasoning more transparent and accessible.
