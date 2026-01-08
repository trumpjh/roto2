// 로또 데이터 저장 키
const STORAGE_KEY = 'lottoData';

// 기준 회차 정보 (1205회 = 2026년 1월 3일 토요일)
const BASE_ROUND = 1205;
const BASE_DATE = new Date('2026-01-03');

// 초기 데이터 (2026년 1월 3일 기준 최근 15회차)
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
    { round: 1192, date: '2025-10-04', numbers: [5, 11, 19, 28, 34, 42], bonus: 7 },
    { round: 1191, date: '2025-09-27', numbers: [3, 12, 17, 26, 35, 45], bonus: 16 }
];

// 회차 번호로 날짜 계산 (매주 토요일)
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

// 날짜를 YYYY. MM. DD. 형식으로 변환
function formatDateDisplay(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${year}. ${month}. ${day}.`;
}

// 로또 데이터 로드
function loadLottoData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    } else {
        saveLottoData(initialData);
        return initialData;
    }
}

// 로또 데이터 저장
function saveLottoData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 데이터 정렬 (회차 높은 순)
function sortDataByRound(data) {
    return data.sort((a, b) => b.round - a.round);
}

// 번호에 따른 색상 클래스 반환
function getColorClass(number) {
    if (number <= 10) return 'color1';
    if (number <= 20) return 'color2';
    if (number <= 30) return 'color3';
    if (number <= 40) return 'color4';
    return 'color5';
}

// 번호 통계 분석
function analyzeNumbers() {
    const data = loadLottoData();
    const frequency = {};
    const positionFrequency = {};
    
    // 1-45까지 초기화
    for (let i = 1; i <= 45; i++) {
        frequency[i] = 0;
        positionFrequency[i] = 0;
    }
    
    // 빈도수 계산
    data.forEach(item => {
        item.numbers.forEach(num => {
            frequency[num]++;
            positionFrequency[num]++;
        });
    });
    
    return { frequency, positionFrequency };
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

// 마킹 분석 렌더링
function renderMarkingAnalysis() {
    const { frequency } = analyzeNumbers();
    
    // 최대/최소 빈도 계산
    const frequencies = Object.values(frequency);
    const avgFreq = frequencies.reduce((a, b) => a + b, 0) / 45;
    
    // 각 행별로 렌더링
    for (let row = 1; row <= 7; row++) {
        const rowElement = document.getElementById(`row${row}`);
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
    
    document.getElementById('analysisSection').style.display = 'block';
}

// 로또 번호 생성 함수들
function generateRareNumbers() {
    const { frequency } = analyzeNumbers();
    const rareNumbers = [];
    
    // 빈도수가 낮은 번호들 찾기
    for (let num = 1; num <= 45; num++) {
        rareNumbers.push({ num, freq: frequency[num] });
    }
    
    // 빈도수 낮은 순으로 정렬
    rareNumbers.sort((a, b) => a.freq - b.freq);
    
    // 상위 15개 중에서 랜덤하게 6개 선택
    const candidates = rareNumbers.slice(0, 15).map(item => item.num);
    return getRandomNumbers(candidates, 6).sort((a, b) => a - b);
}

function generateFrequentNumbers() {
    const { frequency } = analyzeNumbers();
    const frequentNumbers = [];
    
    // 빈도수가 높은 번호들 찾기
    for (let num = 1; num <= 45; num++) {
        frequentNumbers.push({ num, freq: frequency[num] });
    }
    
    // 빈도수 높은 순으로 정렬
    frequentNumbers.sort((a, b) => b.freq - a.freq);
    
    // 상위 15개 중에서 랜덤하게 6개 선택
    const candidates = frequentNumbers.slice(0, 15).map(item => item.num);
    return getRandomNumbers(candidates, 6).sort((a, b) => a - b);
}

function generateMixedNumbers() {
    const { frequency } = analyzeNumbers();
    const allNumbers = [];
    
    for (let num = 1; num <= 45; num++) {
        allNumbers.push({ num, freq: frequency[num] });
    }
    
    // 빈도수로 정렬
    allNumbers.sort((a, b) => b.freq - a.freq);
    
    // 상위 15개와 하위 15개에서 각각 선택
    const topCandidates = allNumbers.slice(0, 15).map(item => item.num);
    const bottomCandidates = allNumbers.slice(-15).map(item => item.num);
    
    const topPicks = getRandomNumbers(topCandidates, 3);
    const bottomPicks = getRandomNumbers(bottomCandidates, 3);
    
    return [...topPicks, ...bottomPicks].sort((a, b) => a - b);
}

function generatePositionBasedNumbers() {
    const { frequency } = analyzeNumbers();
    const rowFrequency = {};
    
    // 각 행별 빈도수 계산
    for (let row = 1; row <= 7; row++) {
        rowFrequency[row] = { total: 0, numbers: [] };
    }
    
    for (let num = 1; num <= 45; num++) {
        const row = getRowForNumber(num);
        rowFrequency[row].total += frequency[num];
        rowFrequency[row].numbers.push({ num, freq: frequency[num] });
    }
    
    // 각 행에서 빈도수 기반으로 번호 선택
    const selectedNumbers = [];
    const rowsToSelect = [1, 2, 3, 4, 5, 6]; // 6개 행에서 각 1개씩
    
    rowsToSelect.forEach(row => {
        const rowNums = rowFrequency[row].numbers;
        // 해당 행에서 빈도수 높은 번호와 낮은 번호 섞기
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
    
    // 6개가 안되면 랜덤으로 채우기
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
function generateLottoNumbers() {
    const recommendations = [];
    
    // 1-2: 안나온 번호 위주 (2개)
    recommendations.push({
        title: '추천 #1',
        type: 'rare',
        typeText: '안나온 번호 위주',
        numbers: generateRareNumbers()
    });
    recommendations.push({
        title: '추천 #2',
        type: 'rare',
        typeText: '안나온 번호 위주',
        numbers: generateRareNumbers()
    });
    
    // 3-4: 자주 나온 번호 위주 (2개)
    recommendations.push({
        title: '추천 #3',
        type: 'frequent',
        typeText: '자주 나온 번호',
        numbers: generateFrequentNumbers()
    });
    recommendations.push({
        title: '추천 #4',
        type: 'frequent',
        typeText: '자주 나온 번호',
        numbers: generateFrequentNumbers()
    });
    
    // 5-7: 골고루 섞은 번호 (3개)
    recommendations.push({
        title: '추천 #5',
        type: 'mixed',
        typeText: '균형 조합',
        numbers: generateMixedNumbers()
    });
    recommendations.push({
        title: '추천 #6',
        type: 'mixed',
        typeText: '균형 조합',
        numbers: generateMixedNumbers()
    });
    recommendations.push({
        title: '추천 #7',
        type: 'mixed',
        typeText: '균형 조합',
        numbers: generateMixedNumbers()
    });
    
    // 8-10: 위치 분석 기반 (3개)
    recommendations.push({
        title: '추천 #8',
        type: 'position',
        typeText: '위치 분석',
        numbers: generatePositionBasedNumbers()
    });
    recommendations.push({
        title: '추천 #9',
        type: 'position',
        typeText: '위치 분석',
        numbers: generatePositionBasedNumbers()
    });
    recommendations.push({
        title: '추천 #10',
        type: 'position',
        typeText: '위치 분석',
        numbers: generatePositionBasedNumbers()
    });
    
    return recommendations;
}

// 추천 번호 렌더링
function renderRecommendations() {
    const recommendations = generateLottoNumbers();
    const recommendList = document.getElementById('recommendList');
    
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
    
    document.getElementById('generatedNumbers').style.display = 'block';
    
    // 마킹 분석도 함께 표시
    renderMarkingAnalysis();
    
    // 생성 버튼 위치로 스크롤
    document.getElementById('generatedNumbers').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
}

// 로또 목록 렌더링
function renderLottoList() {
    const lottoList = document.getElementById('lottoList');
    let data = loadLottoData();
    
    // 회차 높은 순으로 정렬
    data = sortDataByRound(data);
    
    lottoList.innerHTML = '';
    
    data.forEach((item, index) => {
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
function checkDuplicate(round, date) {
    const data = loadLottoData();
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

// 회차 삭제
async function deleteRound(round) {
    let data = loadLottoData();
    const item = data.find(d => d.round === round);
    
    if (!item) return;
    
    const message = `제 ${item.round}회 (${formatDateDisplay(item.date)}) 회차를 삭제하시겠습니까?`;
    const shouldDelete = await showDeleteModal(message);
    
    if (shouldDelete) {
        data = data.filter(d => d.round !== round);
        saveLottoData(data);
        renderLottoList();
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
        numbers: numbers.sort((a, b) => a - b), // 오름차순 정렬
        bonus: parseInt(bonusNumber)
    };
    
    // 기존 데이터 로드
    let data = loadLottoData();
    
    // 중복 회차 확인
    const duplicateIndex = checkDuplicate(newRound.round, newRound.date);
    
    if (duplicateIndex !== -1) {
        const existingRound = data[duplicateIndex];
        const
 message = `제 ${existingRound.round}회 (${formatDateDisplay(existingRound.date)}) 회차가 이미 존재합니다.\n데이터를 변경하시겠습니까?`;
        
        const shouldUpdate = await showModal(message);
        
        if (shouldUpdate) {
            // 기존 데이터 업데이트
            data[duplicateIndex] = newRound;
            // 회차 높은 순으로 정렬
            data = sortDataByRound(data);
            // 15개만 유지
            if (data.length > 15) {
                data = data.slice(0, 15);
            }
            saveLottoData(data);
            renderLottoList();
            clearInputFields();
            alert('회차 정보가 변경되었습니다.');
        }
        return;
    }
    
    // 새 회차 추가
    data.push(newRound);
    
    // 회차 높은 순으로 정렬
    data = sortDataByRound(data);
    
    // 15개만 유지 (회차가 낮은 것 삭제)
    if (data.length > 15) {
        data = data.slice(0, 15);
    }
    
    // 저장 및 렌더링
    saveLottoData(data);
    renderLottoList();
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
function resetToInitialData() {
    if (confirm('초기 데이터로 리셋하시겠습니까? 현재 데이터는 모두 삭제됩니다.')) {
        saveLottoData(initialData);
        renderLottoList();
        alert('초기 데이터로 리셋되었습니다.');
    }
}

// 데이터 내보내기 (JSON 파일로 다운로드)
function exportData() {
    const data = loadLottoData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lotto_data_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('데이터가 다운로드되었습니다!');
}

// 데이터 가져오기 (JSON 파일 업로드)
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // 데이터 유효성 검사
            if (!Array.isArray(importedData)) {
                alert('올바른 데이터 형식이 아닙니다.');
                return;
            }
            
            // 기존 데이터와 병합할지 물어보기
            const shouldMerge = confirm('기존 데이터와 병합하시겠습니까?\n\n예: 병합 (중복 제거)\n아니오: 기존 데이터 삭제 후 가져오기');
            
            let finalData;
            if (shouldMerge) {
                const existingData = loadLottoData();
                const mergedData = [...existingData, ...importedData];
                
                // 중복 제거 (회차 번호 기준)
                const uniqueData = mergedData.reduce((acc, current) => {
                    const exists = acc.find(item => item.round === current.round);
                    if (!exists) {
                        acc.push(current);
                    }
                    return acc;
                }, []);
                
                finalData = sortDataByRound(uniqueData);
            } else {
                finalData = sortDataByRound(importedData);
            }
            
            // 15개만 유지
            if (finalData.length > 15) {
                finalData = finalData.slice(0, 15);
            }
            
            saveLottoData(finalData);
            renderLottoList();
            alert(`데이터를 성공적으로 가져왔습니다! (${finalData.length}개 회차)`);
            
        } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다.');
            console.error(error);
        }
    };
    reader.readAsText(file);
    
    // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
    event.target.value = '';
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // 초기 렌더링
    renderLottoList();
    
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
    
    // 번호 생성 버튼
    document.getElementById('generateButton').addEventListener('click', function() {
        const data = loadLottoData();
        if (data.length === 0) {
            alert('분석할 데이터가 없습니다. 먼저 회차를 추가해주세요.');
            return;
        }
        renderRecommendations();
    });
    
    // 리셋 버튼
    document.getElementById('resetButton').addEventListener('click', resetToInitialData);
    
    // 내보내기 버튼
    document.getElementById('exportButton').addEventListener('click', exportData);
    
    // 가져오기 버튼
    document.getElementById('importButton').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
    
    // 파일 입력
    document.getElementById('fileInput').addEventListener('change', importData);
    
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

