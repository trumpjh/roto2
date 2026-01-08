// Firebase 모듈 import
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, get, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ⭐⭐⭐ 여기에 본인의 Firebase 설정을 붙여넣으세요! ⭐⭐⭐
const firebaseConfig = {
  apiKey: "AIzaSyAsvf984OZ3q4VvRHWGCyxUw-8ow3dGQ5w",
  authDomain: "lotte01-131ea.firebaseapp.com",
  databaseURL: "https://lotte01-131ea-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lotte01-131ea",
  storageBucket: "lotte01-131ea.firebasestorage.app",
  messagingSenderId: "176783709606",
  appId: "1:176783709606:web:b5fd8ce5e3c1d78faeab67",
  measurementId: "G-VHCSRFDLHG"
};

// Firebase 초기화
let app, database;
try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    updateSyncStatus('online', 'Firebase 연결됨 ✓');
    console.log('✅ Firebase 연결 성공!');
} catch (error) {
    updateSyncStatus('offline', 'Firebase 연결 실패');
    console.error('❌ Firebase 연결 오류:', error);
    alert('Firebase 연결에 실패했습니다. 설정을 확인해주세요.');
}

// 데이터 저장 경로
const DB_PATH = 'lottoData';

// 기준 회차 정보
const BASE_ROUND = 1205;
const BASE_DATE = new Date('2026-01-03');

// 초기 데이터
const initialData = [
    { round: 1205, date: '2026-01-03', numbers: [7, 12, 19, 23, 31, 42], bonus: 15 },
    { round: 1204, date: '2025-12-27', numbers: [3, 8, 14, 22, 35, 41], bonus: 28 },
    { round: 1203, date: '2025-12-20', numbers: [5, 11, 18, 27, 33, 44], bonus: 9 },
    { round: 1202, date: '2025-12-13', numbers: [2, 13, 21, 29, 36, 43], bonus: 17 },
    { round: 1201, date: '2025-12-06', numbers: [6, 10, 16, 25, 34, 40], bonus: 12 },
    { round: 1200, date: '2025-11-29', numbers: [4, 9, 15, 24, 32, 39], bonus: 20 },
    { round: 1199, date: '2025-11-22', numbers: [1, 14, 19, 26, 37, 45], bonus: 8 },
    { round: 1198, date: '2025-11-15', numbers: [7, 11, 17, 28, 35, 42], bonus: 13 },
    { round: 1197, date: '2025-11-08', numbers: [3, 12, 20, 30, 38, 44], bonus: 5 },
    { round: 1196, date: '2025-11-01', numbers: [2, 8, 16, 23, 31, 41], bonus: 18 },
    { round: 1195, date: '2025-10-25', numbers: [6, 13, 21, 27, 36, 43], bonus: 10 },
    { round: 1194, date: '2025-10-18', numbers: [4, 10, 18, 25, 33, 40], bonus: 22 },
    { round: 1193, date: '2025-10-11', numbers: [1, 9, 15, 24, 32, 39], bonus: 14 },
    { round: 1192, date: '2025-10-04', numbers: [5, 11, 19, 28,34, 42], bonus: 7 },
    { round: 1191, date: '2025-09-27', numbers: [3, 12, 17, 26, 35, 45], bonus: 16 }
];

// 동기화 상태 업데이트
function updateSyncStatus(status, text) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (statusDot && statusText) {
        statusDot.className = `status-dot ${status}`;
        statusText.textContent = text;
    }
}

// Firebase에서 데이터 로드
async function loadFromFirebase() {
    try {
        const dbRef = ref(database, DB_PATH);
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
            console.log('📥 Firebase에서 데이터 로드 성공');
            return snapshot.val();
        } else {
            console.log('📭 Firebase에 데이터 없음 - 초기 데이터 사용');
            return null;
        }
    } catch (error) {
        console.error('❌ Firebase 로드 오류:', error);
        updateSyncStatus('offline', 'Firebase 로드 실패');
        return null;
    }
}

// Firebase에 데이터 저장
async function saveToFirebase(data) {
    try {
        const dbRef = ref(database, DB_PATH);
        await set(dbRef, data);
        console.log('💾 Firebase에 저장 완료');
        updateSyncStatus('online', 'Firebase 동기화 완료 ✓');
    } catch (error) {
        console.error('❌ Firebase 저장 오류:', error);
        updateSyncStatus('offline', 'Firebase 저장 실패');
    }
}

// 로또 데이터 로드 (Firebase에서)
async function loadLottoData() {
    const firebaseData = await loadFromFirebase();
    
    if (firebaseData && firebaseData.length > 0) {
        return firebaseData;
    } else {
        // Firebase에 데이터가 없으면 초기 데이터 저장
        await saveToFirebase(initialData);
        return initialData;
    }
}

