#!/bin/bash

# Frontend SPA Quick Start Script
# This script helps you quickly start the frontend development server

echo "🚀 Starting Frontend SPA..."
echo ""

# Check if we're in the frontend directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found!"
    echo "Please run this script from the frontend directory."
    exit 1
fi

# Port to use
PORT=5500

echo "📦 Checking for available server options..."
echo ""

# Check for Python
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "🌐 Starting server on http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    python3 -m http.server $PORT
    exit 0
fi

# Check for Python 2
if command -v python &> /dev/null; then
    echo "✅ Python found"
    echo "🌐 Starting server on http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    python -m SimpleHTTPServer $PORT
    exit 0
fi

# Check for Node.js
if command -v npx &> /dev/null; then
    echo "✅ Node.js found"
    echo "🌐 Starting server on http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    npx http-server -p $PORT
    exit 0
fi

# Check for PHP
if command -v php &> /dev/null; then
    echo "✅ PHP found"
    echo "🌐 Starting server on http://localhost:$PORT"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    php -S localhost:$PORT
    exit 0
fi

# No server found
echo "❌ No suitable server found!"
echo ""
echo "Please install one of the following:"
echo "  • Python 3: https://www.python.org/"
echo "  • Node.js: https://nodejs.org/"
echo "  • PHP: https://www.php.net/"
echo ""
echo "Or manually open index.html in your browser."
exit 1
