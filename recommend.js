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
// 개선된 복합 조건 추천 알고리즘
// ========================================

// 번호 검증 함수들
function checkOddEvenRatio(numbers) {
    const oddCount = numbers.filter(n => n % 2 === 1).length;
    const evenCount = 6 - oddCount;
    return { odd: oddCount, even: evenCount };
}

function checkRangeDistribution(numbers) {
    const ranges = {
        range1: numbers.filter(n => n >= 1 && n <= 15).length,   // 1-15
        range2: numbers.filter(n => n >= 16 && n <= 30).length,  // 16-30
        range3: numbers.filter(n => n >= 31 && n <= 45).length   // 31-45
    };
    return ranges;
}

function hasConsecutive(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i + 1] - sorted[i] === 1) {
            return true;
        }
    }
    return false;
}

function hasSameLastDigit(numbers) {
    const lastDigits = numbers.map(n => n % 10);
    return new Set(lastDigits).size < lastDigits.length;
}

function calculateSum(numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}

// 복합 조건 검증
function validateCombination(numbers, criteria) {
    const oddEven = checkOddEvenRatio(numbers);
    const ranges = checkRangeDistribution(numbers);
    const sum = calculateSum(numbers);
    
    // 홀짝 비율 체크
    const oddEvenValid = criteria.oddEvenRatios.some(ratio => 
        oddEven.odd === ratio.odd && oddEven.even === ratio.even
    );
    
    // 구간 분산 체크 (각 구간에 최소 1개 이상)
    const rangeValid = ranges.range1 >= 1 && ranges.range2 >= 1 && ranges.range3 >= 1;
    
    // 연속 번호 체크
    const consecutiveValid = criteria.allowConsecutive || !hasConsecutive(numbers);
    
    // 끝자리 중복 체크
    const lastDigitValid = criteria.allowSameLastDigit || !hasSameLastDigit(numbers);
    
    // 합계 범위 체크
    const sumValid = !criteria.sumRange || 
        (sum >= criteria.sumRange.min && sum <= criteria.sumRange.max);
    
    return oddEvenValid && rangeValid && consecutiveValid && lastDigitValid && sumValid;
}

// 스마트 번호 생성기 (복합 조건)
async function generateSmartCombination(criteria) {
    const { frequency } = await analyzeNumbers();
    const allNumbers = [];
    
    for (let i = 1; i <= 45; i++) {
        allNumbers.push({ num: i, freq: frequency[i] });
    }
    
    // 빈도수 기반 가중치 정렬
    if (criteria.preferFrequent) {
        allNumbers.sort((a, b) => b.freq - a.freq);
    } else if (criteria.preferRare) {
        allNumbers.sort((a, b) => a.freq - b.freq);
    } else {
        allNumbers.sort(() => Math.random() - 0.5);
    }
    
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (attempts < maxAttempts) {
        const candidates = [];
        const usedRanges = { range1: 0, range2: 0, range3: 0 };
        
        // 각 구간에서 최소 1개씩 선택
        const range1Nums = allNumbers.filter(item => item.num >= 1 && item.num <= 15);
        const range2Nums = allNumbers.filter(item => item.num >= 16 && item.num <= 30);
        const range3Nums = allNumbers.filter(item => item.num >= 31 && item.num <= 45);
        
        // 각 구간에서 1개씩 선택
        if (range1Nums.length > 0) {
            const pick = range1Nums[Math.floor(Math.random() * Math.min(10, range1Nums.length))].num;
            candidates.push(pick);
        }
        
        if (range2Nums.length > 0) {
            const pick = range2Nums[Math.floor(Math.random() * Math.min(10, range2Nums.length))].num;
            if (!candidates.includes(pick)) candidates.push(pick);
        }
        
        if (range3Nums.length > 0) {
            const pick = range3Nums[Math.floor(Math.random() * Math.min(10, range3Nums.length))].num;
            if (!candidates.includes(pick)) candidates.push(pick);
        }
        
        // 나머지 번호 채우기
        while (candidates.length < 6) {
            const randomIndex = Math.floor(Math.random() * Math.min(30, allNumbers.length));
            const pick = allNumbers[randomIndex].num;
            if (!candidates.includes(pick)) {
                candidates.push(pick);
            }
        }
        
        // 조건 검증
        if (validateCombination(candidates, criteria)) {
            return ensureUniqueAndSort(candidates);
        }
        
        attempts++;
    }
    
    // 실패 시 기본 조합 반환
    console.warn('조건을 만족하는 조합을 찾지 못했습니다. 기본 조합을 반환합니다.');
    return ensureUniqueAndSort(getRandomNumbers(allNumbers.slice(0, 30).map(item => item.num), 6));
}

