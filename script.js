// ==========================================
// ANTI-SLEEP SMART
// AI CAMERA + DROWSINESS + YAWN + RANDOM QUIZ
// + STOP ALARM SYSTEM
// ==========================================


// ==========================================
// HTML ELEMENTS
// ==========================================

const video = document.getElementById("video");
const cameraStatus = document.getElementById("cameraStatus");
const eyeResult = document.getElementById("eyeResult");
const yawnResult = document.getElementById("yawnResult");
const drowsyResult = document.getElementById("drowsyResult");
const result = document.getElementById("result");

const alertBox = document.getElementById("alertBox");
const quizBox = document.getElementById("quizBox");
const questionText = document.getElementById("questionText");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");
const continueButton = document.getElementById("continueButton");


// ==========================================
// CAMERA VARIABLES
// ==========================================

let camera = null;
let mediaStream = null;

let eyesClosedSince = null;

let alertShown = false;

let quizActive = false;
let quizAnswered = false;


// ==========================================
// YAWN VARIABLES
// ==========================================

let mouthOpenSince = null;
let yawnDetected = false;


// ==========================================
// ALARM VARIABLES
// ==========================================

let audioContext = null;
let alarmInterval = null;
let alarmActive = false;

// IMPORTANT:
// Once the user presses STOP ALARM,
// the alarm will NOT restart during
// the current drowsiness episode.
let alarmStoppedByUser = false;

// One browser notification per
// drowsiness episode.
let activeNotification = null;


// ==========================================
// DROWSINESS EPISODE
// ==========================================

// This prevents the alarm from repeatedly
// starting and stopping because of tiny
// detection changes.
let drowsinessEpisode = false;


// ==========================================
// CREATE STOP ALARM BUTTON
// ==========================================

function createStopAlarmButton() {

    if (!alertBox) {
        return;
    }

    let stopButton =
        document.getElementById("stopAlarmButton");

    if (stopButton) {
        return;
    }

    stopButton =
        document.createElement("button");

    stopButton.id =
        "stopAlarmButton";

    stopButton.type =
        "button";

    stopButton.textContent =
        "🛑 STOP ALARM";

    stopButton.style.display =
        "block";

    stopButton.style.margin =
        "15px auto 0";

    stopButton.style.padding =
        "12px 24px";

    stopButton.style.fontSize =
        "16px";

    stopButton.style.fontWeight =
        "bold";

    stopButton.style.cursor =
        "pointer";

    stopButton.style.border =
        "none";

    stopButton.style.borderRadius =
        "8px";

    stopButton.style.background =
        "#111";

    stopButton.style.color =
        "#fff";

    stopButton.onclick =
        function () {

            stopAlarm(true);

        };

    alertBox.appendChild(stopButton);
}


// ==========================================
// CENTER ALERT AND QUIZ
// ==========================================

function centerAlertAndQuiz() {

    if (alertBox) {

        alertBox.style.position = "fixed";

        alertBox.style.top = "50%";

        alertBox.style.left = "50%";

        alertBox.style.transform =
            "translate(-50%, -50%)";

        alertBox.style.zIndex = "9999";

        alertBox.style.width =
            "min(90vw, 600px)";

        alertBox.style.maxHeight =
            "90vh";

        alertBox.style.overflowY =
            "auto";

        alertBox.style.boxSizing =
            "border-box";
    }


    if (quizBox) {

        quizBox.style.position = "fixed";

        quizBox.style.top = "50%";

        quizBox.style.left = "50%";

        quizBox.style.transform =
            "translate(-50%, -50%)";

        quizBox.style.zIndex = "10000";

        quizBox.style.width =
            "min(90vw, 600px)";

        quizBox.style.maxHeight =
            "90vh";

        quizBox.style.overflowY =
            "auto";

        quizBox.style.boxSizing =
            "border-box";
    }
}


// ==========================================
// INITIAL SETUP
// ==========================================

centerAlertAndQuiz();

createStopAlarmButton();


// ==========================================
// 10 QUIZ QUESTIONS
// ==========================================

