# C4 Code Diagrams

This document contains code-level diagrams showing the key classes, interfaces, and their relationships in the AI SDLC system.

## Core Domain Model

```mermaid
classDiagram
    class Project {
        -id: string
        -name: string
        -description: string
        -status: ProjectStatus
        -createdAt: Date
        -updatedAt: Date
        -teamMembers: User[]
        -workflows: Workflow[]
        +addTeamMember(user: User): void
        +updateStatus(newStatus: ProjectStatus): void
        +addWorkflow(workflow: Workflow): void
    }
    
    class User {
        -id: string
        -username: string
        -email: string
        -role: UserRole
        -projects: Project[]
        +assignToProject(project: Project): void
        +updateRole(newRole: UserRole): void
    }
    
    class Workflow {
        -id: string
        -name: string
        -steps: WorkflowStep[]
        -currentStep: WorkflowStep
        +addStep(step: WorkflowStep): void
        +moveToNextStep(): void
        +getCurrentStep(): WorkflowStep
    }
    
    class WorkflowStep {
        -id: string
        -name: string
        -description: string
        -status: StepStatus
        -tasks: Task[]
        +addTask(task: Task): void
        +completeStep(): void
    }
    
    class Task {
        -id: string
        -title: string
        -description: string
        -assignee: User
        -status: TaskStatus
        -dueDate: Date
        +assignToUser(user: User): void
        +updateStatus(newStatus: TaskStatus): void
    }
    
    class AIAssistant {
        -projectContext: ProjectContext
        -aiModels: AIModel[]
        +analyzeCode(code: string): CodeAnalysis
        +generateCode(requirements: string): string
        +generateTests(code: string): string[]
        +suggestArchitecture(project: Project): ArchitectureSuggestion
    }
    
    class ProjectContext {
        -project: Project
        -codebase: Codebase
        -documentation: Documentation
        -team: User[]
        +updateContext(newData: any): void
        +getRelevantContext(query: string): string
    }
    
    enum ProjectStatus {
        PLANNING
        DEVELOPMENT
        TESTING
        DEPLOYMENT
        MAINTENANCE
        COMPLETED
    }
    
    enum UserRole {
        DEVELOPER
        PROJECT_MANAGER
        STAKEHOLDER
        ADMIN
    }
    
    enum StepStatus {
        NOT_STARTED
        IN_PROGRESS
        COMPLETED
        BLOCKED
    }
    
    enum TaskStatus {
        TODO
        IN_PROGRESS
        CODE_REVIEW
        TESTING
        DONE
    }
    
    Project "1" *-- "0..*" User : teamMembers
    Project "1" *-- "1..*" Workflow : workflows
    Workflow "1" *-- "1..*" WorkflowStep : steps
    WorkflowStep "1" *-- "0..*" Task : tasks
    Task "1" -- "1" User : assignee
    AIAssistant "1" -- "1" ProjectContext : uses
    AIAssistant "1" *-- "1..*" AIModel : models
```

## API Gateway Code Structure

