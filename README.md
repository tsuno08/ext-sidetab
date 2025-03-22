# Side Tab

Chrome 拡張機能：開いているタブを左側にリッチな UI で表示し、タブグループの管理も可能にする拡張機能。

## 機能

- 開いているタブのタイトルとアイコンをリストとして表示
- タブタイトルをクリックすると、対応するタブをアクティブにする
- タブのグループへの移動
- グループの折りたたみ/展開
- タブの検索機能
- タブの並び替え（ドラッグ&ドロップ）

## 技術スタック

- **言語**: JavaScript
- **API**: Chrome Extensions API
- **バージョン**: Manifest V3
- **UI フレームワーク**: Tailwind CSS

## 開発環境のセットアップ

1. 依存関係のインストール

```bash
npm install
```

2. Tailwind CSS のビルド

```bash
npm run build
```

開発中は以下のコマンドで自動ビルドが有効になります：

```bash
npm run dev
```

## プロジェクト構造

```
.
├── src/
│   └── styles.css      # Tailwind CSSの基本設定
├── background.js       # バックグラウンドスクリプト
├── content.js         # コンテンツスクリプト
├── manifest.json      # 拡張機能の設定
├── package.json       # 依存関係の管理
├── tailwind.config.js # Tailwind CSSの設定
└── styles.css         # ビルドされたCSS
```

## 開発手順

1. **manifest.json の作成**

   - 拡張機能の名前、説明、権限 (`tabs`, `scripting`, `storage`) を定義
   - `content_scripts` を定義し、`content.js` をすべてのページで実行するように設定
   - Tailwind CSS の設定

2. **content.js の作成**

   - `document.documentElement` で `html` 要素を取得
   - サイドバー用の `div` 要素を作成し、Tailwind CSS でスタイルを設定
   - `html.insertBefore` を使用して、サイドバーを `html` タグの最初の子要素として追加
   - `html.style.display = 'flex'` を指定して、`html` タグの子要素を横並びにする
   - タブグループの状態管理
   - タブの検索機能の実装
   - ドラッグ&ドロップによる並び替え機能の実装

3. **background.js の作成**
   - タブ情報の取得と更新
   - タブグループの状態管理
   - タブのアクティブ化処理

## 今後の改善点

- タブのプレビュー表示
- タブのピン留め機能
- タブの履歴管理
- カスタムテーマのサポート
- キーボードショートカット
