// 로또 데이터 저장 키
const STORAGE_KEY = 'lottoData';

// 초기 데이터 (2026년 1월 3일 기준 최근 15회차)
const initialData = [
    { round: 1150, date: '2026-01-03', numbers: [7, 12, 19, 23, 31, 42], bonus: 15 },
    { round: 1149, date: '2025-12-27', numbers: [3, 8, 14, 22, 35, 41], bonus: 28 },
    { round: 1148, date: '2025-12-20', numbers: [5, 11, 18, 27, 33, 44], bonus: 9 },
    { round: 1147, date: '2025-12-13', numbers: [2, 13, 21, 29, 36, 43], bonus: 17 },
    { round: 1146, date: '2025-12-06', numbers: [6, 10, 16, 25, 34, 40], bonus: 12 },
    { round: 1145, date: '2025-11-29', numbers: [4, 9, 15, 24, 32, 39], bonus: 20 },
    { round: 1144, date: '2025-11-22', numbers: [1, 14, 19, 26, 37, 45], bonus: 8 },
    { round: 1143, date: '2025-11-15', numbers: [7, 11, 17, 28, 35, 42], bonus: 13 },
    { round: 1142, date: '2025-11-08', numbers: [3, 12, 20, 30, 38, 44], bonus: 5 },
    { round: 1141, date: '2025-11-01', numbers: [2, 8, 16, 23, 31, 41], bonus: 18 },
    { round: 1140, date: '2025-10-25', numbers: [6, 13, 21, 27, 36, 43], bonus: 10 },
    { round: 1139, date: '2025-10-18', numbers: [4, 10, 18, 25, 33, 40], bonus: 22 },
    { round: 1138, date: '2025-10-11', numbers: [1, 9, 15, 24, 32, 39], bonus: 14 },
    { round: 1137, date: '2025-10-04', numbers: [5, 11, 19, 28, 34, 42], bonus: 7 },
    { round: 1136, date: '2025-09-27', numbers: [3, 12, 17, 26, 35, 45], bonus: 16 }
];

// 로또 데이터 로드
function loadLottoData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    } else {
        // 초기 데이터 저장
        saveLottoData(initialData);
        return initialData;
    }
}

// 로또 데이터 저장
function saveLottoData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 번호에 따른 색상 클래스 반환
function getColorClass(number) {
    if (number <= 10) return 'color1';
    if (number <= 20) return 'color2';
    if (number <= 30) return 'color3';
    if (number <= 40) return 'color4';
    return 'color5';
}

// 로또 목록 렌더링
function renderLottoList() {
    const lottoList = document.getElementById('lottoList');
    const data = loadLottoData();
    
    lottoList.innerHTML = '';
    
    data.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'lotto-item';
        
        const numbersHTML = item.numbers.map(num => 
            `<div class="number-ball ${getColorClass(num)}">${num}</div>`
        ).join('');
        
        itemDiv.innerHTML = `
            <div class="lotto-header">
                <span class="round-info">제 ${item.round}회</span>
                <span class="date-info">${item.date}</span>
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

// 새 회차 추가
function addNewRound() {
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
    
    // 맨 앞에 새 회차 추가
    data.unshift(newRound);
    
    // 15개만 유지 (가장 오래된 것 삭제)
    if (data.length > 15) {
        data = data.slice(0, 15);
    }
    
    // 저장 및 렌더링
    saveLottoData(data);
    renderLottoList();
    
    // 입력 필드 초기화
    document.getElementById('roundNumber').value = '';
    document.getElementById('drawDate').value = '';
    numberInputs.forEach(input => input.value = '');
    document.getElementById('bonusNumber').value = '';
    
    alert('새 회차가 추가되었습니다!');
}

// 초기 데이터로 리셋
function resetToInitialData() {
    if (confirm('초기 데이터로 리셋하시겠습니까? 현재 데이터는 모두 삭제됩니다.')) {
        saveLottoData(initialData);
        renderLottoList();
        alert('초기 데이터로 리셋되었습니다.');
    }
}

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    // 초기 렌더링
    renderLottoList();
    
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
    
    // 숫자 입력 제한 (1-45)
    const allNumberInputs = [...numberInputs, document.getElementById('bonusNumber')];
    allNumberInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value > 45) this.value = 45;
            if (this.value < 0) this.value = '';
        });
    });
});