```mermaid
classDiagram
    class ApiGateway {
        -routes: Route[]
        -middlewares: Middleware[]
        -services: ServiceRegistry
        +registerRoute(route: Route): void
        +registerMiddleware(middleware: Middleware): void
        +start(port: number): void
        +handleRequest(req: Request, res: Response): void
    }
    
    class Route {
        -path: string
        -method: HttpMethod
        -handler: RequestHandler
        -middlewares: Middleware[]
        +addMiddleware(middleware: Middleware): void
        +handleRequest(req: Request, res: Response): void
    }
    
    class Middleware {
        <<interface>>
        +execute(req: Request, res: Response, next: NextFunction): void
    }
    
    class AuthMiddleware {
        -jwtSecret: string
        +execute(req: Request, res: Response, next: NextFunction): void
        +validateToken(token: string): boolean
        +getUserFromToken(token: string): User
    }
    
    class RateLimiter {
        -maxRequests: number
        -timeWindow: number
        -requestCounts: Map<string, number[]>
        +execute(req: Request, res: Response, next: NextFunction): void
        +isRateLimited(ip: string): boolean
    }
    
    class RequestLogger {
        -logLevel: LogLevel
        +execute(req: Request, res: Response, next: NextFunction): void
        +logRequest(requestData: RequestData): void
    }
    
    class ServiceProxy {
        -serviceRegistry: ServiceRegistry
        +forwardRequest(serviceName: string, req: Request): Promise<Response>
        +getServiceEndpoint(serviceName: string): string
        +handleServiceError(error: Error): ErrorResponse
    }
    
    class ServiceRegistry {
        -services: Map<string, ServiceConfig>
        +registerService(name: string, config: ServiceConfig): void
        +getService(name: string): ServiceConfig
        +getAllServices(): ServiceConfig[]
        +healthCheck(): ServiceHealth[]
    }
    
    enum HttpMethod {
        GET
        POST
        PUT
        DELETE
        PATCH
    }
    
    enum LogLevel {
        INFO
        WARNING
        ERROR
        DEBUG
    }
    
    ApiGateway "1" *-- "0..*" Route : routes
    ApiGateway "1" *-- "0..*" Middleware : middlewares
    ApiGateway "1" -- "1" ServiceRegistry : services
    Route "1" -- "0..*" Middleware : middlewares
    Route "1" -- "1" RequestHandler : handler
    ServiceProxy "1" -- "1" ServiceRegistry : registry
    AuthMiddleware --|> Middleware
    RateLimiter --|> Middleware
    RequestLogger --|> Middleware
```

## AI Service Code Structure

```mermaid
classDiagram
    class AIService {
        -models: Map<string, AIModel>
        -contextManager: ContextManager
        -promptEngine: PromptEngine
        +initialize(): Promise<void>
        +analyzeCode(code: string, language: string): CodeAnalysis
        +generateCode(prompt: string, context: string): string
        +generateTests(code: string): TestSuite
        +suggestArchitecture(project: Project): ArchitectureSuggestion
        +loadModel(modelId: string): Promise<AIModel>
    }
    
    class AIModel {
        <<interface>>
        -modelId: string
        -modelType: ModelType
        -version: string
        +initialize(): Promise<void>
        +generateResponse(prompt: string): Promise<string>
        +analyzeCode(code: string): Promise<CodeAnalysis>
        +getCapabilities(): ModelCapabilities
    }
    
    class CodeAnalysisModel {
        -modelPath: string
        -config: ModelConfig
        +initialize(): Promise<void>
        +generateResponse(prompt: string): Promise<string>
        +analyzeCode(code: string): Promise<CodeAnalysis>
        +getCapabilities(): ModelCapabilities
    }
    
    class CodeGenerationModel {
        -modelPath: string
        -config: ModelConfig
        -templateEngine: TemplateEngine
        +initialize(): Promise<void>
        +generateResponse(prompt: string): Promise<string>
        +generateCode(requirements: string): Promise<string>
        +getCapabilities(): ModelCapabilities
    }
    
    class ContextManager {
        -projectContext: ProjectContext
        -knowledgeBase: KnowledgeBase
        +updateContext(projectData: any): void
        +getRelevantContext(query: string): string
        +learnFromFeedback(feedback: Feedback): void
        +getProjectSummary(): string
    }
    
    class PromptEngine {
        -templates: Map<string, PromptTemplate>
        -contextManager: ContextManager
        +generatePrompt(templateId: string, variables: any): string
        +optimizePrompt(prompt: string): string
        +addTemplate(templateId: string, template: PromptTemplate): void
        +getTemplate(templateId: string): PromptTemplate
    }
    
    class CodeAnalysis {
        -qualityScore: number
        -issues: CodeIssue[]
        -suggestions: string[]
        -complexity: number
        -maintainability: number
        +addIssue(issue: CodeIssue): void
        +getSummary(): string
    }
    
    class TestSuite {
        -unitTests: TestCase[]
        -integrationTests: TestCase[]
        -coverage: number
        +addTest(test: TestCase): void
        +calculateCoverage(): number
        +generateReport(): string
    }
    
    enum ModelType {
        CODE_ANALYSIS
        CODE_GENERATION
        TEST_GENERATION
        ARCHITECTURE_ADVISOR
        DOCUMENTATION
    }
    
    AIService "1" *-- "1..*" AIModel : models
    AIService "1" -- "1" ContextManager : context
    AIService "1" -- "1" PromptEngine : prompts
    CodeAnalysisModel --|> AIModel
    CodeGenerationModel --|> AIModel
    ContextManager "1" -- "1" ProjectContext : project
    ContextManager "1" -- "1" KnowledgeBase : knowledge
    PromptEngine "1" -- "1" ContextManager : context
    PromptEngine "1" *-- "0..*" PromptTemplate : templates
```

