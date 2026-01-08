// Firebase 모듈 import
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

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

console.log('🔧 Firebase 초기화 시작...');

// Firebase 초기화
let app, database;
let isConnected = false;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    isConnected = true;
    updateSyncStatus('online', 'Firebase 연결됨 ✓');
    console.log('✅ Firebase 연결 성공!');
} catch (error) {
    isConnected = false;
    updateSyncStatus('offline', 'Firebase 연결 실패');
    console.error('❌ Firebase 연결 오류:', error);
    alert('Firebase 연결에 실패했습니다.\n\n오류: ' + error.message + '\n\n설정을 확인해주세요.');
}

const DB_PATH = 'lottoData';

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
    if (!isConnected) {
        console.error('❌ Firebase 연결 안됨');
        return [];
    }
    
    try {
        console.log('📥 Firebase에서 데이터 로드 시도...');
        const dbRef = ref(database, DB_PATH);
        const snapshot = await get(dbRef);
        
        if (snapshot.exists()) {
            console.log('✅ 데이터 로드 성공:', snapshot.val().length, '개');
            return snapshot.val();
        } else {
            console.log('📭 Firebase에 데이터 없음');
            return [];
        }
    } catch (error) {
        console.error('❌ Firebase 로드 오류:', error);
        updateSyncStatus('offline', 'Firebase 로드 실패');
        return [];
    }
}

// 번호 색상 클래스
function getColorClass(number) {
    if (number <= 10) return 'color1';
    if (number <= 20) return 'color2';
    if (number <= 30) return 'color3';
    if (number <= 40) return 'color4';
    return 'color5';
}

// 번호 통계 분석
async function analyzeNumbers() {
    const data = await loadFromFirebase();
    const frequency = {};
    
    for (let i = 1; i <= 45; i++) {
        frequency[i] = 0;
    }
    
    data.forEach(item => {
        item.numbers.forEach(num => {
            frequency[num]++;
        });
    });
    
    return { frequency };
}

// 로또 용지 행 번호 가져오기
function getRowForNumber(num) {
    if (num >= 1 && num <= 7) return 1;
    if (num >= 8 && num <= 14) return 2;
    if (num >= 15 && num <= 21) return 3;
    if (num >= 22 && num <= 28) return 4;
    if (num >= 29 && num <= 35) return 5;
    if (num >= 36 && num <= 42) return 6;
    if (num >= 43 && num <= 45) return 7;
}

// 추천 번호의 마킹 표시 렌더링
function renderRecommendMarkings(recommendations) {
    // 각 추천 번호 아래에 마킹 용지 추가
    recommendations.forEach((rec, index) => {
        const recommendItem = document.querySelectorAll('.recommend-item')[index];
        if (!recommendItem) return;
        
        // 마킹 용지 HTML 생성
        const markingHTML = `
            <div class="recommend-marking">
                <div class="marking-title">📋 마킹 용지</div>
                <div class="mini-lotto-sheet">
                    <div class="mini-sheet-row">
                        <span class="mini-row-label">1행</span>
                        <div class="mini-sheet-numbers" data-row="1" data-rec-index="${index}"></div>
                    </div>
                    <div class="mini-sheet-row">
                        <span class="mini-row-label">2행</span>
                        <div class="mini-sheet-numbers" data-row="2" data-rec-index="${index}"></div>
                    </div>
                    <div class="mini-sheet-row">
                        <span class="mini-row-label">3행</span>
                        <div class="mini-sheet-numbers" data-row="3" data-rec-index="${index}"></div>
                    </div>
                    <div class="mini-sheet-row">
                        <span class="mini-row-label">4행</span>
                        <div class="mini-sheet-numbers" data-row="4" data-rec-index="${index}"></div>
                    </div>
                    <div class="mini-sheet-row">
                        <span class="mini-row-label">5행</span>
                        <div class="mini-sheet-numbers" data-row="5" data-rec-index="${index}"></div>
                    </div>
                    <div class="mini-sheet-row">
                        <span class="mini-row-label">6행</span>
                        <div class="mini-sheet-numbers" data-row="6" data-rec-index="${index}"></div>
                    </div>
                    <div class="mini-sheet-row">
                        <span class="mini-row-label">7행</span>
                        <div class="mini-sheet-numbers" data-row="7" data-rec-index="${index}"></div>
                    </div>
                </div>
            </div>
        `;
        
        recommendItem.insertAdjacentHTML('beforeend', markingHTML);
        
        // 각 행에 번호 채우기
        for (let row = 1; row <= 7; row++) {
            const rowElement = recommendItem.querySelector(`.mini-sheet-numbers[data-row="${row}"][data-rec-index="${index}"]`);
            if (!rowElement) continue;
            
            let start, end;
            if (row === 1) { start = 1; end = 7; }
            else if (row === 2) { start = 8; end = 14; }
            else if (row === 3) { start = 15; end = 21; }
            else if (row === 4) { start = 22; end = 28; }
            else if (row === 5) { start = 29; end = 35; }
            else if (row === 6) { start = 36; end = 42; }
            else { start = 43; end = 45; }
            
            for (let num = start; num <= end; num++) {
                const numberDiv = document.createElement('div');
                numberDiv.className = 'mini-sheet-number';
                numberDiv.textContent = num;
                
                // 추천 번호에 포함되면 마킹
                if (rec.numbers.includes(num)) {
                    numberDiv.classList.add('marked');
                }
                
                rowElement.appendChild(numberDiv);
            }
        }
    });
}

