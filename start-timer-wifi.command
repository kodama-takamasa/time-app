#!/bin/bash

# タイマーアプリのディレクトリに移動
cd "$(dirname "$0")"

# IPアドレスを取得
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "================================"
echo "⏱️  タイマーアプリを起動しました！"
echo "================================"
echo ""
echo "🖥️  PC（このMac）で開く："
echo "   http://localhost:8000"
echo ""
echo "📱 スマホで開く（同じWi-Fi内）："
echo "   http://${IP}:8000"
echo ""
echo "📝 スマホは同じWi-Fiに接続してください"
echo "📝 ブラウザで開いて「ホーム画面に追加」でアプリ化できます"
echo ""
echo "終了するには Ctrl+C を押してください"
echo "================================"
echo ""

# Pythonサーバーを起動（外部アクセス許可）
python3 -m http.server 8000 --bind 0.0.0.0

