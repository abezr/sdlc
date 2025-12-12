"""
Dynamic tool dispatcher (Python) for plugin-style tools.

Key ideas (teach Grok/maintainers):
- Discover modules with TOOL_SCHEMA + run(...)
- Inject only supported args using inspect.signature
- Normalize responses to a consistent shape
"""

import importlib
import inspect
json = __import__("json")
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional


class ToolModule:
    def __init__(self, name: str, schema: dict, func: Callable[..., Any]):
        self.name = name
        self.schema = schema
        self.func = func


def discover_tools(folder: Path) -> List[ToolModule]:
    tools: List[ToolModule] = []
    for file in folder.glob("*.py"):
        mod_name = file.stem
        module = importlib.import_module(f"{folder.name}.{mod_name}")
        schema = getattr(module, "TOOL_SCHEMA", None)
        func = getattr(module, "run", None)
        if not schema or not callable(func):
            continue
        tools.append(ToolModule(schema.get("name", mod_name), schema, func))
    return tools


def execute_tool(tool: ToolModule, injected: Dict[str, Any], args: Dict[str, Any]) -> Dict[str, Any]:
    all_args = {**injected, **args}
    sig = inspect.signature(tool.func)
    filtered = {k: v for k, v in all_args.items() if k in sig.parameters}
    try:
        result = tool.func(**filtered)
        return standardize_response(result)
    except Exception as exc:  # noqa: BLE001
        return {"status": "error", "error": str(exc)}


def standardize_response(result: Any) -> Dict[str, Any]:
    if isinstance(result, dict) and "status" in result:
        return result
    return {"status": "success", "data": result}


# Demo usage kept minimal
if __name__ == "__main__":
    plugins_dir = Path(__file__).parent / "plugins"
    injected_deps = {"workspace": str(Path(".").resolve())}
    for tool in discover_tools(plugins_dir):
        payload = {"demo": True}
        response = execute_tool(tool, injected_deps, payload)
        print(json.dumps({"tool": tool.name, "response": response}, ensure_ascii=False))
