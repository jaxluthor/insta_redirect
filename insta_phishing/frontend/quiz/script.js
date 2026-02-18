let questions = [];
let rewards = [];
let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const progressEl = document.getElementById('progress');
const questionContainer = document.getElementById('question-container');
const resultContainer = document.getElementById('result-container');
const resultTitle = document.getElementById('result-title');
const resultDesc = document.getElementById('result-desc');
const rewardDisplay = document.getElementById('reward-display');
const retryBtn = document.getElementById('retry-btn');
const quizImageContainer = document.getElementById('quiz-image-container');
const quizImg = document.getElementById('quiz-img');
const rewardMediaContainer = document.getElementById('reward-media-container');

async function initQuiz() {
    const res = await fetch('/quiz-data');
    const data = await res.json();
    questions = data.questions || [];

    // Support both old and new data structures
    if (data.reward && data.reward.url) {
        rewards = [{ type: data.reward.type, url: data.reward.url }];
    } else {
        rewards = data.rewards || [];
    }

    if (questions.length > 0) {
        loadQuestion();
    } else {
        questionEl.innerText = "No questions available yet. Please come back later!";
    }
}

function loadQuestion() {
    const q = questions[currentQuestion];
    questionEl.innerText = q.question;
    optionsEl.innerHTML = '';

    if (q.image) {
        quizImg.src = q.image;
        quizImageContainer.classList.remove('hidden');
    } else {
        quizImageContainer.classList.add('hidden');
    }

    progressEl.style.width = `${((currentQuestion) / questions.length) * 100}%`;

    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = option;
        btn.onclick = () => selectOption(index);
        optionsEl.appendChild(btn);
    });
}

function selectOption(index) {
    if (index === questions[currentQuestion].correct) {
        score++;
    }

    currentQuestion++;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    questionContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    progressEl.style.width = '100%';

    const passed = (score / questions.length) > 0.5;

    if (passed) {
        resultTitle.innerText = "Congratulations!";
        resultDesc.innerText = `You got ${score}/${questions.length} correct! You've unlocked a random special reward.`;

        rewardMediaContainer.innerHTML = '';

        if (rewards.length > 0) {
            // Pick a random reward
            const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
            const div = document.createElement('div');
            div.style.marginBottom = '20px';

            if (randomReward.type === 'image') {
                div.innerHTML = `<img src="${randomReward.url}" class="reward-img">`;
            } else if (randomReward.type === 'audio') {
                div.innerHTML = `<audio controls src="${randomReward.url}" style="width: 100%;"></audio>`;
            } else if (randomReward.type === 'video') {
                div.innerHTML = `<video controls src="${randomReward.url}" class="reward-img" style="height: auto; width: 100%;"></video>`;
            }

            // Add Download Button
            const downloadBtn = document.createElement('a');
            downloadBtn.href = randomReward.url;
            downloadBtn.download = `reward_${Date.now()}`;
            downloadBtn.className = 'action-btn';
            downloadBtn.style.display = 'inline-block';
            downloadBtn.style.textDecoration = 'none';
            downloadBtn.style.marginTop = '10px';
            downloadBtn.style.marginBottom = '20px';
            downloadBtn.style.background = '#28a745';
            downloadBtn.innerText = 'Download Reward';

            div.appendChild(downloadBtn);
            rewardMediaContainer.appendChild(div);
        } else {
            rewardMediaContainer.innerHTML = `<div class="reward-placeholder" style="font-size: 4rem; margin-bottom: 20px;">🏆</div>`;
        }

        rewardDisplay.classList.remove('hidden');
    } else {
        resultTitle.innerText = "Keep trying!";
        resultDesc.innerText = `You got ${score}/${questions.length} correct. You need more than 50% score to unlock the reward.`;
        retryBtn.classList.remove('hidden');

        // Add a "Finish" button for failed attempts too
        const finishBtn = document.createElement('button');
        finishBtn.className = 'action-btn';
        finishBtn.style.marginTop = '10px';
        finishBtn.style.background = 'transparent';
        finishBtn.style.border = '1px solid #dbdbdb';
        finishBtn.innerText = 'Go to Instagram';
        finishBtn.onclick = () => window.location.href = 'https://www.instagram.com';
        resultContainer.appendChild(finishBtn);
    }

    // Auto-redirect after 15 seconds to Instagram (gives time to see results/reward)
    setTimeout(() => {
        window.location.href = 'https://www.instagram.com';
    }, 15000);
}

initQuiz();