const quizQuestions = [

    {
        question: "What is H₂O?",
        options: [
            "A. Oxygen",
            "B. Water",
            "C. Carbon Dioxide",
            "D. Hydrogen"
        ],
        answer: 1
    },

    {
        question: "What is 5 + 7?",
        options: [
            "A. 10",
            "B. 11",
            "C. 12",
            "D. 13"
        ],
        answer: 2
    },

    {
        question:
            "Which planet is known as the Red Planet?",
        options: [
            "A. Earth",
            "B. Mars",
            "C. Venus",
            "D. Jupiter"
        ],
        answer: 1
    },

    {
        question: "What does CPU stand for?",
        options: [
            "A. Central Processing Unit",
            "B. Computer Personal Unit",
            "C. Central Program Utility",
            "D. Control Processing User"
        ],
        answer: 0
    },

    {
        question:
            "Which language is mainly used to create web page structure?",
        options: [
            "A. HTML",
            "B. Python",
            "C. SQL",
            "D. Java"
        ],
        answer: 0
    },

    {
        question:
            "How many days are there in a week?",
        options: [
            "A. 5",
            "B. 6",
            "C. 7",
            "D. 8"
        ],
        answer: 2
    },

    {
        question:
            "Which one is a programming language?",
        options: [
            "A. Python",
            "B. Chrome",
            "C. Windows",
            "D. Google"
        ],
        answer: 0
    },

    {
        question:
            "What is the largest planet in our Solar System?",
        options: [
            "A. Earth",
            "B. Mars",
            "C. Jupiter",
            "D. Mercury"
        ],
        answer: 2
    },

    {
        question:
            "How many sides does a triangle have?",
        options: [
            "A. 2",
            "B. 3",
            "C. 4",
            "D. 5"
        ],
        answer: 1
    },

    {
        question:
            "Which device is used to type text into a computer?",
        options: [
            "A. Monitor",
            "B. Speaker",
            "C. Keyboard",
            "D. Printer"
        ],
        answer: 2
    }

];


// ==========================================
// START CAMERA
// ==========================================

async function startCamera() {

    try {

        // Reset session
        alarmStoppedByUser = false;
        alarmActive = false;
        alertShown = false;
        drowsinessEpisode = false;

        eyesClosedSince = null;
        mouthOpenSince = null;
        yawnDetected = false;

        quizActive = false;
        quizAnswered = false;

        if (alarmInterval) {

            clearInterval(alarmInterval);

            alarmInterval = null;
        }


        if (activeNotification) {

            try {
                activeNotification.close();
            } catch (error) {}

            activeNotification = null;
        }


        // ==================================
        // GET CAMERA
        // ==================================

        mediaStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });


        video.srcObject =
            mediaStream;


        cameraStatus.textContent =
            "Camera Active";


        result.textContent =
            "AI monitoring has started.";


        eyeResult.textContent =
            "Detecting...";


        yawnResult.textContent =
            "Detecting...";


        drowsyResult.textContent =
            "ALERT";


        alertBox.style.display =
            "none";


        quizBox.style.display =
            "none";


        centerAlertAndQuiz();


        // ==================================
        // NOTIFICATION PERMISSION
        // ==================================

        if (
            "Notification" in window &&
            Notification.permission === "default"
        ) {

            try {

                await Notification.requestPermission();

            }

            catch (error) {

                console.log(
                    "Notification permission unavailable."
                );

            }

        }


        // ==================================
        // PREPARE AUDIO
        // ==================================

        try {

            if (!audioContext) {

                const AudioContext =
                    window.AudioContext ||
                    window.webkitAudioContext;

                if (AudioContext) {

                    audioContext =
                        new AudioContext();

                }

            }

            if (
                audioContext &&
                audioContext.state === "suspended"
            ) {

                await audioContext.resume();

            }

        }

        catch (error) {

            console.log(
                "Audio could not be prepared.",
                error
            );

        }


        // ==================================
        // START FACE DETECTION
        // ==================================

        startFaceDetection();

    }

    catch (error) {

        console.error(error);

        cameraStatus.textContent =
            "Camera Access Denied";

        result.textContent =
            "Please allow camera permission and try again.";

    }

}


// ==========================================
// STOP CAMERA
// ==========================================

function stopCamera() {

    // Stop everything first
    stopAlarm(false);


    // Stop camera stream
    if (mediaStream) {

        mediaStream
            .getTracks()
            .forEach(function (track) {

                track.stop();

            });

        mediaStream = null;
    }


    // Stop MediaPipe camera
    if (camera) {

        camera.stop();

        camera = null;
    }


    // Remove video
    video.srcObject = null;


    // Reset display
    cameraStatus.textContent =
        "Camera Stopped";

    eyeResult.textContent =
        "Stopped";

    yawnResult.textContent =
        "Stopped";

    drowsyResult.textContent =
        "Stopped";

    result.textContent =
        "Camera monitoring has been stopped.";


    alertBox.style.display =
        "none";

    quizBox.style.display =
        "none";


    // Reset detection state
    eyesClosedSince = null;

    mouthOpenSince = null;

    yawnDetected = false;

    alertShown = false;

    quizActive = false;

    quizAnswered = false;

    alarmStoppedByUser = false;

    drowsinessEpisode = false;
}


