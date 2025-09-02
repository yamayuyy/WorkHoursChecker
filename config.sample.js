// 設定ファイルのサンプル
// このファイルをconfig.jsにコピーして、実際の値を設定してください
const CONFIG = {
	GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE',
	GOOGLE_SCOPES: 'https://www.googleapis.com/auth/calendar.readonly',
	API_ENDPOINTS: {
		CALENDAR: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
		TOKEN_INFO: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
	},
	DEFAULT_VALUES: {
		HOURLY_RATE: 1500,
		SEARCH_TITLE: '勤務',
	},
};

if (typeof module !== 'undefined' && module.exports) {
	module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
	window.CONFIG = CONFIG;
}
