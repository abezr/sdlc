# C4 Component Diagrams

This document contains component-level diagrams for the major services in the AI SDLC system.

## Web Application Components

```mermaid
C4Component
    title Web Application Component Diagram
    
    Container(webApp, "Web Application", "TypeScript, React", "User interface for AI SDLC")
    
    Component(uiFramework, "UI Framework", "React, Material-UI", "Provides core UI components and theming")
    Component(authClient, "Authentication Client", "TypeScript", "Handles user authentication and session management")
    Component(projectDashboard, "Project Dashboard", "React", "Displays project overview and status")
    Component(aiAssistant, "AI Assistant Interface", "React", "Provides AI-powered development assistance UI")
    Component(docViewer, "Documentation Viewer", "React, Markdown", "Renders project documentation and diagrams")
    Component(ciCdMonitor, "CI/CD Monitor", "React", "Shows build and deployment status")
    Component(apiClient, "API Client", "TypeScript", "Handles communication with backend services")
    Component(stateManager, "State Manager", "Redux", "Manages application state")
    Component(router, "Router", "React Router", "Handles navigation between views")
    
    Rel(uiFramework, authClient, "Uses", "Function calls")
    Rel(uiFramework, projectDashboard, "Uses", "Component composition")
    Rel(uiFramework, aiAssistant, "Uses", "Component composition")
    Rel(uiFramework, docViewer, "Uses", "Component composition")
    Rel(uiFramework, ciCdMonitor, "Uses", "Component composition")
    
    Rel(authClient, apiClient, "Uses", "API calls")
    Rel(projectDashboard, apiClient, "Uses", "API calls")
    Rel(aiAssistant, apiClient, "Uses", "API calls")
    Rel(docViewer, apiClient, "Uses", "API calls")
    Rel(ciCdMonitor, apiClient, "Uses", "API calls")
    
    Rel(stateManager, authClient, "Manages state", "State updates")
    Rel(stateManager, projectDashboard, "Manages state", "State updates")
    Rel(stateManager, aiAssistant, "Manages state", "State updates")
    Rel(stateManager, docViewer, "Manages state", "State updates")
    Rel(stateManager, ciCdMonitor, "Manages state", "State updates")
    
    Rel(router, projectDashboard, "Routes to", "Navigation")
    Rel(router, aiAssistant, "Routes to", "Navigation")
    Rel(router, docViewer, "Routes to", "Navigation")
    Rel(router, ciCdMonitor, "Routes to", "Navigation")
```

## API Gateway Components

```mermaid
C4Component
    title API Gateway Component Diagram
    
    Container(apiGateway, "API Gateway", "Node.js, Express", "Routes and processes API requests")
    
    Component(requestRouter, "Request Router", "Express", "Routes incoming requests to appropriate services")
    Component(authMiddleware, "Authentication Middleware", "Node.js", "Validates JWT tokens and user permissions")
    Component(rateLimiter, "Rate Limiter", "Node.js", "Prevents API abuse and DoS attacks")
    Component(requestLogger, "Request Logger", "Node.js", "Logs all API requests for monitoring")
    Component(apiDocs, "API Documentation", "Swagger", "Provides interactive API documentation")
    Component(healthCheck, "Health Check", "Node.js", "Monitors service health and availability")
    Component(errorHandler, "Error Handler", "Node.js", "Handles and formats error responses")
    Component(serviceProxy, "Service Proxy", "Node.js", "Forwards requests to backend services")
    
    Rel(requestRouter, authMiddleware, "Uses", "Middleware chain")
    Rel(requestRouter, rateLimiter, "Uses", "Middleware chain")
    Rel(requestRouter, requestLogger, "Uses", "Middleware chain")
    Rel(requestRouter, serviceProxy, "Uses", "Request forwarding")
    Rel(requestRouter, errorHandler, "Uses", "Error handling")
    
    Rel(authMiddleware, serviceProxy, "Validates before", "Authentication")
    Rel(rateLimiter, serviceProxy, "Limits before", "Rate limiting")
    Rel(requestLogger, serviceProxy, "Logs before", "Request logging")
    
    Rel(apiDocs, requestRouter, "Documents", "API endpoints")
    Rel(healthCheck, requestRouter, "Monitors", "Service health")
```

