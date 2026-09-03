const fs = require('fs');
let html = fs.readFileSync('/config/vs-workspace/24-game/index.html', 'utf-8');

const cssToInject = `
        .monster-health-bar-container {
            width: 80%;
            height: 20px;
            background: #222;
            border: 2px solid #555;
            border-radius: 10px;
            margin: -20px auto 15px auto;
            overflow: hidden;
            z-index: 10;
        }
        .monster-health-bar {
            height: 100%;
            background: linear-gradient(90deg, #ff0000, #ff5555);
            width: 100%;
            transition: width 0.3s ease-out;
        }
`;

if (!html.includes('.monster-health-bar-container {')) {
    html = html.replace('</style>', cssToInject + '\n    </style>');
    fs.writeFileSync('/config/vs-workspace/24-game/index.html', html, 'utf-8');
    console.log("CSS added.");
} else {
    console.log("CSS already exists.");
}