// 1. 홀짝 2:4 + 구간 분산 + 연속/끝자리 회피
async function generateType1() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 2, even: 4 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 100, max: 180 },
        preferFrequent: false
    });
}

// 2. 홀짝 3:3 + 구간 분산 + 연속/끝자리 회피
async function generateType2() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 3, even: 3 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 110, max: 170 },
        preferFrequent: false
    });
}

// 3. 홀짝 4:2 + 구간 분산 + 연속/끝자리 회피
async function generateType3() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 4, even: 2 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 120, max: 160 },
        preferFrequent: false
    });
}

// 4. 홀짝 2:4 + 구간 분산 + 자주 나온 번호 위주
async function generateType4() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 2, even: 4 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 100, max: 180 },
        preferFrequent: true
    });
}

// 5. 홀짝 3:3 + 구간 분산 + 자주 나온 번호 위주
async function generateType5() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 3, even: 3 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 110, max: 170 },
        preferFrequent: true
    });
}

// 6. 홀짝 4:2 + 구간 분산 + 안 나온 번호 위주
async function generateType6() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 4, even: 2 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 120, max: 160 },
        preferRare: true
    });
}

// 7. 홀짝 2:4/3:3/4:2 혼합 + 위치 분석
async function generateType7() {
    const ratios = [
        { odd: 2, even: 4 },
        { odd: 3, even: 3 },
        { odd: 4, even: 2 }
    ];
    
    return await generateSmartCombination({
        oddEvenRatios: ratios,
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 110, max: 170 },
        preferFrequent: false
    });
}

// 8. 홀짝 3:3 + 구간 균형 + 최근 트렌드
async function generateType8() {
    const data = await loadFromFirebase();
    const recentData = data.slice(0, 5);
    const recentFreq = {};
    
    for (let i = 1; i <= 45; i++) {
        recentFreq[i] = 0;
    }
    
    recentData.forEach(item => {
        item.numbers.forEach(num => {
            recentFreq[num]++;
        });
    });
    
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 3, even: 3 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 120, max: 160 },
        preferFrequent: false
    });
}

// 9. 홀짝 2:4 + 구간 분산 + 통계적 균형
async function generateType9() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 2, even: 4 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 130, max: 150 },
        preferFrequent: false
    });
}

// 10. 홀짝 4:2 + 구간 분산 + 종합 분석
async function generateType10() {
    return await generateSmartCombination({
        oddEvenRatios: [{ odd: 4, even: 2 }],
        allowConsecutive: false,
        allowSameLastDigit: false,
        sumRange: { min: 115, max: 165 },
        preferFrequent: false
    });
}


// ========================================
// 로또 번호 10개 생성 (개선된 알고리즘)
// ========================================
async function generateLottoNumbers() {
    console.log('🎲 로또 번호 생성 시작...');
    const recommendations = [];
    
    // 1-5: 다양한 홀짝 비율 + 복합 조건
    recommendations.push({
        title: '추천 #1',
        type: 'smart',
        typeText: '홀짝 2:4 균형',
        numbers: await generateType1()
    });
    
    recommendations.push({
        title: '추천 #2',
        type: 'smart',
        typeText: '홀짝 3:3 균형',
        numbers: await generateType2()
    });
    
    recommendations.push({
        title: '추천 #3',
        type: 'smart',
        typeText: '홀짝 4:2 균형',
        numbers: await generateType3()
    });
    
    recommendations.push({
        title: '추천 #4',
        type: 'smart',
        typeText: '홀짝 2:4 + 자주나온번호',
        numbers: await generateType4()
    });
    
    recommendations.push({
        title: '추천 #5',
        type: 'smart',
        typeText: '홀짝 3:3 + 자주나온번호',
        numbers: await generateType5()
    });
    
    // 6-10: 균형 조합
    recommendations.push({
        title: '추천 #6',
        type: 'balanced',
        typeText: '홀짝 4:2 + 안나온번호',
        numbers: await generateType6()
    });
    
    recommendations.push({
        title: '추천 #7',
        type: 'balanced',
        typeText: '혼합 비율 + 위치분석',
        numbers: await generateType7()
    });
    
    recommendations.push({
        title: '추천 #8',
        type: 'balanced',
        typeText: '홀짝 3:3 + 최근트렌드',
        numbers: await generateType8()
    });
    
    recommendations.push({
        title: '추천 #9',
        type: 'balanced',
        typeText: '홀짝 2:4 + 통계균형',
        numbers: await generateType9()
    });
    
    recommendations.push({
        title: '추천 #10',
        type: 'balanced',
        typeText: '홀짝 4:2 + 종합분석',
        numbers: await generateType10()
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