## Project Service Components

```mermaid
C4Component
    title Project Service Component Diagram
    
    Container(projectService, "Project Service", "Node.js", "Manages project lifecycle and metadata")
    
    Component(projectController, "Project Controller", "Node.js", "Handles HTTP requests and responses")
    Component(projectManager, "Project Manager", "Node.js", "Core business logic for projects")
    Component(workflowEngine, "Workflow Engine", "Node.js", "Manages project workflows and states")
    Component(vcsIntegrator, "VCS Integrator", "Node.js", "Integrates with version control systems")
    Component(notifier, "Notifier", "Node.js", "Sends notifications and alerts")
    Component(auditLogger, "Audit Logger", "Node.js", "Logs project changes for auditing")
    Component(dataAccess, "Data Access Layer", "Node.js, Sequelize", "Handles database operations")
    Component(cacheManager, "Cache Manager", "Node.js", "Manages caching for performance")
    
    Rel(projectController, projectManager, "Uses", "Business logic calls")
    Rel(projectController, dataAccess, "Uses", "Database operations")
    Rel(projectController, cacheManager, "Uses", "Cache operations")
    
    Rel(projectManager, workflowEngine, "Uses", "Workflow management")
    Rel(projectManager, vcsIntegrator, "Uses", "VCS integration")
    Rel(projectManager, notifier, "Uses", "Notification sending")
    Rel(projectManager, auditLogger, "Uses", "Audit logging")
    Rel(projectManager, dataAccess, "Uses", "Data persistence")
    
    Rel(workflowEngine, dataAccess, "Uses", "Workflow state storage")
    Rel(vcsIntegrator, dataAccess, "Uses", "VCS configuration storage")
    Rel(cacheManager, dataAccess, "Caches", "Frequent queries")
```

## AI Service Components

```mermaid
C4Component
    title AI Service Component Diagram
    
    Container(aiService, "AI Service", "Python, TensorFlow", "Provides AI-powered development assistance")
    
    Component(apiInterface, "API Interface", "Python, Flask", "Handles HTTP requests and responses")
    Component(codeAnalyzer, "Code Analyzer", "Python", "Analyzes code quality and structure")
    Component(codeGenerator, "Code Generator", "Python, LLMs", "Generates code based on requirements")
    Component(testGenerator, "Test Generator", "Python", "Generates unit and integration tests")
    Component(docGenerator, "Documentation Generator", "Python", "Generates project documentation")
    Component(architectureAdvisor, "Architecture Advisor", "Python", "Provides architecture recommendations")
    Component(modelManager, "Model Manager", "Python, TensorFlow", "Manages AI models and training")
    Component(promptEngine, "Prompt Engine", "Python", "Handles prompt engineering for LLMs")
    Component(contextManager, "Context Manager", "Python", "Manages project context for AI")
    
    Rel(apiInterface, codeAnalyzer, "Uses", "Code analysis requests")
    Rel(apiInterface, codeGenerator, "Uses", "Code generation requests")
    Rel(apiInterface, testGenerator, "Uses", "Test generation requests")
    Rel(apiInterface, docGenerator, "Uses", "Documentation generation requests")
    Rel(apiInterface, architectureAdvisor, "Uses", "Architecture advice requests")
    
    Rel(codeAnalyzer, contextManager, "Uses", "Project context")
    Rel(codeGenerator, contextManager, "Uses", "Project context")
    Rel(codeGenerator, promptEngine, "Uses", "Prompt engineering")
    Rel(testGenerator, contextManager, "Uses", "Project context")
    Rel(docGenerator, contextManager, "Uses", "Project context")
    Rel(architectureAdvisor, contextManager, "Uses", "Project context")
    
    Rel(modelManager, codeGenerator, "Provides models", "Model loading")
    Rel(modelManager, testGenerator, "Provides models", "Model loading")
    Rel(modelManager, docGenerator, "Provides models", "Model loading")
    Rel(modelManager, architectureAdvisor, "Provides models", "Model loading")