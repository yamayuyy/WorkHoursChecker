# Work Hours Checker - 稼働時間チェッカー

Google カレンダーの予定から稼働時間を自動計算し、想定給料を算出する Chrome 拡張機能です。

## 機能

- **特定タイトルでの予定検索**: 指定したキーワードを含む予定のみを抽出
- **今週の稼働時間計算**: 今週（日曜日〜土曜日）の稼働時間を自動計算
- **給料計算**: 設定した時給から想定給料を算出
- **詳細表示**: 該当する予定の詳細（日時、時間）を一覧表示
- **データ保存**: 検索タイトルと時給の設定を自動保存

## 使用方法

1. Chrome 拡張機能のアイコンをクリック
2. 「Google アカウントでログイン」をクリックして認証
3. **検索タイトル**に稼働関連の予定に含まれるキーワードを入力
   - 例: "作業", "会議", "プロジェクト名"
4. **時給**を円単位で入力
5. 「今週の稼働時間を計算」をクリック

## 注意事項

- Google カレンダーの読み取り権限が必要です
- 終日イベントは計算対象外です
- 週の区切りは日曜日〜土曜日です
- 設定は自動保存されます

## セットアップ

### 1. Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. **APIs & Services > Library**で「Google Calendar API」を有効化
4. **APIs & Services > Credentials**で「OAuth 2.0 Client IDs」を作成
   - Application type: Chrome extension
   - Name: Work Hours Checker
5. Client ID をコピー

### 2. 拡張機能の設定

1. `manifest.json`の`YOUR_CLIENT_ID`を取得した Client ID に置き換え
2. `YOUR_EXTENSION_KEY`は任意の文字列に置き換え（開発時は不要）

### 3. Chrome 拡張機能のインストール

1. Chrome で`chrome://extensions/`を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトフォルダを選択

## トラブルシューティング

### 認証エラーが発生する場合

- Google Cloud Console で OAuth 2.0 の設定を確認
- Chrome 拡張機能の ID と manifest.json の設定が一致しているか確認

### 予定が取得できない場合

- Google カレンダーに該当する予定があるか確認
- 検索タイトルが予定のタイトルに含まれているか確認
- カレンダーの権限設定を確認

## 技術仕様

- **フレームワーク**: Vanilla JavaScript
- **API**: Google Calendar API v3
- **認証**: Chrome Identity API
- **ストレージ**: Chrome Storage API
