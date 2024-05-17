let questions = [];
let currentQuestionIndex = 0;
let startTime;
let timer;
let userResponses = [];
let timeLimit = 600;  // Default to easy (10 minutes)

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

async function startQuiz() {
    const email = document.getElementById("email").value;
    const category = document.getElementById("category").value;
    const difficulty = document.getElementById("difficulty").value;

    // Validate email
    if (!validateEmail(email)) {
        document.getElementById("emailError").style.display = "block";
        return;
    } else {
        document.getElementById("emailError").style.display = "none";
    }

    // Load the questions from the JSON file
    try {
        const response = await fetch('questions.json');
        const allQuestions = await response.json();

        console.log('All Questions Loaded:', allQuestions);  // Debugging

        // Filter questions based on selected category and difficulty
        const filteredQuestions = allQuestions.filter(question => 
            question.category === category && question.difficulty === difficulty
        );

        console.log('Filtered Questions:', filteredQuestions);  // Debugging

        // Shuffle and select 5 questions
        questions = shuffleArray(filteredQuestions).slice(0, 5);

        console.log('Selected Questions:', questions);  // Debugging

        // Setup the timer based on difficulty level
        if (difficulty === "medium") timeLimit = 300;  // 5 minutes
        if (difficulty === "hard") timeLimit = 120;  // 2 minutes
        startTime = new Date().getTime();
        timer = setInterval(updateTimer, 1000);

        document.getElementById("categorySelection").style.display = "none";
        document.getElementById("quizPage").style.display = "block";
        showQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateTimer() {
    const now = new Date().getTime();
    const distance = startTime + timeLimit * 1000 - now;
    const minutes = Math.floor(distance / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    document.getElementById("timer").innerHTML = `Time Left: ${minutes}:${seconds}`;
    if (distance < 0) {
        clearInterval(timer);
        endQuiz();
    }
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    console.log('Showing Question:', question);  

    document.getElementById("questionContainer").innerHTML = `
        <h3>${question.question}</h3>
        ${question.options.map((option, index) => `
            <input type="radio" name="option" id="option${index}" value="${option}" 
            ${userResponses[currentQuestionIndex] === option ? 'checked' : ''}>
            <label for="option${index}">${option}</label><br>
        `).join('')}
    `;
    document.getElementById("prevBtn").style.display = currentQuestionIndex > 0 ? "block" : "none";
    document.getElementById("nextBtn").innerHTML = currentQuestionIndex < questions.length - 1 ? "Next" : "Submit";
}

function nextQuestion() {
    saveResponse();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        endQuiz();
    }
}

function prevQuestion() {
    saveResponse();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function saveResponse() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        userResponses[currentQuestionIndex] = selectedOption.value;
    } else {
        userResponses[currentQuestionIndex] = null;
    }
}

function endQuiz() {
    saveResponse();
    clearInterval(timer);
    document.getElementById("quizPage").style.display = "none";
    document.getElementById("resultPage").style.display = "block";

    let score = 0;
    const endTime = new Date().getTime();
    const timeTaken = Math.floor((endTime - startTime) / 1000);
    questions.forEach((question, index) => {
        if (userResponses[index] === question.correct_answer) {
            score++;
        }
        document.getElementById("userResponses").innerHTML += `
            <p>${question.question}<br>
            Your answer: ${userResponses[index]} ${userResponses[index] === question.correct_answer ? '<span style="color:green">Correct</span>' : '<span style="color:red">Wrong</span>'}<br>
            Correct answer: ${question.correct_answer}</p>
        `;
    });

    document.getElementById("score").innerHTML = `Score Obtained: ${score}/${questions.length}`;
    document.getElementById("timeTaken").innerHTML = `Total Time Taken: ${Math.floor(timeTaken / 60)}:${timeTaken % 60}`;
}
