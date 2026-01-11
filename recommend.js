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
    const consecutiveCount = {};
    const sumAnalysis = { low: 0, mid: 0, high: 0 };
    const oddEvenCount = { odd: 0, even: 0 };
    
    // 초기화
    for (let i = 1; i <= 45; i++) {
        frequency[i] = 0;
        consecutiveCount[i] = 0;
    }
    
    // 빈도수 및 패턴 분석
    data.forEach(item => {
        let sum = 0;
        let oddCount = 0;
        let evenCount = 0;
        
        item.numbers.forEach(num => {
            frequency[num]++;
            sum += num;
            if (num % 2 === 0) evenCount++;
            else oddCount++;
        });
        
        // 합계 범위 분석
        if (sum < 120) sumAnalysis.low++;
        else if (sum <= 160) sumAnalysis.mid++;
        else sumAnalysis.high++;
        
        // 홀짝 비율
        oddEvenCount.odd += oddCount;
        oddEvenCount.even += evenCount;
        
        // 연속 번호 체크
        const sorted = [...item.numbers].sort((a, b) => a - b);
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) {
                consecutiveCount[sorted[i]]++;
            }
        }
    });
    
    return { frequency, consecutiveCount, sumAnalysis, oddEvenCount };
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

// 배열에서 랜덤하게 n개 선택
function getRandomNumbers(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// 중복 제거 및 정렬
function ensureUniqueAndSort(numbers) {
    return [...new Set(numbers)].sort((a, b) => a - b);
}

// ========================================
// 새로운 추천 알고리즘 (확률 기반)
// ========================================

// 1. 홀짝 균형 조합 (홀수 3개, 짝수 3개)
async function generateOddEvenBalance() {
    const { frequency } = await analyzeNumbers();
    const odds = [];
    const evens = [];
    
    for (let i = 1; i <= 45; i++) {
        if (i % 2 === 0) {
            evens.push({ num: i, freq: frequency[i] });
        } else {
            odds.push({ num: i, freq: frequency[i] });
        }
    }
    
    // 빈도수 기반 정렬
    odds.sort((a, b) => b.freq - a.freq);
    evens.sort((a, b) => b.freq - a.freq);
    
    // 상위 15개에서 랜덤 선택
    const oddCandidates = odds.slice(0, 15).map(item => item.num);
    const evenCandidates = evens.slice(0, 15).map(item => item.num);
    
    const selectedOdds = getRandomNumbers(oddCandidates, 3);
    const selectedEvens = getRandomNumbers(evenCandidates, 3);
    
    return ensureUniqueAndSort([...selectedOdds, ...selectedEvens]);
}

// 2. 구간 분산 조합 (1-15, 16-30, 31-45 각 구간에서 2개씩)
async function generateRangeDistribution() {
    const { frequency } = await analyzeNumbers();
    const range1 = []; // 1-15
    const range2 = []; // 16-30
    const range3 = []; // 31-45
    
    for (let i = 1; i <= 45; i++) {
        if (i <= 15) range1.push({ num: i, freq: frequency[i] });
        else if (i <= 30) range2.push({ num: i, freq: frequency[i] });
        else range3.push({ num: i, freq: frequency[i] });
    }
    
    // 각 구간에서 빈도수 높은 순으로 정렬
    range1.sort((a, b) => b.freq - a.freq);
    range2.sort((a, b) => b.freq - a.freq);
    range3.sort((a, b) => b.freq - a.freq);
    
    const selected1 = getRandomNumbers(range1.slice(0, 10).map(item => item.num), 2);
    const selected2 = getRandomNumbers(range2.slice(0, 10).map(item => item.num), 2);
    const selected3 = getRandomNumbers(range3.slice(0, 10).map(item => item.num), 2);
    
    return ensureUniqueAndSort([...selected1, ...selected2, ...selected3]);
}

// 3. 합계 범위 최적화 (합계 120-160 사이)
async function generateSumOptimized() {
    const { frequency } = await analyzeNumbers();
    const allNumbers = [];
    
    for (let i = 1; i <= 45; i++) {
        allNumbers.push({ num: i, freq: frequency[i] });
    }
    
    allNumbers.sort((a, b) => b.freq - a.freq);
    
    let attempts = 0;
    while (attempts < 100) {
        const candidates = getRandomNumbers(allNumbers.slice(0, 25).map(item => item.num), 6);
        const sum = candidates.reduce((a, b) => a + b, 0);
        
        if (sum >= 120 && sum <= 160) {
            return ensureUniqueAndSort(candidates);
        }
        attempts++;
    }
    
    // 실패 시 기본 조합
    return ensureUniqueAndSort(getRandomNumbers(allNumbers.slice(0, 20).map(item => item.num), 6));
}

// 4. 연속 번호 회피 조합
async function generateNonConsecutive() {
    const { frequency } = await analyzeNumbers();
    const allNumbers = [];
    
    for (let i = 1; i <= 45; i++) {
        allNumbers.push({ num: i, freq: frequency[i] });
    }
    
    allNumbers.sort((a, b) => b.freq - a.freq);
    
    let attempts = 0;
    while (attempts < 100) {
        const candidates = getRandomNumbers(allNumbers.slice(0, 30).map(item => item.num), 6);
        const sorted = candidates.sort((a, b) => a - b);
        
        let hasConsecutive = false;
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1] - sorted[i] === 1) {
                hasConsecutive = true;
                break;
            }
        }
        
        if (!hasConsecutive) {
            return ensureUniqueAndSort(candidates);
        }
        attempts++;
    }
    
    // 실패 시 기본 조합
    return ensureUniqueAndSort(getRandomNumbers(allNumbers.slice(0, 20).map(item => item.num), 6));
}

