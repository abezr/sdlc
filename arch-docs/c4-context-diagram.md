# C4 Context Diagram

This diagram shows the high-level context of the AI SDLC system and its interactions with external entities.

```mermaid
C4Context
    title System Context Diagram for AI SDLC
    
    Person(developer, "Software Developer", "Uses the AI SDLC system to manage software development lifecycle")
    Person(projectManager, "Project Manager", "Manages projects and oversees development progress")
    Person(stakeholder, "Stakeholder", "Reviews project status and provides feedback")
    
    System(aiSDLC, "AI SDLC System", "Manages the complete AI Software Development Lifecycle")
    
    SystemDb(database, "Database", "Stores project data, documentation, and metadata")
    System(versionControl, "Version Control System", "Manages source code versions")
    System(ciCd, "CI/CD Pipeline", "Handles continuous integration and deployment")
    System(aiServices, "AI Services", "Provides AI-powered development assistance")
    
    Rel(developer, aiSDLC, "Uses", "HTTP/HTTPS")
    Rel(projectManager, aiSDLC, "Manages", "HTTP/HTTPS")
    Rel(stakeholder, aiSDLC, "Reviews", "HTTP/HTTPS")
    
    Rel(aiSDLC, database, "Reads/Writes", "SQL/NoSQL")
    Rel(aiSDLC, versionControl, "Integrates with", "API")
    Rel(aiSDLC, ciCd, "Triggers", "API/Webhooks")
    Rel(aiSDLC, aiServices, "Uses", "API")
    
    UpdateRelStyle(developer, aiSDLC, $offsetY="-10")
    UpdateRelStyle(projectManager, aiSDLC, $offsetY="-20")
    UpdateRelStyle(stakeholder, aiSDLC, $offsetY="-30")
    UpdateRelStyle(aiSDLC, database, $offsetY="10")
    UpdateRelStyle(aiSDLC, versionControl, $offsetY="20")
    UpdateRelStyle(aiSDLC, ciCd, $offsetY="30")
    UpdateRelStyle(aiSDLC, aiServices, $offsetY="40")
```

## Key Components

- **Software Developer**: Primary user who interacts with the system for development tasks
- **Project Manager**: Manages projects and monitors progress
- **Stakeholder**: Reviews project status and provides business feedback
- **AI SDLC System**: Core system managing the AI software development lifecycle
- **Database**: Stores all project-related data and metadata
- **Version Control System**: Manages source code and version history
- **CI/CD Pipeline**: Handles automated testing and deployment
- **AI Services**: Provides AI-powered development assistance and automation