# Work Hours Checker - 稼働時間チェッカー

Google カレンダーの予定から稼働時間を自動計算し、想定給料を算出する Chrome 拡張機能です。

## 機能

- **特定タイトルでの予定検索**: 指定したキーワードを含む予定のみを抽出
- **今週の稼働時間計算**: 今週（日曜日〜土曜日）の稼働時間を自動計算
- **給料計算**: 設定した時給から想定給料を算出
- **詳細表示**: 該当する予定の詳細（日時、時間）を一覧表示
- **データ保存**: 検索タイトルと時給の設定を自動保存
- **フォールバック認証**: Chrome/Brave 両対応の堅牢な認証システム

## セットアップ

### 1. 設定ファイルの準備

1. `config.sample.js`を`config.js`にコピー
2. `config.js`の`YOUR_GOOGLE_CLIENT_ID_HERE`を実際の Client ID に変更

### 2. Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. **APIs & Services > Library**で「Google Calendar API」を有効化
4. **APIs & Services > Credentials**で「OAuth 2.0 Client IDs」を作成
   - **Application type**: **Web application**（重要！）
   - **Name**: Work Hours Checker
   - **Authorized redirect URIs**に `https://YOUR_EXTENSION_ID.chromiumapp.org/` を追加
5. Client ID をコピーして`config.js`に設定

### 3. OAuth 同意画面の設定

1. **APIs & Services > OAuth consent screen**
2. **User Type**: External
3. 必須項目を入力：
   - **App name**: Work Hours Checker
   - **User support email**: あなたのメールアドレス
   - **Developer contact information**: あなたのメールアドレス
4. **Test users**にあなたの Google アカウントを追加

### 4. Chrome 拡張機能のインストール

1. Chrome で`chrome://extensions/`を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このプロジェクトフォルダを選択
5. 拡張機能の ID をコピーして、Google Cloud Console のリダイレクト URI を更新

## 使用方法

1. Chrome 拡張機能のアイコンをクリック
2. 「Google アカウントでログイン」をクリックして認証
3. **検索タイトル**に稼働関連の予定に含まれるキーワードを入力
   - 例: "lb 勤務", "作業", "会議", "プロジェクト名"
4. **時給**を円単位で入力
5. 「今週の稼働時間を計算」をクリック

## 技術仕様

- **フレームワーク**: Vanilla JavaScript
- **API**: Google Calendar API v3
- **認証**: Chrome Identity API（フォールバック機能付き）
- **ストレージ**: Chrome Storage API
- **ブラウザ対応**: Chrome, Brave（Chromium ベース）

## 認証システム

この拡張機能は 2 段階のフォールバック認証を採用：

1. **第 1 段階**: `chrome.identity.getAuthToken()` - Chrome 最適化
2. **第 2 段階**: `chrome.identity.launchWebAuthFlow()` - 標準 OAuth（Brave 対応）

## ファイル構成

```markdown
WorkHoursChecker/
├── manifest.json # 拡張機能設定
├── popup.html # UI
├── popup.css # スタイル
├── popup.js # メインロジック
├── config.js # 設定ファイル（Git 除外）
├── config.sample.js # 設定サンプル
├── README.md # このファイル
└── setup.md # 詳細セットアップガイド
```

## セキュリティ

- `config.js`は`.gitignore`で除外され、機密情報を保護
- OAuth 2.0 による安全な認証
- 最小限のスコープ（カレンダー読み取りのみ）

## 注意事項

- Google カレンダーの読み取り権限が必要です
- 終日イベントは計算対象外です
- 週の区切りは日曜日〜土曜日です
- 設定は自動保存されます
- 個人使用レベルでは完全無料（Google Calendar API 無料枠内）

## トラブルシューティング

### 認証エラーが発生する場合

- Google Cloud Console で OAuth Client ID が「Web application」タイプで作成されているか確認
- リダイレクト URI が拡張機能 ID と一致しているか確認
- OAuth 同意画面で Test users にアカウントが追加されているか確認

### 予定が取得できない場合

- Google カレンダーに該当する予定があるか確認
- 検索タイトルが予定のタイトルに含まれているか確認
- 今週（日曜日〜土曜日）の範囲に予定があるか確認

### 「OAuth2 not granted or revoked」エラー

- Chrome 拡張機能を再読み込み
- `chrome://settings/content/all`でサイトデータをクリア
- 再度認証を実行

## 開発者向け

### 設定ファイルの更新

`config.js`で Client ID やデフォルト値を変更できます：

```javascript
const CONFIG = {
	GOOGLE_CLIENT_ID: 'your-client-id',
	DEFAULT_VALUES: {
		HOURLY_RATE: 2000, // デフォルト時給
		SEARCH_TITLE: 'your-work', // デフォルト検索キーワード
	},
};
```

### カスタマイズ

- `popup.css`: UI のスタイル変更
- `popup.js`: 機能の追加・修正
- `manifest.json`: 権限やメタデータの更新
