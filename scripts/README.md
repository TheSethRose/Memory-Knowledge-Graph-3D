# Memory Knowledge Graph 3D - Script Structure

This directory contains the JavaScript modules for the Memory Knowledge Graph 3D application.

## Module Structure

- `main.js` - The entry point for the application that initializes all modules
- `modules/` - Directory containing all the modular components
  - `state.js` - Global state management
  - `three-loader.js` - Dynamic loading of Three.js modules
  - `theme.js` - Theme-related functionality and colors
  - `performance.js` - Performance monitoring utilities
  - `data-processor.js` - Data processing and transformation
  - `graph-renderer.js` - 3D graph rendering and initialization
  - `graph-utils.js` - Utility functions for graph operations
  - `ui-utils.js` - UI-related utility functions

## Module Responsibilities

### main.js
- Imports and initializes all modules
- Sets up event listeners for UI elements
- Handles file and JSON input

### state.js
- Manages global state variables
- Provides functions to update state

### three-loader.js
- Dynamically imports Three.js modules
- Ensures required libraries are loaded

### theme.js
- Defines color schemes for different node types
- Handles theme initialization and switching

### performance.js
- Sets up performance monitoring with Stats.js
- Provides utilities for tracking performance metrics

### data-processor.js
- Processes JSON and JSONL data
- Transforms raw data into graph-compatible format

### graph-renderer.js
- Initializes and renders the 3D force graph
- Configures graph appearance and behavior

### graph-utils.js
- Provides utilities for filtering and manipulating the graph
- Handles node and link operations

### ui-utils.js
- Updates UI elements based on user interactions
- Manages the display of node information
