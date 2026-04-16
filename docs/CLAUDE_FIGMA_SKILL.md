# Figma Design Generation Skill for Claude

This file provides the necessary instructions and reasoning for Claude to successfully translate code (React/Tailwind) or descriptions into Figma designs via the Figma MCP server.

## 1. Prerequisites (Setup)
If you haven't already, install the official Figma plugin in Claude Code:
`claude plugin install figma@claude-plugins-official`

## 2. Mandatory Plugin API Rules
When writing `use_figma` scripts, you MUST follow these rules or the execution will fail:

- **Color Range**: Use **0–1 range** for colors (e.g., `{r: 1, g: 1, b: 1}` for white), NOT 0–255.
- **Font Loading**: You MUST call `await figma.loadFontAsync({family: "Inter", style: "Regular"})` before setting any text properties.
- **Async Execution**: Every API call (e.g. `setCurrentPageAsync`) MUST be `await`-ed.
- **Return JSON**: Your script must `return` a JSON-serializable object containing the IDs of created/mutated nodes.
- **Auto Layout**: Set `layoutSizingHorizontal = 'FILL'` (or `'HUG'`) **ONLY AFTER** calling `parent.appendChild(child)`.
- **No `notify()`**: `figma.notify()` is not supported; use `return` for reporting status.

## 3. Recommended Workflow
Always follow this sequence for high-fidelity "Code to Figma" results:

### Step 1: Discovery (Don't Hardcode!)
Run `search_design_system` to find existing tokens and components.
- Search for "blue", "gray", "spacing", "button", "card".
- Use `includeVariables: true` to get color/spacing tokens.
- Import remote tokens with `await figma.variables.importVariableByKeyAsync(key)`.

### Step 2: Incremental Assembly
Do NOT build a whole page in one call. Use the "One Section Per Call" pattern:
1. **Call 1**: Create the main page wrapper (Auto Layout frame). Return `wrapperId`.
2. **Call 2**: Create the Header inside `wrapperId`. Return node IDs.
3. **Call 3**: Create the Hero inside `wrapperId`.
4. **Validation**: Run `get_screenshot` after major sections to verify layout.

### Step 3: Use Variables & Styles
- Apply library colors with `figma.variables.setBoundVariableForPaint(paint, 'color', variable)`.
- Apply typography with `node.textStyleId = style.id`.
- Apply Auto Layout to frames to match CSS Flexbox/Grid behavior.

## 4. Example Script Template
```js
const createdNodeIds = [];
const wrapper = await figma.getNodeByIdAsync("WRAPPER_ID");

// 1. Load Fonts
await figma.loadFontAsync({ family: "Inter", style: "Regular" });

// 2. Import Tokens
const brandColor = await figma.variables.importVariableByKeyAsync("VARIABLE_KEY");

// 3. Create Node
const section = figma.createAutoLayout();
section.name = "Section Container";
section.paddingLeft = 40;
section.paddingRight = 40;

// Bind color
const fill = figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 
  'color', 
  brandColor
);
section.fills = [fill];

// 4. Finalize
wrapper.appendChild(section);
section.layoutSizingHorizontal = "FILL";

createdNodeIds.push(section.id);
return { success: true, createdNodeIds };
```
