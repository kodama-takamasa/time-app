#!/bin/bash

# タイマーアプリのディレクトリに移動
cd "$(dirname "$0")"

echo "================================"
echo "⏱️  タイマーアプリを起動中..."
echo "================================"
echo ""
echo "ブラウザで以下を開いてください："
echo "👉 http://localhost:8000"
echo ""
echo "終了するには Ctrl+C を押してください"
echo "================================"
echo ""

# Pythonサーバーを起動
python3 -m http.server 8000