// 5. 끝자리 분산 조합 (끝자리 0-9 골고루)
async function generateLastDigitDistribution() {
    const { frequency } = await analyzeNumbers();
    const digitGroups = {};
    
    for (let i = 0; i <= 9; i++) {
        digitGroups[i] = [];
    }
    
    for (let i = 1; i <= 45; i++) {
        const lastDigit = i % 10;
        digitGroups[lastDigit].push({ num: i, freq: frequency[i] });
    }
    
    // 각 끝자리 그룹에서 빈도수 높은 순 정렬
    for (let digit in digitGroups) {
        digitGroups[digit].sort((a, b) => b.freq - a.freq);
    }
    
    const selected = [];
    const usedDigits = new Set();
    
    // 6개의 서로 다른 끝자리 선택
    let attempts = 0;
    while (selected.length < 6 && attempts < 100) {
        const digit = Math.floor(Math.random() * 10);
        if (!usedDigits.has(digit) && digitGroups[digit].length > 0) {
            const candidates = digitGroups[digit].slice(0, 3).map(item => item.num);
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            if (!selected.includes(pick)) {
                selected.push(pick);
                usedDigits.add(digit);
            }
        }
        attempts++;
    }
    
    // 6개가 안되면 채우기
    while (selected.length < 6) {
        const randomNum = Math.floor(Math.random() * 45) + 1;
        if (!selected.includes(randomNum)) {
            selected.push(randomNum);
        }
    }
    
    return ensureUniqueAndSort(selected);
}

// 6. 통합 균형 조합 (자주 나온 번호 + 안 나온 번호 + 위치 분석)
async function generateBalancedCombination() {
    const { frequency } = await analyzeNumbers();
    const allNumbers = [];
    
    for (let i = 1; i <= 45; i++) {
        allNumbers.push({ num: i, freq: frequency[i] });
    }
    
    // 빈도수로 정렬
    allNumbers.sort((a, b) => b.freq - a.freq);
    
    // 자주 나온 번호 2개
    const frequent = getRandomNumbers(allNumbers.slice(0, 10).map(item => item.num), 2);
    
    // 안 나온 번호 2개
    const rare = getRandomNumbers(allNumbers.slice(-10).map(item => item.num), 2);
    
    // 중간 빈도 번호 2개
    const mid = getRandomNumbers(allNumbers.slice(15, 30).map(item => item.num), 2);
    
    return ensureUniqueAndSort([...frequent, ...rare, ...mid]);
}

// 7. 위치 기반 균형 조합 (각 행에서 골고루)
async function generatePositionBalanced() {
    const { frequency } = await analyzeNumbers();
    const rowGroups = {};
    
    for (let row = 1; row <= 7; row++) {
        rowGroups[row] = [];
    }
    
    for (let num = 1; num<= 45; num++) {
        const row = getRowForNumber(num);
        rowGroups[row].push({ num, freq: frequency[num] });
    }
    
    // 각 행에서 빈도수 높은 순 정렬
    for (let row in rowGroups) {
        rowGroups[row].sort((a, b) => b.freq - a.freq);
    }
    
    const selected = [];
    const rowsToSelect = [1, 2, 3, 4, 5, 6]; // 6개 행에서 각 1개씩
    
    rowsToSelect.forEach(row => {
        const candidates = rowGroups[row].slice(0, 5).map(item => item.num);
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        if (!selected.includes(pick)) {
            selected.push(pick);
        }
    });
    
    // 6개가 안되면 채우기
    while (selected.length < 6) {
        const randomNum = Math.floor(Math.random() * 45) + 1;
        if (!selected.includes(randomNum)) {
            selected.push(randomNum);
        }
    }
    
    return ensureUniqueAndSort(selected);
}

// 8. 최근 트렌드 반영 조합 (최근 5회차 집중 분석)
async function generateRecentTrend() {
    const data = await loadFromFirebase();
    const recentData = data.slice(0, 5); // 최근 5회차
    const recentFreq = {};
    
    for (let i = 1; i <= 45; i++) {
        recentFreq[i] = 0;
    }
    
    recentData.forEach(item => {
        item.numbers.forEach(num => {
            recentFreq[num]++;
        });
    });
    
    const allNumbers = [];
    for (let i = 1; i <= 45; i++) {
        allNumbers.push({ num: i, freq: recentFreq[i] });
    }
    
    // 최근 자주 나온 번호 3개
    allNumbers.sort((a, b) => b.freq - a.freq);
    const hot = getRandomNumbers(allNumbers.slice(0, 12).map(item => item.num), 3);
    
    // 최근 안 나온 번호 3개
    const cold = getRandomNumbers(allNumbers.slice(-15).map(item => item.num), 3);
    
    return ensureUniqueAndSort([...hot, ...cold]);
}