// ==========================================
// FACE DETECTION
// ==========================================

function startFaceDetection() {

    const faceMesh =
        new FaceMesh({

            locateFile:
                function (file) {

                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;

                }

        });


    faceMesh.setOptions({

        maxNumFaces: 1,

        refineLandmarks: true,

        minDetectionConfidence: 0.5,

        minTrackingConfidence: 0.5

    });


    // ======================================
    // FACE RESULTS
    // ======================================

    faceMesh.onResults(
        function (results) {

            // ==================================
            // NO FACE
            // ==================================

            if (
                !results.multiFaceLandmarks ||
                results.multiFaceLandmarks.length === 0
            ) {

                result.textContent =
                    "Face not detected. Please look at the camera.";

                eyeResult.textContent =
                    "Waiting...";

                yawnResult.textContent =
                    "Waiting...";

                return;
            }


            // ==================================
            // GET LANDMARKS
            // ==================================

            const landmarks =
                results.multiFaceLandmarks[0];


            // ==================================
            // EYE DETECTION
            // ==================================

            const leftEye =
                eyeAspectRatio(
                    landmarks,
                    33,
                    133,
                    159,
                    145
                );


            const rightEye =
                eyeAspectRatio(
                    landmarks,
                    362,
                    263,
                    386,
                    374
                );


            const averageEye =
                (leftEye + rightEye) / 2;


            // ==================================
            // MOUTH DETECTION
            // ==================================

            const mouthOpen =
                mouthRatio(landmarks);


            // ==================================
            // EYE STATUS
            // ==================================

            if (averageEye < 0.20) {

                eyeResult.textContent =
                    "Closed";


                if (!eyesClosedSince) {

                    eyesClosedSince =
                        Date.now();

                }

            }

            else {

                eyeResult.textContent =
                    "Open";

                eyesClosedSince =
                    null;

            }


            // ==================================
            // YAWN STATUS
            // ==================================

            if (mouthOpen > 0.55) {

                if (!mouthOpenSince) {

                    mouthOpenSince =
                        Date.now();

                }


                const mouthOpenTime =
                    Date.now() -
                    mouthOpenSince;


                if (mouthOpenTime > 1500) {

                    yawnDetected =
                        true;

                    yawnResult.textContent =
                        "Possible Yawn";

                }

                else {

                    yawnDetected =
                        false;

                    yawnResult.textContent =
                        "Normal";

                }

            }

            else {

                mouthOpenSince =
                    null;

                yawnDetected =
                    false;

                yawnResult.textContent =
                    "Normal";

            }


            // ==================================
            // DROWSINESS CHECK
            // ==================================

            let drowsy =
                false;


            // Prolonged eye closure
            if (eyesClosedSince) {

                const closedTime =
                    Date.now() -
                    eyesClosedSince;


                if (closedTime > 2000) {

                    drowsy =
                        true;

                }

            }


            // Prolonged yawn
            if (yawnDetected) {

                drowsy =
                    true;

            }


            // ==================================
            // DROWSY
            // ==================================

            if (drowsy) {

                drowsyResult.textContent =
                    "DROWSY";

                result.textContent =
                    "🚨 Possible drowsiness detected.";


                // Start a new episode only once
                if (!drowsinessEpisode) {

                    drowsinessEpisode =
                        true;

                    // Allow alarm for this new episode
                    alarmStoppedByUser =
                        false;

                    showDrowsinessAlert();

                }

                else {

                    // Keep alert visible
                    showDrowsinessAlert();

                }


                // ==================================
                // QUIZ AFTER 3 SECONDS OF EYE CLOSURE
                // ==================================

                if (
                    eyesClosedSince &&
                    Date.now() -
                        eyesClosedSince >
                        3000 &&
                    !quizActive
                ) {

                    showQuiz();

                }

            }

            // ==================================
            // ALERT / NOT DROWSY
            // ==================================

            else {

                drowsyResult.textContent =
                    "ALERT";


                if (!quizActive) {

                    result.textContent =
                        "✅ You appear alert.";

                    hideDrowsinessAlert();

                }

            }

        }
    );


    // ==================================
    // CAMERA PROCESSING
    // ==================================

    camera =
        new Camera(video, {

            onFrame:
                async function () {

                    await faceMesh.send({
                        image: video
                    });

                },

            width: 640,

            height: 480

        });


    camera.start();
}


