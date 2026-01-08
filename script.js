// 전역 변수
let drawData = [];
let analysis = {
    frequency: {},
    positions: Array(45).fill(0),
    frequentNumbers: [],
    rareNumbers: []
};

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    createDrawInputs();
    document.getElementById('analyzeBtn').addEventListener('click', analyzeAndGenerate);
});

// 20개 회차 입력 필드 생성
function createDrawInputs() {
    const container = document.getElementById('drawInputs');
    for (let i = 1; i <= 20; i++) {
        const drawDiv = document.createElement('div');
        drawDiv.className = 'draw-input';
        drawDiv.innerHTML = `
            <label>${i}회차 전</label>
            <input type="text" id="draw${i}" placeholder="예: 1,5,12,23,34,42,7" />
        `;
        container.appendChild(drawDiv);
    }
}

// 번호 분석 및 생성
function analyzeAndGenerate() {
    // 데이터 수집
    drawData = [];
    for (let i = 1; i <= 20; i++) {
        const input = document.getElementById(`draw${i}`).value.trim();
        if (input) {
            const numbers = input.split(',').map(n => parseInt(n.trim())).filter(n => n >= 1 && n <= 45);
            if (numbers.length >= 6) {
                drawData.push(numbers.slice(0, 7)); // 보너스 포함 최대 7개
            }
        }
    }

    if (drawData.length < 5) {
        alert('최소 5개 회차 이상의 데이터를 입력해주세요.');
        return;
    }

    // 분석 수행
    performAnalysis();
    
    // 결과 표시
    displayAnalysis();
    displayGeneratedNumbers();
    
    // 섹션 표시
    document.getElementById('analysisSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'block';
    
    // 결과로 스크롤
    document.getElementById('analysisSection').scrollIntoView({ behavior: 'smooth' });
}

// 번호 분석
function performAnalysis() {
    // 초기화
    analysis.frequency = {};
    analysis.positions = Array(45).fill(0);
    
    // 1-45 초기화
    for (let i = 1; i <= 45; i++) {
        analysis.frequency[i] = 0;
    }
    
    // 빈도 및 위치 계산
    drawData.forEach(draw => {
        draw.forEach(num => {
            analysis.frequency[num]++;
            analysis.positions[num - 1]++;
        });
    });
    
    // 자주 나온 번호 정렬
    analysis.frequentNumbers = Object.entries(analysis.frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([num, count]) => ({ num: parseInt(num), count }));
    
    // 안 나온 번호
    analysis.rareNumbers = Object.entries(analysis.frequency)
        .filter(([num, count]) => count === 0)
        .map(([num]) => parseInt(num));
    
    // 적게 나온 번호도 포함 (안 나온 번호가 부족할 경우)
    if (analysis.rareNumbers.length < 10) {
        const lessFrequent = Object.entries(analysis.frequency)
            .filter(([num, count]) => count > 0 && count <= 2)
            .sort((a, b) => a[1] - b[1])
            .map(([num]) => parseInt(num));
        analysis.rareNumbers = [...analysis.rareNumbers, ...lessFrequent].slice(0, 15);
    }
}

// 분석 결과 표시
function displayAnalysis() {
    // 자주 나온 번호
    const frequentDiv = document.getElementById('frequentNumbers');
    frequentDiv.innerHTML = '<div class="number-list">' +
        analysis.frequentNumbers.map(item => 
            `<div class="number-badge frequent">
                ${item.num}
                <span class="count">${item.count}회</span>
            </div>`
        ).join('') + '</div>';
    
    // 안 나온 번호
    const rareDiv = document.getElementById('rareNumbers');
    rareDiv.innerHTML = '<div class="number-list">' +
        analysis.rareNumbers.slice(0, 15).map(num => 
            `<div class="number-badge rare">${num}</div>`
        ).join('') + '</div>';
    
    // 히트맵
    displayHeatmap();
}

// 히트맵 표시
function displayHeatmap() {
    const heatmapDiv = document.getElementById('heatmap');
    heatmapDiv.innerHTML = '';
    
    const maxCount = Math.max(...analysis.positions);
    
    for (let i = 1; i <= 45; i++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.textContent = i;
        
        const count = analysis.positions[i - 1];
        const intensity = maxCount > 0 ? count / maxCount : 0;
        
        // 색상 강도 계산
        const hue = 120 - (intensity * 120); // 빨강(0)에서 초록(120)
        const saturation = 70 + (intensity * 30);
        const lightness = 85 - (intensity * 35);
        
        cell.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        cell.style.color = intensity > 0.5 ? 'white' : '#333';
        cell.title = `${i}번: ${count}회 출현`;
        
        heatmapDiv.appendChild(cell);
    }
}

// 로또 번호 생성
function displayGeneratedNumbers() {
    const container = document.getElementById('generatedNumbers');
    container.innerHTML = '';
    
    const sets = [
        // 1-2: 안 나온 번호 위주
        { type: '안 나온 번호 위주 #1', generator: generateRareNumbers },
        { type: '안 나온 번호 위주 #2', generator: generateRareNumbers },
        
        // 3-4: 자주 나온 번호 위주
        { type: '자주 나온 번호 위주 #1', generator: generateFrequentNumbers },
        { type: '자주 나온 번호 위주 #2', generator: generateFrequentNumbers },
        
        // 5-7: 혼합
        { type: '혼합 번호 #1', generator: generateMixedNumbers },
        { type: '혼합 번호 #2', generator: generateMixedNumbers },
        { type: '혼합 번호 #3', generator: generateMixedNumbers },
        
        // 8-10: 마킹 위치 분석
        { type: '마킹 위치 분석 #1', generator: generatePositionBased },
        { type: '마킹 위치 분석 #2', generator: generatePositionBased },
        { type: '마킹 위치 분석 #3', generator: generatePositionBased }
    ];
    
    sets.forEach((set, index) => {
        const numbers = set.generator();
        const setDiv = createLottoSetDisplay(numbers, set.type, index + 1);
        container.appendChild(setDiv);
    });
}

// 안 나온 번호 위주 생성
function generateRareNumbers() {
    const numbers = [];
    const available = [...analysis.rareNumbers];
    
    // 안 나온 번호에서 4개
    for (let i = 0; i < 4 && available.length > 0; i++) {
        const idx = Math.floor(Math.random() * available.length);
        numbers.push(available.splice(idx, 1)[0]);
    }
    
    // 적게 나온 번호에서 2개
    const lessFrequent = Object.entries(analysis.frequency)
        .filter(([num, count]) => count > 0 && count <= 3 && !numbers.includes(parseInt(num)))
        .map(([num]) => parseInt(num));
    
    while (numbers.length < 6 && lessFrequent.length > 0) {
        const idx = Math.floor(Math.random() * lessFrequent.length);
        numbers.push(lessFrequent.splice(idx, 1)[0]);
    }
    
    // 부족하면 랜덤으로 채우기
    fillRemainingNumbers(numbers);
    
    return numbers.sort((a, b) => a - b);
}

// 자주 나온 번호 위주 생성
function generateFrequentNumbers() {
    const numbers = [];
    const frequent = analysis.frequentNumbers.map(item => item.num);
    
    // 자주 나온 번호에서 4개
    for (let i = 0; i < 4 && i < frequent.length; i++) {
        const idx = Math.floor(Math.random() * frequent.length);
        if (!numbers.includes(frequent[idx])) {
            numbers.push(frequent[idx]);
        }
    }
    
    // 중간 빈도 번호에서 2개
    const midFrequent = Object.entries(analysis.frequency)
        .filter(([num, count]) => count > 2 && count < analysis.frequentNumbers[0].count && !numbers.includes(parseInt(num)))
        .map(([num]) => parseInt(num));
    
    while (numbers.length < 6 && midFrequent.length > 0) {
        const idx = Math.floor(Math.random() * midFrequent.length);
        numbers.push(midFrequent.splice(idx, 1)[0]);
    }
    
    fillRemainingNumbers(numbers);
    
    return numbers.sort((a, b) => a - b);
}

// 혼합 번호 생성
function generateMixedNumbers() {
    const numbers = [];
    
    // 자주 나온 번호 2개
    const frequent = analysis.frequentNumbers.map(item => item.num);
    for (let i = 0; i < 2 && frequent.length > 0; i++) {
        const idx = Math.floor(Math.random() * Math.min(frequent.length, 10));
        if (!numbers.includes(frequent[idx])) {
            numbers.push(frequent[idx]);
        }
    }
    
    // 안 나온 번호 2개
    const rare = [...analysis.rareNumbers];
    for (let i = 0; i < 2 && rare.length > 0; i++) {
        const idx = Math.floor(Math.random() * rare.length);
        const num = rare.splice(idx, 1)[0];
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    
    // 중간 빈도 2개
    const mid = Object.entries(analysis.frequency)
        .filter(([num, count]) => count > 1 && count < 10 && !numbers.includes(parseInt(num)))
        .map(([num]) => parseInt(num));
    
    while (numbers.length < 6 && mid.length > 0) {
        const idx = Math.floor(Math.random() * mid.length);
        numbers.push(mid.splice(idx, 1)[0]);
    }
    
    fillRemainingNumbers(numbers);
    
    return numbers.sort((a, b) => a - b);
}

// 마킹 위치 기반 생성
function generatePositionBased() {
    const numbers = [];
    
    // 각 행에서 골고루 선택
    const rows = [
        [1, 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19, 20, 21],
        [22, 23, 24, 25, 26, 27, 28],
        [29, 30, 31, 32, 33, 34, 35],
        [36, 37, 38, 39, 40, 41, 42],
        [43, 44, 45]
    ];
    
    // 각 행에서 가장 많이 나온 번호 찾기
    const rowBest = rows.map(row => {
        return row
            .map(num => ({ num, count: analysis.positions[num - 1] }))
            .sort((a, b) => b.count - a.count);
    });
    
    // 상위 6개 행에서 1개씩 선택
    for (let i = 0; i < 6 && i < rowBest.length; i++) {
        const candidates = rowBest[i].filter(item => !numbers.includes(item.num));
        if (candidates.length > 0) {
            // 상위 3개 중 랜덤 선택
            const idx = Math.floor(Math.random() * Math.min(3, candidates.length));
            numbers.push(candidates[idx].num);
        }
    }
    
    fillRemainingNumbers(numbers);
    
    return numbers.sort((a, b) => a - b);
}

// 부족한 번호 채우기
function fillRemainingNumbers(numbers) {
    const attempts = 1000;
    let count = 0;
    
    while (numbers.length < 6 && count < attempts) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
        count++;
    }
}

// 로또 세트 표시
function createLottoSetDisplay(numbers, type, index) {
    const setDiv = document.createElement('div');
    setDiv.className = 'lotto-set';
    
    const header = document.createElement('div');
    header.className = 'set-header';
    header.innerHTML = `
        <span class="set-title">세트 ${index}</span>
        <span class="set-type">${type}</span>
    `;
    
    const numbersDisplay = document.createElement('div');
    numbersDisplay.className = 'numbers-display';
    
    numbers.forEach(num => {
        const ball = document.createElement('div');
        ball.className = `lotto-ball color-${getColorClass(num)}`;
        ball.textContent = num;
        numbersDisplay.appendChild(ball);
    });
    
    // 마킹 용지 시각화
    const markingDiv = document.createElement('div');
    markingDiv.innerHTML = '<h4 style="margin: 15px 0 10px 0; color: #666;">마킹 용지</h4>';
    const markingGrid = createMarkingGrid(numbers);
    markingDiv.appendChild(markingGrid);
    
    setDiv.appendChild(header);
    setDiv.appendChild(numbersDisplay);
    setDiv.appendChild(markingDiv);
    
    return setDiv;
}

// 마킹 용지 그리드 생성
function createMarkingGrid(selectedNumbers) {
    const grid = document.createElement('div');
    grid.className = 'marking-visual';
    
    for (let i = 1; i <= 45; i++) {
        const cell = document.createElement('div');
        cell.className = 'marking-cell';
        
        if (selectedNumbers.includes(i)) {
            cell.classList.add('marked');
            cell.textContent = i;
        } else {
            cell.textContent = i;
            cell.style.color = '#ccc';
        }
        
        grid.appendChild(cell);
    }
    
    return grid;
}

// 번호별 색상 클래스
function getColorClass(num) {
    if (num <= 10) return 1; // 노란색
    if (num <= 20) return 2; // 파란색
    if (num <= 30) return 3; // 빨간색
    if (num <= 40) return 4; // 회색
    return 5; // 초록색
}
