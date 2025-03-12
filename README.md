# Memory Knowledge Graph 3D

A 3D visualization tool for memory knowledge graphs using Force Graph 3D. This project visualizes captured memories from the [Knowledge Graph Memory Server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory).

**GitHub Repository**: [https://github.com/TheSethRose/Memory-Knowledge-Graph-3D](https://github.com/TheSethRose/Memory-Knowledge-Graph-3D)

## Purpose

This visualization tool helps you explore and understand memory knowledge graphs by:

- Visualizing entities and their relationships in an interactive 3D space
- Exploring connections between different memory entities
- Filtering and searching through complex memory structures
- Providing an intuitive way to navigate through captured memories

The project is designed to work with memory data from the Model Context Protocol's Knowledge Graph Memory Server, which allows AI assistants like Claude to remember information about users across conversations.

## Core Concepts

The visualization is based on these key concepts from the Knowledge Graph Memory Server:

### Entities
Entities are the primary nodes in the knowledge graph. Each entity has:
- A unique name (identifier)
- An entity type (e.g., "person", "organization", "event")
- A list of observations

### Relations
Relations define directed connections between entities, describing how entities interact or relate to each other.

### Observations
Observations are discrete pieces of information about an entity, stored as strings and attached to specific entities.

## Features

- 3D visualization of entities and relationships
- Interactive node selection and highlighting
- Filtering by entity type and search
- Performance monitoring
- Dark/light theme support
- Support for large datasets with optimized rendering
- Modular code structure for better maintainability
- Vite-based bundling for modern JavaScript

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/TheSethRose/Memory-Knowledge-Graph-3D.git
   cd Memory-Knowledge-Graph-3D
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

5. For production build:
   ```
   npm run build
   ```

## Usage

1. **Load Data**:
   - Upload a JSON file using the "Load From File" tab
   - Paste JSON data using the "Paste JSON" tab
   - The application supports both standard JSON and JSONL formats
   - Compatible with memory.json from the Knowledge Graph Memory Server

2. **Interact with the Graph**:
   - Click on nodes to see details and center the view
   - Use mouse to rotate, zoom, and pan the view
   - Toggle labels, observations, and navigation controls

3. **Filter and Search**:
   - Use the search box to find specific entities
   - Filter by entity type using the dropdown
   - Click "Reset Filters" to clear all filters

## Troubleshooting

### Common Issues

1. **Performance issues with large graphs**:
   - Use the performance monitoring panel to check FPS
   - Try disabling node labels for very large graphs
   - The application automatically optimizes for large datasets

2. **JSON parsing errors**:
   - Make sure your JSON is valid
   - The application supports both standard JSON and JSONL formats
   - Check the console for specific error messages

## Project Structure

The application uses a modular code structure for better maintainability:

- `scripts/` - Contains all JavaScript modules
  - `main.js` - Entry point that initializes all modules
  - `modules/` - Directory containing modular components
    - `state.js` - Global state management
    - `three-loader.js` - Dynamic loading of Three.js modules
    - `theme.js` - Theme-related functionality
    - `performance.js` - Performance monitoring
    - `data-processor.js` - Data processing
    - `graph-renderer.js` - 3D graph rendering
    - `graph-utils.js` - Graph utility functions
    - `ui-utils.js` - UI utility functions

See `scripts/README.md` for more details on the module structure.

## Dependencies

- [3D Force Graph](https://github.com/vasturiano/3d-force-graph)
- [D3.js](https://d3js.org/)
- [Three.js](https://threejs.org/)
- [Stats.js](https://github.com/mrdoob/stats.js/)
- [Express](https://expressjs.com/)
- [Vite](https://vitejs.dev/)

## License

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details.
