const fs = require('fs');

function parseCSV(text) {
    const lines = text.split(/\r?\n|\r/);
    console.log("Total lines:", lines.length);
    const headers = lines[0].split(',');

    // Find key indices
    const keys = ['comfort_food', 'fav_food', 'ethnic_food'];
    const indices = {};
    headers.forEach((h, i) => {
        if (keys.includes(h.trim())) indices[h.trim()] = i;
    });

    // Debug
    console.log("Headers found:", headers);
    console.log("Indices map:", indices);

    const foods = new Set();

    // Simple regex for CSV splitting respecting quotes
    const re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

    // Simpler split, might fail on commas inside quotes but better than nothing for debug
    // Or stick to the regex but debug row length
    // const re = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; 

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Handle potential carriage return
        const line = lines[i].replace('\r', '');

        // Basic CSV parse without regex for now to see if we get ANY data
        // If the regex was the issue, this will show us
        // But the regex is actually safer for standard CSVs. 
        // Let's try a standard library-free reduce approach if regex fails

        // Debug first row
        if (i === 1) console.log("First row raw:", line);

        // Try simple split
        const row = line.split(',');

        if (i === 1) {
            console.log("Line 1 raw:", line);
            console.log("Simple split length:", row.length);
            console.log("Indices:", indices);
            const idx = indices['comfort_food'];
            console.log("Value at index " + idx + ":", row[idx]);
        }

        Object.values(indices).forEach(idx => {
            if (row[idx]) {
                const rawContent = row[idx];
                // Remove quotes and split by comma/slash
                let content = rawContent.replace(/^"|"$/g, '').toLowerCase();
                // Split multi-item entries
                const items = content.split(/,|\/|\./);

                items.forEach(item => {
                    let food = item.trim();
                    if (food && food.length > 2 && !food.includes('none') && !food.includes('nan')) {
                        // Capitalize first letter
                        food = food.charAt(0).toUpperCase() + food.slice(1);
                        foods.add(food);
                    }
                });
            }
        });
    }
    return Array.from(foods);
}

try {
    const data = fs.readFileSync('food_coded.csv', 'utf8');
    const allFoods = parseCSV(data);

    // Generate AI objects
    const aiObjects = allFoods.map(name => {
        return {
            name: name,
            cal: Math.floor(Math.random() * (800 - 200 + 1)) + 200, // Random cal 200-800
            p: Math.floor(Math.random() * 30),
            c: Math.floor(Math.random() * 60),
            f: Math.floor(Math.random() * 20),
            work: "30 Min General Cardio" // Generic
        };
    });

    // Select top 50 to avoid overloading
    const selected = aiObjects.slice(0, 50);

    console.log(JSON.stringify(selected, null, 2));

    // Write to file for manual checking
    fs.writeFileSync('extracted_foods.json', JSON.stringify(selected, null, 2));

} catch (err) {
    console.error(err);
}
