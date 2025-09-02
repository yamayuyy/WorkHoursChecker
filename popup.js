// Google Calendar API設定
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let gapi, googleAuth;

// DOM要素
const authButton = document.getElementById('auth-button');
const authStatus = document.getElementById('auth-status');
const mainContent = document.getElementById('main-content');
const searchTitleInput = document.getElementById('search-title');
const hourlyRateInput = document.getElementById('hourly-rate');
const calculateButton = document.getElementById('calculate-button');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const totalHours = document.getElementById('total-hours');
const totalSalary = document.getElementById('total-salary');
const eventsContainer = document.getElementById('events-container');
const errorDiv = document.getElementById('error');

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
	await loadSavedData();
	await initializeGapi();
});

// 保存されたデータを読み込み
async function loadSavedData() {
	try {
		const data = await chrome.storage.sync.get(['searchTitle', 'hourlyRate']);
		if (data.searchTitle) {
			searchTitleInput.value = data.searchTitle;
		}
		if (data.hourlyRate) {
			hourlyRateInput.value = data.hourlyRate;
		}
	} catch (error) {
		console.error('データの読み込みエラー:', error);
	}
}

// データを保存
async function saveData() {
	try {
		await chrome.storage.sync.set({
			searchTitle: searchTitleInput.value,
			hourlyRate: hourlyRateInput.value,
		});
	} catch (error) {
		console.error('データの保存エラー:', error);
	}
}

// Google API初期化
async function initializeGapi() {
	try {
		// Chrome Identity APIを使用してトークンを取得
		authButton.addEventListener('click', handleAuth);
		calculateButton.addEventListener('click', handleCalculate);

		// 入力値の保存
		searchTitleInput.addEventListener('input', saveData);
		hourlyRateInput.addEventListener('input', saveData);
	} catch (error) {
		console.error('初期化エラー:', error);
		showError('初期化に失敗しました: ' + error.message);
	}
}

// 認証処理
async function handleAuth() {
	try {
		authButton.textContent = '認証中...';
		authButton.disabled = true;

		const token = await chrome.identity.getAuthToken({
			interactive: true,
			scopes: [SCOPES],
		});

		if (token) {
			authStatus.textContent = '認証成功！';
			authStatus.className = 'status success';
			authStatus.classList.remove('hidden');
			mainContent.classList.remove('hidden');
			authButton.style.display = 'none';
		}
	} catch (error) {
		console.error('認証エラー:', error);
		showError('認証に失敗しました: ' + error.message);
		authButton.textContent = 'Googleアカウントでログイン';
		authButton.disabled = false;
	}
}

// 計算処理
async function handleCalculate() {
	const searchTitle = searchTitleInput.value.trim();
	const hourlyRate = parseFloat(hourlyRateInput.value);

	if (!searchTitle) {
		showError('検索タイトルを入力してください');
		return;
	}

	if (!hourlyRate || hourlyRate <= 0) {
		showError('有効な時給を入力してください');
		return;
	}

	try {
		hideError();
		showLoading();
		await saveData();

		const events = await getCalendarEvents(searchTitle);
		const { totalMinutes, eventDetails } = calculateWorkHours(events);
		const totalHoursValue = totalMinutes / 60;
		const salary = totalHoursValue * hourlyRate;

		displayResults(totalHoursValue, salary, eventDetails);
	} catch (error) {
		console.error('計算エラー:', error);
		showError('計算に失敗しました: ' + error.message);
	} finally {
		hideLoading();
	}
}

// カレンダーイベント取得
async function getCalendarEvents(searchTitle) {
	try {
		const token = await chrome.identity.getAuthToken({ interactive: false });

		// 今週の開始日と終了日を取得
		const { startOfWeek, endOfWeek } = getThisWeekRange();

		const response = await fetch(
			`https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
				`timeMin=${startOfWeek.toISOString()}&` +
				`timeMax=${endOfWeek.toISOString()}&` +
				`q=${encodeURIComponent(searchTitle)}&` +
				`singleEvents=true&` +
				`orderBy=startTime`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (!response.ok) {
			throw new Error(`APIエラー: ${response.status}`);
		}

		const data = await response.json();
		return data.items || [];
	} catch (error) {
		console.error('カレンダーイベント取得エラー:', error);
		throw error;
	}
}

// 今週の範囲を取得
function getThisWeekRange() {
	const now = new Date();
	const dayOfWeek = now.getDay(); // 0 = 日曜日
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - dayOfWeek); // 日曜日を週の開始とする
	startOfWeek.setHours(0, 0, 0, 0);

	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	endOfWeek.setHours(23, 59, 59, 999);

	return { startOfWeek, endOfWeek };
}

// 稼働時間計算
function calculateWorkHours(events) {
	let totalMinutes = 0;
	const eventDetails = [];

	events.forEach((event) => {
		if (!event.start || !event.end) return;

		const startTime = new Date(event.start.dateTime || event.start.date);
		const endTime = new Date(event.end.dateTime || event.end.date);

		// 終日イベントの場合はスキップ
		if (event.start.date && event.end.date) return;

		const durationMinutes = (endTime - startTime) / (1000 * 60);
		totalMinutes += durationMinutes;

		eventDetails.push({
			title: event.summary,
			start: startTime,
			end: endTime,
			duration: durationMinutes,
		});
	});

	return { totalMinutes, eventDetails };
}

// 結果表示
function displayResults(hours, salary, eventDetails) {
	totalHours.textContent = `${hours.toFixed(1)}時間`;
	totalSalary.textContent = `¥${salary.toLocaleString()}`;

	// イベント詳細表示
	eventsContainer.innerHTML = '';
	eventDetails.forEach((event) => {
		const eventDiv = document.createElement('div');
		eventDiv.className = 'event-item';

		const durationHours = (event.duration / 60).toFixed(1);
		const startStr =
			event.start.toLocaleDateString('ja-JP') +
			' ' +
			event.start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
		const endStr = event.end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

		eventDiv.innerHTML = `
      <div class="event-title">${event.title}</div>
      <div class="event-time">${startStr} - ${endStr}</div>
      <div class="event-duration">${durationHours}時間</div>
    `;

		eventsContainer.appendChild(eventDiv);
	});

	results.classList.remove('hidden');
}

// ローディング表示
function showLoading() {
	loading.classList.remove('hidden');
	results.classList.add('hidden');
}

function hideLoading() {
	loading.classList.add('hidden');
}

// エラー表示
function showError(message) {
	errorDiv.textContent = message;
	errorDiv.classList.remove('hidden');
	setTimeout(() => {
		hideError();
	}, 5000);
}

function hideError() {
	errorDiv.classList.add('hidden');
}