// ==========================================
// EYE ASPECT RATIO
// ==========================================

function eyeAspectRatio(
    landmarks,
    left,
    right,
    top,
    bottom
) {

    const horizontal =
        distance(
            landmarks[left],
            landmarks[right]
        );


    const vertical =
        distance(
            landmarks[top],
            landmarks[bottom]
        );


    if (horizontal === 0) {

        return 1;

    }


    return vertical /
        horizontal;
}


// ==========================================
// MOUTH RATIO
// ==========================================

function mouthRatio(landmarks) {

    const vertical =
        distance(
            landmarks[13],
            landmarks[14]
        );


    const horizontal =
        distance(
            landmarks[78],
            landmarks[308]
        );


    if (horizontal === 0) {

        return 0;

    }


    return vertical /
        horizontal;
}


// ==========================================
// DISTANCE
// ==========================================

function distance(point1, point2) {

    const x =
        point1.x -
        point2.x;


    const y =
        point1.y -
        point2.y;


    return Math.sqrt(
        x * x +
        y * y
    );
}


// ==========================================
// START ALARM
// ==========================================

function startAlarm() {

    // Already running
    if (alarmActive) {
        return;
    }


    // User pressed STOP
    if (alarmStoppedByUser) {
        return;
    }


    alarmActive =
        true;


    // Play immediately
    playAlarm();


    // Repeat every 3 seconds
    alarmInterval =
        setInterval(
            function () {

                if (
                    alarmActive &&
                    !alarmStoppedByUser
                ) {

                    playAlarm();

                }

            },
            3000
        );
}


// ==========================================
// PLAY ALARM SOUND
// ==========================================

function playAlarm() {

    if (
        !audioContext ||
        alarmStoppedByUser
    ) {

        return;
    }


    try {

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.type =
            "square";


        // Alarm tone
        oscillator.frequency.setValueAtTime(
            880,
            audioContext.currentTime
        );


        oscillator.frequency.setValueAtTime(
            660,
            audioContext.currentTime + 0.25
        );


        oscillator.frequency.setValueAtTime(
            880,
            audioContext.currentTime + 0.50
        );


        // Volume
        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.30,
            audioContext.currentTime + 0.03
        );


        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.70
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + 0.75
        );

    }

    catch (error) {

        console.log(
            "Alarm sound error:",
            error
        );

    }
}


// ==========================================
// BROWSER NOTIFICATION
// ==========================================

function sendDrowsinessNotification() {

    if (
        !("Notification" in window)
    ) {

        return;
    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;
    }


    // Only one notification
    if (activeNotification) {

        return;

    }


    try {

        activeNotification =
            new Notification(
                "🚨 Drowsiness Alert",
                {
                    body:
                        "Possible drowsiness detected. Please take a break.",

                    requireInteraction:
                        true
                }
            );


        activeNotification.onclick =
            function () {

                try {

                    window.focus();

                }

                catch (error) {}

            };


        activeNotification.onclose =
            function () {

                activeNotification =
                    null;

            };

    }

    catch (error) {

        console.log(
            "Notification error:",
            error
        );

        activeNotification =
            null;

    }
}


// ==========================================
// STOP ALARM
// ==========================================

function stopAlarm(
    stoppedByUser = true
) {

    // ==================================
    // USER STOPPED ALARM
    // ==================================

    if (stoppedByUser) {

        alarmStoppedByUser =
            true;

    }


    // ==================================
    // STOP REPEATING ALARM
    // ==================================

    if (alarmInterval) {

        clearInterval(
            alarmInterval
        );

        alarmInterval =
            null;
    }


    alarmActive =
        false;


    // ==================================
    // CLOSE NOTIFICATION
    // ==================================

    if (activeNotification) {

        try {

            activeNotification.close();

        }

        catch (error) {}

        activeNotification =
            null;
    }


    // ==================================
    // STOP AUDIO
    // ==================================

    if (
        audioContext &&
        audioContext.state === "running"
    ) {

        try {

            audioContext.suspend();

        }

        catch (error) {}

    }


    // ==================================
    // UPDATE SCREEN
    // ==================================

    if (
        stoppedByUser &&
        !quizActive
    ) {

        alertBox.style.display =
            "none";


        result.textContent =
            "🔇 Alarm stopped. Monitoring continues.";

    }
}


// ==========================================
// SHOW DROWSINESS ALERT
// ==========================================