// 9. 고급 통계 조합 (표준편차 고려)
async function generateStatisticalBalance() {
    const { frequency } = await analyzeNumbers();
    const allNumbers = [];
    
    for (let i = 1; i <= 45; i++) {
        allNumbers.push({ num: i, freq: frequency[i] });
    }
    
    // 빈도수 평균 계산
    const avgFreq = allNumbers.reduce((sum, item) => sum + item.freq, 0) / 45;
    
    // 평균 근처 번호들 선택
    const balanced = allNumbers.filter(item => 
        Math.abs(item.freq - avgFreq) <= avgFreq * 0.5
    );
    
    if (balanced.length >= 6) {
        return ensureUniqueAndSort(getRandomNumbers(balanced.map(item => item.num), 6));
    } else {
        return ensureUniqueAndSort(getRandomNumbers(allNumbers.map(item => item.num), 6));
    }
}

// 10. 황금 비율 조합 (피보나치 수열 기반)
async function generateGoldenRatio() {
    const { frequency } = await analyzeNumbers();
    const fibonacci = [1, 2, 3, 5, 8, 13, 21, 34];
    const fibonacciNums = [];
    
    for (let i = 1; i <= 45; i++) {
        fibonacciNums.push({ 
            num: i, 
            freq: frequency[i],
            isFib: fibonacci.includes(i)
        });
    }
    
    // 피보나치 수 2개
    const fibCandidates = fibonacciNums.filter(item => item.isFib);
    fibCandidates.sort((a, b) => b.freq - a.freq);
    const fibSelected = getRandomNumbers(fibCandidates.slice(0, 6).map(item => item.num), 2);
    
    // 일반 번호 4개
    const normalCandidates = fibonacciNums.filter(item => !item.isFib);
    normalCandidates.sort((a, b) => b.freq - a.freq);
    const normalSelected = getRandomNumbers(normalCandidates.slice(0, 20).map(item => item.num), 4);
    
    return ensureUniqueAndSort([...fibSelected, ...normalSelected]);
}

// ========================================
// 로또 번호 10개 생성 (새로운 알고리즘)
// ========================================
async function generateLottoNumbers() {
    console.log('🎲 로또 번호 생성 시작...');
    const recommendations = [];
    
    // 확률 기반 추천 5개
    recommendations.push({
        title: '추천 #1',
        type: 'probability',
        typeText: '홀짝 균형 (3:3)',
        numbers: await generateOddEvenBalance()
    });
    
    recommendations.push({
        title: '추천 #2',
        type: 'probability',
        typeText: '구간 분산 조합',
        numbers: await generateRangeDistribution()
    });
    
    recommendations.push({
        title: '추천 #3',
        type: 'probability',
        typeText: '합계 최적화 (120-160)',
        numbers: await generateSumOptimized()
    });
    
    recommendations.push({
        title: '추천 #4',
        type: 'probability',
        typeText: '연속번호 회피',
        numbers: await generateNonConsecutive()
    });
    
    recommendations.push({
        title: '추천 #5',
        type: 'probability',
        typeText: '끝자리 분산',
        numbers: await generateLastDigitDistribution()
    });
    
    // 균형 조합 5개
    recommendations.push({
        title: '추천 #6',
        type: 'balanced',
        typeText: '통합 균형 조합',
        numbers: await generateBalancedCombination()
    });
    
    recommendations.push({
        title: '추천 #7',
        type: 'balanced',
        typeText: '위치 기반 균형',
        numbers: await generatePositionBalanced()
    });
    
    recommendations.push({
        title: '추천 #8',
        type: 'balanced',
        typeText: '최근 트렌드 반영',
        numbers: await generateRecentTrend()
    });
    
    recommendations.push({
        title: '추천 #9',
        type: 'balanced',
        typeText: '통계적 균형',
        numbers: await generateStatisticalBalance()
    });
    
    recommendations.push({
        title: '추천 #10',
        type: 'balanced',
        typeText: '황금 비율 조합',
        numbers: await generateGoldenRatio()
    });
    
    console.log('✅ 로또 번호 생성 완료');
    return recommendations;
}

// 추천 번호의 마킹 표시 렌더링
function renderRecommendMarkings(recommendations) {
    recommendations.forEach((rec, index) => {
        const recommendItem = document.querySelectorAll('.recommend-item')[index];
        if (!recommendItem) return;
        
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
                
                if (rec.numbers.includes(num)) {
                    numberDiv.classList.add('marked');
                }
                
                rowElement.appendChild(numberDiv);
            }
        }
    });
}

// 전체 마킹 분석 렌더링
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


