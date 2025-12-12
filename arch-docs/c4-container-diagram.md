# C4 Container Diagram

This diagram shows the high-level containers (applications, data stores, etc.) that make up the AI SDLC system.

```mermaid
C4Container
    title Container Diagram for AI SDLC System
    
    Container(webApp, "Web Application", "TypeScript, React", "Provides the user interface for the AI SDLC system")
    Container(apiGateway, "API Gateway", "Node.js, Express", "Handles API routing and request processing")
    Container(authService, "Authentication Service", "Node.js", "Handles user authentication and authorization")
    Container(projectService, "Project Service", "Node.js", "Manages project lifecycle and metadata")
    Container(aiService, "AI Service", "Python, TensorFlow", "Provides AI-powered development assistance")
    Container(docService, "Documentation Service", "Node.js", "Manages project documentation and architecture diagrams")
    Container(ciCdService, "CI/CD Service", "Node.js", "Manages continuous integration and deployment workflows")
    
    ContainerDb(postgres, "PostgreSQL Database", "PostgreSQL", "Stores project data, user information, and metadata")
    ContainerDb(redis, "Redis Cache", "Redis", "Caches frequently accessed data for performance")
    ContainerDb(s3, "S3 Storage", "Amazon S3", "Stores large files, documentation, and artifacts")
    
    System_Ext(versionControl, "Version Control System", "External Git service")
    System_Ext(aiPlatform, "AI Platform", "External AI services")
    
    Rel(webApp, apiGateway, "Makes API calls", "HTTP/HTTPS")
    Rel(apiGateway, authService, "Authenticates requests", "HTTP")
    Rel(apiGateway, projectService, "Manages projects", "HTTP")
    Rel(apiGateway, aiService, "Processes AI requests", "HTTP")
    Rel(apiGateway, docService, "Manages documentation", "HTTP")
    Rel(apiGateway, ciCdService, "Manages CI/CD", "HTTP")
    
    Rel(authService, postgres, "Stores user data", "SQL")
    Rel(projectService, postgres, "Stores project data", "SQL")
    Rel(aiService, postgres, "Stores AI model data", "SQL")
    Rel(docService, postgres, "Stores documentation metadata", "SQL")
    Rel(ciCdService, postgres, "Stores CI/CD configuration", "SQL")
    
    Rel(webApp, redis, "Caches UI data", "Redis protocol")
    Rel(apiGateway, redis, "Caches API responses", "Redis protocol")
    
    Rel(docService, s3, "Stores documentation files", "S3 API")
    Rel(ciCdService, s3, "Stores build artifacts", "S3 API")
    
    Rel(projectService, versionControl, "Integrates with VCS", "API")
    Rel(ciCdService, versionControl, "Triggers builds", "Webhooks/API")
    
    Rel(aiService, aiPlatform, "Uses external AI services", "API")
    
    UpdateRelStyle(webApp, apiGateway, $offsetY="-10")
    UpdateRelStyle(apiGateway, authService, $offsetY="-20")
    UpdateRelStyle(apiGateway, projectService, $offsetY="-30")
    UpdateRelStyle(apiGateway, aiService, $offsetY="-40")
    UpdateRelStyle(apiGateway, docService, $offsetY="-50")
    UpdateRelStyle(apiGateway, ciCdService, $offsetY="-60")
```

## Container Descriptions

### Web Application
- **Technology**: TypeScript, React
- **Responsibility**: Provides the user interface for developers, project managers, and stakeholders
- **Communication**: Makes API calls to the API Gateway via HTTP/HTTPS

### API Gateway
- **Technology**: Node.js, Express
- **Responsibility**: Routes requests to appropriate services and handles API management
- **Communication**: Routes requests to all internal services via HTTP

### Authentication Service
- **Technology**: Node.js
- **Responsibility**: Handles user authentication, authorization, and session management
- **Data Storage**: PostgreSQL for user data

### Project Service
- **Technology**: Node.js
- **Responsibility**: Manages project lifecycle, metadata, and workflows
- **Data Storage**: PostgreSQL for project data
- **External Integration**: Version Control System

### AI Service
- **Technology**: Python, TensorFlow
- **Responsibility**: Provides AI-powered development assistance, code generation, and automation
- **Data Storage**: PostgreSQL for AI model data
- **External Integration**: External AI Platform services

### Documentation Service
- **Technology**: Node.js
- **Responsibility**: Manages project documentation, architecture diagrams, and knowledge base
- **Data Storage**: PostgreSQL for metadata, S3 for file storage

### CI/CD Service
- **Technology**: Node.js
- **Responsibility**: Manages continuous integration, delivery, and deployment workflows
- **Data Storage**: PostgreSQL for configuration, S3 for artifacts
- **External Integration**: Version Control System for build triggers