// 로또 데이터 저장 (Firebase에)
async function saveLottoData(data) {
    await saveToFirebase(data);
}

// 회차 번호로 날짜 계산
function calculateDateFromRound(round) {
    const roundDiff = round - BASE_ROUND;
    const daysDiff = roundDiff * 7;
    
    const resultDate = new Date(BASE_DATE);
    resultDate.setDate(resultDate.getDate() + daysDiff);
    
    const year = resultDate.getFullYear();
    const month = String(resultDate.getMonth() + 1).padStart(2, '0');
    const day = String(resultDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 날짜 포맷 변환
function formatDateDisplay(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${year}. ${month}. ${day}.`;
}

// 데이터 정렬
function sortDataByRound(data) {
    return data.sort((a, b) => b.round - a.round);
}

// 번호 색상 클래스
function getColorClass(number) {
    if (number <= 10) return 'color1';
    if (number <= 20) return 'color2';
    if (number <= 30) return 'color3';
    if (number <= 40) return 'color4';
    return 'color5';
}

// 로또 목록 렌더링
async function renderLottoList() {
    const lottoList = document.getElementById('lottoList');
    let data = await loadLottoData();
    
    data = sortDataByRound(data);
    
    lottoList.innerHTML = '';
    
    if (data.length === 0) {
        lottoList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">등록된 회차가 없습니다.</p>';
        return;
    }
    
    data.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'lotto-item';
        itemDiv.dataset.round = item.round;
        
        const numbersHTML = item.numbers.map(num => 
            `<div class="number-ball ${getColorClass(num)}">${num}</div>`
        ).join('');
        
        itemDiv.innerHTML = `
            <button class="btn-delete" onclick="deleteRound(${item.round})">삭제</button>
            <div class="lotto-header">
                <span class="round-info">제 ${item.round}회</span>
                <span class="date-info">${formatDateDisplay(item.date)}</span>
            </div>
            <div class="numbers-container">
                ${numbersHTML}
                <span class="bonus-separator">+</span>
                <div class="number-ball bonus">${item.bonus}</div>
            </div>
        `;
        
        lottoList.appendChild(itemDiv);
    });
}

// 중복 회차 확인
async function checkDuplicate(round, date) {
    const data = await loadLottoData();
    return data.findIndex(item => item.round === round || item.date === date);
}

// 모달 표시
function showModal(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const modalMessage = document.getElementById('modalMessage');
        const btnYes = document.getElementById('modalYes');
        const btnNo = document.getElementById('modalNo');
        
        modalMessage.textContent = message;
        modal.classList.add('show');
        
        function cleanup() {
            modal.classList.remove('show');
            btnYes.removeEventListener('click', handleYes);
            btnNo.removeEventListener('click', handleNo);
        }
        
        function handleYes() {
            cleanup();
            resolve(true);
        }
        
        function handleNo() {
            cleanup();
            resolve(false);
        }
        
        btnYes.addEventListener('click', handleYes);
        btnNo.addEventListener('click', handleNo);
    });
}

// 삭제 모달 표시
function showDeleteModal(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('deleteModal');
        const modalMessage = document.getElementById('deleteModalMessage');
        const btnYes = document.getElementById('deleteYes');
        const btnNo = document.getElementById('deleteNo');
        
        modalMessage.textContent = message;
        modal.classList.add('show');
        
        function cleanup() {
            modal.classList.remove('show');
            btnYes.removeEventListener('click', handleYes);
            btnNo.removeEventListener('click', handleNo);
        }
        
        function handleYes() {
            cleanup();
            resolve(true);
        }
        
        function handleNo() {
            cleanup();
            resolve(false);
        }
        
        btnYes.addEventListener('click', handleYes);
        btnNo.addEventListener('click', handleNo);
    });
}

// 회차 삭제 (전역 함수로 선언)
window.deleteRound = async function(round) {
    let data = await loadLottoData();
    const item = data.find(d => d.round === round);
    
    if (!item) return;
    
    const message = `제 ${item.round}회 (${formatDateDisplay(item.date)}) 회차를 삭제하시겠습니까?`;
    const shouldDelete = await showDeleteModal(message);
    
    if (shouldDelete) {
        updateSyncStatus('online', '삭제 중...');
        data = data.filter(d => d.round !== round);
        await saveLottoData(data);
        await renderLottoList();
        alert('회차가 삭제되었습니다.');
    }
}

// 새 회차 추가
async function addNewRound() {
    const roundNumber = document.getElementById('roundNumber').value;
    const drawDate = document.getElementById('drawDate').value;
    const numberInputs = document.querySelectorAll('.number-input');
    const bonusNumber = document.getElementById('bonusNumber').value;
    
    // 유효성 검사
    if (!roundNumber || !drawDate || !bonusNumber) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    const numbers = [];
    for (let input of numberInputs) {
        if (!input.value || input.value < 1 || input.value > 45) {
            alert('1~45 사이의 번호를 입력해주세요.');
            return;
        }
        numbers.push(parseInt(input.value));
    }
    
    if (parseInt(bonusNumber) < 1 || parseInt(bonusNumber) > 45) {
        alert('보너스 번호는 1~45 사이여야 합니다.');
        return;
    }
    
    // 중복 검사
    const allNumbers = [...numbers, parseInt(bonusNumber)];
    if (new Set(allNumbers).size !== allNumbers.length) {
        alert('중복된 번호가 있습니다.');
        return;
    }
    
    // 새 회차 데이터 생성
    const newRound = {
        round: parseInt(roundNumber),
        date: drawDate,
        numbers: numbers.sort((a, b) => a - b),
        bonus: parseInt(bonusNumber)
    };
    
    // 기존 데이터 로드
    let data = await loadLottoData();
    
    // 중복 회차 확인
    const duplicateIndex = await checkDuplicate(newRound.round, newRound.date);
    
    if (duplicateIndex !== -1) {
        const existingRound = data[duplicateIndex];
        const message = `제 ${existingRound.round}회 (${formatDateDisplay(existingRound.date)}) 회차가 이미 존재합니다.\n데이터를 변경하시겠습니까?`;
        
        const shouldUpdate = await showModal(message);
        
        if (shouldUpdate) {
            updateSyncStatus('online', '업데이트 중...');
            data[duplicateIndex] = newRound;
            data = sortDataByRound(data);
            if (data.length > 15) {
                data = data.slice(0, 15);
            }
            await saveLottoData(data);
            await renderLottoList();
            clearInputFields();
            alert('회차 정보가 변경되었습니다.');
        }
        return;
    }
    
    // 새 회차 추가
    updateSyncStatus('online', '저장 중...');
    data.push(newRound);
    data = sortDataByRound(data);
    
    if (data.length > 15) {
        data = data.slice(0, 15);
    }
    
    await saveLottoData(data);
    await renderLottoList();
    clearInputFields();
    
    alert('새 회차가 추가되었습니다!');
}

// 입력 필드 초기화
function clearInputFields() {
    document.getElementById('roundNumber').value = '';
    document.getElementById('drawDate').value = '';
    document.querySelectorAll('.number-input').forEach(input => input.value = '');
    document.getElementById('bonusNumber').value = '';
}

// 초기 데이터로 리셋
async function resetToInitialData() {
    if (confirm('초기 데이터로 리셋하시겠습니까? 현재 데이터는 모두 삭제됩니다.')) {
        updateSyncStatus('online', '리셋 중...');
        await saveLottoData(initialData);
        await renderLottoList();
        alert('초기 데이터로 리셋되었습니다.');
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', async function() {
    // 초기 렌더링
    await renderLottoList();
    
    // Firebase 실시간 동기화 설정
    const dbRef = ref(database, DB_PATH);
    onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            console.log('🔄 Firebase 데이터 변경 감지');
            renderLottoList();
        }
    });
    
    // 회차 번호 입력 시 자동으로 날짜 계산
    document.getElementById('roundNumber').addEventListener('input', function() {
        const round = parseInt(this.value);
        if (round && !isNaN(round)) {
            const calculatedDate = calculateDateFromRound(round);
            document.getElementById('drawDate').value = calculatedDate;
        } else {
            document.getElementById('drawDate').value = '';
        }
    });
    
    // 추가 버튼
    document.getElementById('addButton').addEventListener('click', addNewRound);
    
    // 리셋 버튼
    document.getElementById('resetButton').addEventListener('click', resetToInitialData);
    
    // 엔터키로 다음 입력 필드로 이동
    const numberInputs = document.querySelectorAll('.number-input');
    numberInputs.forEach((input, index) => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (index < numberInputs.length - 1) {
                    numberInputs[index + 1].focus();
                } else {
                    document.getElementById('bonusNumber').focus();
                }
            }
        });
    });
    
    // 보너스 번호에서 엔터키 누르면 추가
    document.getElementById('bonusNumber').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addNewRound();
        }
    });
    
    // 회차 번호에서 엔터키 누르면 첫 번째 번호 입력으로 이동
    document.getElementById('roundNumber').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            numberInputs[0].focus();
        }
    });
    
    // 숫자 입력 제한 (1-45)
    const allNumberInputs = [...numberInputs, document.getElementById('bonusNumber')];
    allNumberInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value > 45) this.value = 45;
            if (this.value < 0) this.value = '';
        });
    });
}); 