## Documentation Service Code Structure

```mermaid
classDiagram
    class DocumentationService {
        -documentStore: DocumentStore
        -diagramGenerator: DiagramGenerator
        -searchEngine: SearchEngine
        +createDocument(projectId: string, content: string): Promise<Document>
        +updateDocument(docId: string, content: string): Promise<Document>
        +generateDiagram(projectId: string, type: DiagramType): Promise<Diagram>
        +searchDocuments(query: string): Promise<Document[]>
        +getProjectDocumentation(projectId: string): Promise<Document[]>
        +exportDocumentation(projectId: string, format: ExportFormat): Promise<Buffer>
    }
    
    class DocumentStore {
        <<interface>>
        +saveDocument(document: Document): Promise<void>
        +getDocument(docId: string): Promise<Document>
        +searchDocuments(query: string): Promise<Document[]>
        +deleteDocument(docId: string): Promise<void>
        +getProjectDocuments(projectId: string): Promise<Document[]>
    }
    
    class S3DocumentStore {
        -bucketName: string
        -s3Client: S3Client
        +saveDocument(document: Document): Promise<void>
        +getDocument(docId: string): Promise<Document>
        +searchDocuments(query: string): Promise<Document[]>
        +deleteDocument(docId: string): Promise<void>
        +getProjectDocuments(projectId: string): Promise<Document[]>
    }
    
    class DiagramGenerator {
        -mermaidRenderer: MermaidRenderer
        -plantUmlRenderer: PlantUmlRenderer
        +generateDiagram(type: DiagramType, data: any): Promise<Diagram>
        +renderMermaid(diagramCode: string): Promise<Buffer>
        +renderPlantUml(diagramCode: string): Promise<Buffer>
        +generateFromProject(project: Project): Promise<Diagram[]>
    }
    
    class SearchEngine {
        -index: SearchIndex
        -analyzer: TextAnalyzer
        +indexDocument(document: Document): Promise<void>
        +search(query: string): Promise<SearchResult[]>
        +updateIndex(): Promise<void>
        +getSuggestions(query: string): Promise<string[]>
    }
    
    class Document {
        -id: string
        -projectId: string
        -title: string
        -content: string
        -type: DocumentType
        -createdAt: Date
        -updatedAt: Date
        -author: User
        +updateContent(newContent: string): void
        +addVersion(): void
        +getMetadata(): DocumentMetadata
    }
    
    class Diagram {
        -id: string
        -projectId: string
        -type: DiagramType
        -title: string
        -source: string
        -renderedImage: Buffer
        -createdAt: Date
        +render(): Promise<Buffer>
        +updateSource(newSource: string): void
        +export(format: ExportFormat): Promise<Buffer>
    }
    
    enum DocumentType {
        REQUIREMENTS
        ARCHITECTURE
        API_DOCUMENTATION
        USER_GUIDE
        TECHNICAL_SPECIFICATION
        MEETING_NOTES
    }
    
    enum DiagramType {
        C4_CONTEXT
        C4_CONTAINER
        C4_COMPONENT
        C4_CODE
        FLOWCHART
        SEQUENCE
        CLASS
        ERD
    }
    
    enum ExportFormat {
        PDF
        HTML
        MARKDOWN
        WORD
        PNG
        SVG
    }
    
    DocumentationService "1" -- "1" DocumentStore : store
    DocumentationService "1" -- "1" DiagramGenerator : diagrams
    DocumentationService "1" -- "1" SearchEngine : search
    S3DocumentStore --|> DocumentStore
    DocumentStore "1" *-- "0..*" Document : documents
    DiagramGenerator "1" *-- "0..*" Diagram : diagrams
    SearchEngine "1" -- "1" SearchIndex : index
    SearchEngine "1" -- "1" TextAnalyzer : analyzer