// 전체 마킹 분석 렌더링 (기존 당첨 번호 분석)
async function renderMarkingAnalysis() {
    const { frequency } = await analyzeNumbers();
    
    const frequencies = Object.values(frequency);
    const avgFreq = frequencies.reduce((a, b) => a + b, 0) / 45;
    
    for (let row = 1; row <= 7; row++) {
        const rowElement = document.getElementById(`row${row}`);
        if (!rowElement) continue;
        
        rowElement.innerHTML = '';
        
        let start, end;
        if (row === 1) { start = 1; end = 7; }
        else if (row === 2) { start = 8; end = 14; }
        else if (row === 3) { start = 15; end = 21; }
        else if (row === 4) { start = 22; end = 28; }
        else if (row === 5) { start = 29; end = 35; }
        else if (row === 6) { start = 36; end = 42; }
        else { start = 43; end = 45; }
        
        for (let num = start; num <= end; num++) {
            const freq = frequency[num];
            const numberDiv = document.createElement('div');
            numberDiv.className = 'sheet-number';
            numberDiv.textContent = num;
            
            if (freq > 0) {
                numberDiv.classList.add('marked');
                if (freq >= avgFreq * 1.2) {
                    numberDiv.classList.add('high');
                } else if (freq >= avgFreq * 0.8) {
                    numberDiv.classList.add('medium');
                } else {
                    numberDiv.classList.add('low');
                }
            }
            
            rowElement.appendChild(numberDiv);
        }
    }
    
    const analysisSection = document.getElementById('analysisSection');
    if (analysisSection) {
        analysisSection.style.display = 'block';
    }
}

// 로또 번호 생성 함수들
async function generateRareNumbers() {
    const { frequency } = await analyzeNumbers();
    const rareNumbers = [];
    
    for (let num = 1; num <= 45; num++) {
        rareNumbers.push({ num, freq: frequency[num] });
    }
    
    rareNumbers.sort((a, b) => a.freq - b.freq);
    const candidates = rareNumbers.slice(0, 15).map(item => item.num);
    return getRandomNumbers(candidates, 6).sort((a, b) => a - b);
}

async function generateFrequentNumbers() {
    const { frequency } = await analyzeNumbers();
    const frequentNumbers = [];
    
    for (let num = 1; num <= 45; num++) {
        frequentNumbers.push({ num, freq: frequency[num] });
    }
    
    frequentNumbers.sort((a, b) => b.freq - a.freq);
    const candidates = frequentNumbers.slice(0, 15).map(item => item.num);
    return getRandomNumbers(candidates, 6).sort((a, b) => a - b);
}

async function generateMixedNumbers() {
    const { frequency } = await analyzeNumbers();
    const allNumbers = [];
    
    for (let num = 1; num <= 45; num++) {
        allNumbers.push({ num, freq: frequency[num] });
    }
    
    allNumbers.sort((a, b) => b.freq - a.freq);
    
    const topCandidates = allNumbers.slice(0, 15).map(item => item.num);
    const bottomCandidates = allNumbers.slice(-15).map(item => item.num);
    
    const topPicks = getRandomNumbers(topCandidates, 3);
    const bottomPicks = getRandomNumbers(bottomCandidates, 3);
    
    return [...topPicks, ...bottomPicks].sort((a, b) => a - b);
}

async function generatePositionBasedNumbers() {
    const { frequency } = await analyzeNumbers();
    const rowFrequency = {};
    
    for (let row = 1; row <= 7; row++) {
        rowFrequency[row] = { total: 0, numbers: [] };
    }
    
    for (let num = 1; num <= 45; num++) {
        const row = getRowForNumber(num);
        rowFrequency[row].total += frequency[num];
        rowFrequency[row].numbers.push({ num, freq: frequency[num] });
    }
    
    const selectedNumbers = [];
    const rowsToSelect = [1, 2, 3, 4, 5, 6];
    
    rowsToSelect.forEach(row => {
        const rowNums = rowFrequency[row].numbers;
        rowNums.sort((a, b) => b.freq - a.freq);
        
        const candidates = [
            ...rowNums.slice(0, 3).map(item => item.num),
            ...rowNums.slice(-2).map(item => item.num)
        ];
        
        const selected = getRandomNumbers(candidates, 1)[0];
        if (!selectedNumbers.includes(selected)) {
            selectedNumbers.push(selected);
        }
    });
    
    while (selectedNumbers.length < 6) {
        const randomNum = Math.floor(Math.random() * 45) + 1;
        if (!selectedNumbers.includes(randomNum)) {
            selectedNumbers.push(randomNum);
        }
    }
    
    return selectedNumbers.sort((a, b) => a - b);
}

