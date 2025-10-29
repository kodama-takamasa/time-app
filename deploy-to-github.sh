#!/bin/bash

# GitHub デプロイ用スクリプト
# このスクリプトは対話式でGitHubにデプロイします

echo "================================"
echo "📦 GitHub デプロイスクリプト"
echo "================================"
echo ""

# プロジェクトディレクトリに移動
cd "$(dirname "$0")"

# GitHubユーザー名を入力
echo "GitHubのユーザー名を入力してください："
read -p "ユーザー名: " GITHUB_USERNAME

# リポジトリ名を入力
echo ""
echo "リポジトリ名を入力してください（例: timer-app）："
read -p "リポジトリ名: " REPO_NAME

echo ""
echo "================================"
echo "設定内容を確認してください："
echo "================================"
echo "ユーザー名: $GITHUB_USERNAME"
echo "リポジトリ名: $REPO_NAME"
echo "公開URL: https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
echo "================================"
echo ""
read -p "この内容で続行しますか？ (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "キャンセルしました。"
    exit 1
fi

echo ""
echo "🚀 デプロイを開始します..."
echo ""

# Git初期化
if [ ! -d ".git" ]; then
    echo "📁 Gitリポジトリを初期化中..."
    git init
    git branch -M main
    echo "✅ 初期化完了"
else
    echo "✅ 既存のGitリポジトリを使用"
fi

# ファイルを追加
echo ""
echo "📦 ファイルを追加中..."
git add .
echo "✅ ファイル追加完了"

# コミット
echo ""
echo "💾 コミット中..."
git commit -m "Initial commit: タイマーアプリの初回コミット"
echo "✅ コミット完了"

# リモートリポジトリの確認
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$CURRENT_REMOTE" ]; then
    # リモートリポジトリを追加
    echo ""
    echo "🔗 GitHubリポジトリに接続中..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "✅ 接続完了"
else
    echo ""
    echo "⚠️  既存のリモートリポジトリを検出: $CURRENT_REMOTE"
    read -p "上書きしますか？ (y/n): " OVERWRITE
    if [ "$OVERWRITE" = "y" ]; then
        git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        echo "✅ リモートURLを更新しました"
    fi
fi

# プッシュ
echo ""
echo "⬆️  GitHubにプッシュ中..."
echo ""
echo "⚠️  GitHubの認証が求められます："
echo "   - ブラウザが開いたら、認証してください"
echo "   - または、個人アクセストークンを入力してください"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "✅ デプロイ成功！"
    echo "================================"
    echo ""
    echo "📍 次の手順："
    echo ""
    echo "1. GitHubのリポジトリページを開く："
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "2. Settings → Pages を開く"
    echo ""
    echo "3. Source で 'main' ブランチを選択して Save"
    echo ""
    echo "4. 数分待つと、以下のURLでアクセス可能になります："
    echo "   https://$GITHUB_USERNAME.github.io/$REPO_NAME/"
    echo ""
    echo "================================"
else
    echo ""
    echo "================================"
    echo "❌ プッシュに失敗しました"
    echo "================================"
    echo ""
    echo "トラブルシューティング："
    echo ""
    echo "1. 個人アクセストークンを使用する場合："
    echo "   - GitHub → Settings → Developer settings"
    echo "   - Personal access tokens → Generate new token"
    echo "   - 'repo' にチェックを入れて生成"
    echo "   - 生成されたトークンをコピー"
    echo ""
    echo "2. 再度プッシュを試す："
    echo "   git push -u origin main"
    echo "   Username: $GITHUB_USERNAME"
    echo "   Password: (生成したトークンを貼り付け)"
    echo ""
    echo "詳細は GITHUB_DEPLOY_GUIDE.md を参照してください。"
    echo "================================"
fi

