// Entity type colors
const entityColors = {
    Person: '#4285F4',
    Organization: '#EA4335',
    Pet: '#FBBC05',
    Tool: '#34A853',
    Medical: '#8E24AA',
    Category: '#00ACC1',
    Website: '#FB8C00',
    Reference: '#9E9E9E',
    List: '#607D8B',
    Technology: '#00BCD4',
    'Medical Facility': '#8E24AA',
    Default: '#9C27B0'
};

// Process JSONL text
export function processJsonlText(text) {
    try {
        // Split the text by newlines and filter out empty lines
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // Initialize arrays for entities and relations
        const entities = [];
        const relations = [];

        // Parse each line as JSON
        lines.forEach(line => {
            try {
                const item = JSON.parse(line.trim());
                
                if (item.type === 'entity') {
                    entities.push(item);
                } else if (item.type === 'relation') {
                    relations.push(item);
                }
            } catch (e) {
                console.warn('Error parsing JSONL line:', e);
            }
        });

        return processEntitiesAndRelations(entities, relations);
    } catch (error) {
        console.error('Error processing JSONL:', error);
        throw new Error('Failed to process JSONL: ' + error.message);
    }
}

// Process memory JSON data
export function processMemoryJson(data) {
    try {
        // If data is already in the expected format with nodes and links
        if (data.nodes && data.links) {
            return data;
        }
        
        // If data is an array of items
        if (Array.isArray(data)) {
            const entities = [];
            const relations = [];
            
            // First pass: collect all entities and relations
            data.forEach(item => {
                if (item.type === 'entity') {
                    entities.push(item);
                } else if (item.type === 'relation') {
                    relations.push(item);
                }
            });
            
            return processEntitiesAndRelations(entities, relations);
        }
        
        // If data has entities and relations fields
        if (data.entities && data.relations) {
            return processEntitiesAndRelations(data.entities, data.relations);
        }
        
        // If we can't determine the format, return empty data
        console.error('Unknown data format:', data);
        return { nodes: [], links: [] };
    } catch (error) {
        console.error('Error processing memory JSON:', error);
        throw new Error('Failed to process memory JSON: ' + error.message);
    }
}

// Process entities and relations into nodes and links
function processEntitiesAndRelations(entities, relations) {
    // Initialize results arrays
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    
    // Process entities into nodes
    entities.forEach(entity => {
        const entityType = entity.entityType || 'Default';
        
        const node = {
            id: entity.name,
            name: entity.name,
            type: entityType,
            color: entityColors[entityType] || entityColors.Default,
            observations: entity.observations || [],
            val: Math.max(5, entity.observations ? entity.observations.length / 4 : 5) // Size based on observations count
        };
        
        nodes.push(node);
        nodeMap.set(entity.name, node);
    });
    
    // Process relations into links
    relations.forEach(relation => {
        // Skip relations where source or target doesn't exist
        if (!nodeMap.has(relation.from) || !nodeMap.has(relation.to)) {
            return;
        }
        
        links.push({
            source: relation.from,
            target: relation.to,
            type: relation.relationType || 'related',
            color: '#999'
        });
    });
    
    return { nodes, links };
}

// Get color for entity type
export function getNodeColor(entity) {
    const type = entity?.type || 'Default';
    return entityColors[type] || entityColors.Default;
}
