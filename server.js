const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3500;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Generate a sample data file if it doesn't exist
const sampleDataPath = path.join(__dirname, 'sample-data.json');
if (!fs.existsSync(sampleDataPath)) {
  const sampleData = {
    nodes: [
      {
        id: "seth",
        name: "Seth Rose",
        type: "Person",
        val: 15,
        color: "#4285F4",
        observations: [
          "Software developer and AI enthusiast",
          "Interested in knowledge graphs and data visualization",
          "Works on memory systems for better information management"
        ]
      },
      {
        id: "memory_graph",
        name: "Memory Graph",
        type: "Tool",
        val: 10,
        color: "#34A853",
        observations: [
          "3D visualization tool for knowledge graphs",
          "Built with Three.js and Force Graph",
          "Helps visualize connections between entities"
        ]
      },
      {
        id: "ai",
        name: "Artificial Intelligence",
        type: "Technology",
        val: 12,
        color: "#00BCD4",
        observations: [
          "Field of computer science focused on creating systems that can perform tasks requiring human intelligence",
          "Includes machine learning, natural language processing, and computer vision"
        ]
      }
    ],
    links: [
      {
        source: "seth",
        target: "memory_graph",
        type: "created",
        value: 3,
        description: "Created and maintains"
      },
      {
        source: "seth",
        target: "ai",
        type: "studies",
        value: 2,
        description: "Studies and works with"
      }
    ]
  };
  
  fs.writeFileSync(sampleDataPath, JSON.stringify(sampleData, null, 2));
  console.log('Created sample-data.json file');
}

// Start the server
app.listen(port, () => {
  console.log(`Memory Graph server running at http://localhost:${port}`);
  console.log(`Open your browser to http://localhost:${port} to view the application`);
});