// 배열에서 랜덤하게 n개 선택
function getRandomNumbers(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 로또 번호 10개 생성
async function generateLottoNumbers() {
    console.log('🎲 로또 번호 생성 시작...');
    const recommendations = [];
    
    // 1-2: 안나온 번호 위주 (2개)
    recommendations.push({
        title: '추천 #1',
        type: 'rare',
        typeText: '안나온 번호 위주',
        numbers: await generateRareNumbers()
    });
    recommendations.push({
        title: '추천 #2',
        type: 'rare',
        typeText: '안나온 번호 위주',
        numbers: await generateRareNumbers()
    });
    
    // 3-4: 자주 나온 번호 위주 (2개)
    recommendations.push({
        title: '추천 #3',
        type: 'frequent',
        typeText: '자주 나온 번호',
        numbers: await generateFrequentNumbers()
    });
    recommendations.push({
        title: '추천 #4',
        type: 'frequent',
        typeText: '자주 나온 번호',
        numbers: await generateFrequentNumbers()
    });
    
    // 5-7: 골고루 섞은 번호 (3개)
    recommendations.push({
        title: '추천 #5',
        type: 'mixed',
        typeText: '균형 조합',
        numbers: await generateMixedNumbers()
    });
    recommendations.push({
        title: '추천 #6',
        type: 'mixed',
        typeText: '균형 조합',
        numbers: await generateMixedNumbers()
    });
    recommendations.push({
        title: '추천 #7',
        type: 'mixed',
        typeText: '균형 조합',
        numbers: await generateMixedNumbers()
    });
    
    // 8-10: 위치 분석 기반 (3개)
    recommendations.push({
        title: '추천 #8',
        type: 'position',
        typeText: '위치 분석',
        numbers: await generatePositionBasedNumbers()
    });
    recommendations.push({
        title: '추천 #9',
        type: 'position',
        typeText: '위치 분석',
        numbers: await generatePositionBasedNumbers()
    });
    recommendations.push({
        title: '추천 #10',
        type: 'position',
        typeText: '위치 분석',
        numbers: await generatePositionBasedNumbers()
    });
    
    console.log('✅ 로또 번호 생성 완료');
    return recommendations;
}

// 추천 번호 렌더링
async function renderRecommendations() {
    console.log('📝 추천 번호 렌더링 시작...');
    
    const recommendations = await generateLottoNumbers();
    const recommendList = document.getElementById('recommendList');
    
    if (!recommendList) {
        console.error('❌ recommendList 요소를 찾을 수 없습니다');
        return;
    }
    
    recommendList.innerHTML = '';
    
    recommendations.forEach(rec => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'recommend-item';
        
        const numbersHTML = rec.numbers.map(num => 
            `<div class="number-ball ${getColorClass(num)}">${num}</div>`
        ).join('');
        
        itemDiv.innerHTML = `
            <div class="recommend-header">
                <span class="recommend-title">${rec.title}</span>
                <span class="recommend-type type-${rec.type}">${rec.typeText}</span>
            </div>
            <div class="recommend-numbers">
                ${numbersHTML}
            </div>
        `;
        
        recommendList.appendChild(itemDiv);
    });
    
    // 각 추천 번호에 마킹 용지 추가
    renderRecommendMarkings(recommendations);
    
    const generatedNumbers = document.getElementById('generatedNumbers');
    if (generatedNumbers) {
        generatedNumbers.style.display = 'block';
    }
    
    await renderMarkingAnalysis();
    
    const scrollTarget = document.getElementById('generatedNumbers');
    if (scrollTarget) {
        scrollTarget.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }
    
    console.log('✅ 추천 번호 렌더링 완료');
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 페이지 로드 완료');
    
    // Firebase 연결 확인
    if (!isConnected) {
        alert('Firebase 연결에 실패했습니다.\n\nFirebase 설정을 확인해주세요:\n1. firebaseConfig가 올바른지 확인\n2. Firebase Realtime Database가 생성되었는지 확인\n3. 보안 규칙이 올바른지 확인');
        return;
    }
    
    // 번호 생성 버튼
    const generateButton = document.getElementById('generateButton');
    if (generateButton) {
        generateButton.addEventListener('click', async function() {
            console.log('🎲 번호 생성 버튼 클릭');
            
            const data = await loadFromFirebase();
            if (data.length === 0) {
                alert('분석할 데이터가 없습니다.\n\n먼저 "번호 관리" 페이지에서 회차를 추가해주세요.');
                return;
            }
            
            // 버튼 비활성화 (중복 클릭 방지)
            generateButton.disabled = true;
            generateButton.textContent = '생성 중...';
            
            try {
                await renderRecommendations();
            } catch (error) {
                console.error('❌ 번호 생성 오류:', error);
                alert('번호 생성 중 오류가 발생했습니다.\n\n' + error.message);
            } finally {
                // 버튼 다시 활성화
                generateButton.disabled = false;
                generateButton.textContent = '번호 생성하기';
            }
        });
    } else {
        console.error('❌ generateButton 요소를 찾을 수 없습니다');
    }
    
    console.log('✅ 이벤트 리스너 등록 완료');
});