function showDrowsinessAlert() {

    centerAlertAndQuiz();

    createStopAlarmButton();


    alertBox.style.display =
        "block";


    const stopButton =
        document.getElementById(
            "stopAlarmButton"
        );


    if (stopButton) {

        stopButton.style.display =
            "block";

    }


    // ==================================
    // START ALARM
    // ==================================

    if (!alarmStoppedByUser) {

        startAlarm();

    }


    // ==================================
    // SEND NOTIFICATION
    // ==================================

    if (!alertShown) {

        alertShown =
            true;

        sendDrowsinessNotification();

    }
}


// ==========================================
// HIDE DROWSINESS ALERT
// ==========================================

function hideDrowsinessAlert() {

    if (!quizActive) {

        alertBox.style.display =
            "none";

    }


    // ==================================
    // END CURRENT EPISODE
    // ==================================

    if (
        drowsinessEpisode
    ) {

        drowsinessEpisode =
            false;

        alarmStoppedByUser =
            false;

        stopAlarm(false);

    }


    alertShown =
        false;
}


// ==========================================
// SHOW RANDOM QUIZ
// ==========================================

function showQuiz() {

    quizActive =
        true;


    quizAnswered =
        false;


    centerAlertAndQuiz();


    quizBox.style.display =
        "block";


    alertBox.style.display =
        "block";


    // Keep stop button visible
    createStopAlarmButton();


    const stopButton =
        document.getElementById(
            "stopAlarmButton"
        );


    if (stopButton) {

        stopButton.style.display =
            "block";

    }


    quizResult.textContent =
        "";


    continueButton.style.display =
        "none";


    result.textContent =
        "🧠 Please complete the quick alertness check.";


    // ==================================
    // RANDOM QUESTION
    // ==================================

    const randomIndex =
        Math.floor(
            Math.random() *
            quizQuestions.length
        );


    const selectedQuestion =
        quizQuestions[randomIndex];


    // Store correct answer
    quizBox.dataset.answer =
        selectedQuestion.answer;


    // Show question
    questionText.textContent =
        selectedQuestion.question;


    // Clear previous buttons
    quizOptions.innerHTML =
        "";


    // Create answer buttons
    selectedQuestion.options.forEach(
        function (option, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                option;


            button.onclick =
                function () {

                    checkAnswer(index);

                };


            quizOptions.appendChild(
                button
            );

        }
    );
}


// ==========================================
// CHECK QUIZ ANSWER
// ==========================================

function checkAnswer(
    selectedAnswer
) {

    if (quizAnswered) {

        return;

    }


    quizAnswered =
        true;


    const correctAnswer =
        Number(
            quizBox.dataset.answer
        );


    // Disable all buttons
    const buttons =
        quizOptions.querySelectorAll(
            "button"
        );


    buttons.forEach(
        function (button) {

            button.disabled =
                true;

        }
    );


    // ==================================
    // CORRECT
    // ==================================

    if (
        selectedAnswer ===
        correctAnswer
    ) {

        quizResult.textContent =
            "✅ Correct! Alertness check completed successfully.";


        result.textContent =
            "✅ Correct answer. Monitoring can continue.";

    }


    // ==================================
    // WRONG
    // ==================================

    else {

        quizResult.textContent =
            "❌ Incorrect answer. Please take a break and rest.";


        result.textContent =
            "⚠️ Please consider taking a break.";

    }


    // Show continue button
    continueButton.style.display =
        "block";
}


// ==========================================
// CONTINUE MONITORING
// ==========================================

function continueMonitoring() {

    quizActive =
        false;


    quizAnswered =
        false;


    quizBox.style.display =
        "none";


    alertBox.style.display =
        "none";


    quizResult.textContent =
        "";


    continueButton.style.display =
        "none";


    // Reset detection timers
    eyesClosedSince =
        null;

    mouthOpenSince =
        null;

    yawnDetected =
        false;


    // ==================================
    // RESET ALARM
    // ==================================

    if (alarmInterval) {

        clearInterval(
            alarmInterval
        );

        alarmInterval =
            null;
    }


    alarmActive =
        false;


    alarmStoppedByUser =
        false;


    drowsinessEpisode =
        false;


    alertShown =
        false;


    // Close notification
    if (activeNotification) {

        try {

            activeNotification.close();

        }

        catch (error) {}

        activeNotification =
            null;
    }


    // Resume audio for future alerts
    if (
        audioContext &&
        audioContext.state ===
        "suspended"
    ) {

        try {

            audioContext.resume();

        }

        catch (error) {}

    }


    result.textContent =
        "🔄 Monitoring continued. Stay alert.";


    drowsyResult.textContent =
        "ALERT";


    eyeResult.textContent =
        "Detecting...";


    yawnResult.textContent =
        "Detecting...";
}
