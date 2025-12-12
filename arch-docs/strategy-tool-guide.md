# Strategy & Tool Guide (Quickstart)

## Strategy (Go + Fx) Template
```go
type MyStrategy struct{}
func NewMyStrategy() Strategy { return &MyStrategy{} }
func (s *MyStrategy) Name() string  { return "my-strategy" }
func (s *MyStrategy) Topic() string { return "my.topic" }
func (s *MyStrategy) Handle(ctx context.Context, msg any, deps Deps) error {
    // validate msg -> DTO
    // do UoW work (DB, outbox)
    // return nil on success
    return nil
}
```
Register: `fx.Annotate(NewMyStrategy, fx.ResultTags(\`group:"strategies"\`))`

## Tool (Python) Template
```python
TOOL_SCHEMA = {
    "name": "hello_tool",
    "description": "Says hello",
    "parameters": {"type": "object", "properties": {"name": {"type": "string"}}}
}

def run(name="world"):
    return {"status": "success", "data": f"hello {name}"}
```

Drop into `plugins/`, dispatcher will auto-load.
