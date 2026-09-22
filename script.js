// ==========================================
// ANTI-SLEEP SMART
// AI CAMERA + DROWSINESS + RANDOM QUIZ
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
// VARIABLES
// ==========================================

let camera = null;
let mediaStream = null;

let eyesClosedSince = null;

let alertShown = false;

let quizActive = false;
let quizAnswered = false;

// Yawn detection
let mouthOpenSince = null;
let yawnDetected = false;


// ==========================================
// CENTER ALERT AND QUIZ
// ==========================================

function centerAlertAndQuiz() {

    if (alertBox) {

        alertBox.style.position = "fixed";
        alertBox.style.top = "50%";
        alertBox.style.left = "50%";
        alertBox.style.transform = "translate(-50%, -50%)";

        alertBox.style.zIndex = "9999";

        alertBox.style.width = "min(90vw, 600px)";
        alertBox.style.maxHeight = "90vh";

        alertBox.style.overflowY = "auto";

        alertBox.style.boxSizing = "border-box";
    }


    if (quizBox) {

        quizBox.style.position = "fixed";
        quizBox.style.top = "50%";
        quizBox.style.left = "50%";
        quizBox.style.transform = "translate(-50%, -50%)";

        quizBox.style.zIndex = "10000";

        quizBox.style.width = "min(90vw, 600px)";
        quizBox.style.maxHeight = "90vh";

        quizBox.style.overflowY = "auto";

        quizBox.style.boxSizing = "border-box";
    }
}


// Center them when the page loads
centerAlertAndQuiz();


// ==========================================
// 10 RANDOM QUESTIONS
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
        question: "Which planet is known as the Red Planet?",
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
        question: "Which language is mainly used to create web page structure?",
        options: [
            "A. HTML",
            "B. Python",
            "C. SQL",
            "D. Java"
        ],
        answer: 0
    },


    {
        question: "How many days are there in a week?",
        options: [
            "A. 5",
            "B. 6",
            "C. 7",
            "D. 8"
        ],
        answer: 2
    },


    {
        question: "Which one is a programming language?",
        options: [
            "A. Python",
            "B. Chrome",
            "C. Windows",
            "D. Google"
        ],
        answer: 0
    },


    {
        question: "What is the largest planet in our Solar System?",
        options: [
            "A. Earth",
            "B. Mars",
            "C. Jupiter",
            "D. Mercury"
        ],
        answer: 2
    },


    {
        question: "How many sides does a triangle have?",
        options: [
            "A. 2",
            "B. 3",
            "C. 4",
            "D. 5"
        ],
        answer: 1
    },


    {
        question: "Which device is used to type text into a computer?",
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

        mediaStream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });


        video.srcObject = mediaStream;


        cameraStatus.textContent =
            "Camera Active";


        result.textContent =
            "AI monitoring has started.";


        eyeResult.textContent =
            "Detecting...";


        yawnResult.textContent =
            "Detecting...";


        drowsyResult.textContent =
            "Alert";


        // Center alert and quiz
        centerAlertAndQuiz();


        // Browser notification permission

        if (
            "Notification" in window &&
            Notification.permission === "default"
        ) {

            Notification.requestPermission();

        }


        // Start AI detection

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

    // Stop camera stream

    if (mediaStream) {

        mediaStream
            .getTracks()
            .forEach(function(track) {

                track.stop();

            });

        mediaStream = null;

    }


    // Stop MediaPipe

    if (camera) {

        camera.stop();

        camera = null;

    }


    // Remove video

    video.srcObject = null;


    // Reset values

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


    eyesClosedSince =
        null;


    alertShown =
        false;


    quizActive =
        false;


    quizAnswered =
        false;


    mouthOpenSince =
        null;


    yawnDetected =
        false;

}


// ==========================================
// FACE DETECTION
// ==========================================

function startFaceDetection() {

    const faceMesh =
        new FaceMesh({

            locateFile: function(file) {

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
    // AI RESULTS
    // ======================================

    faceMesh.onResults(function(results) {


        // ==================================
        // CHECK FACE
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


        // Get face landmarks

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

        /*
         Normal speaking can briefly open
         the mouth.

         So we do NOT immediately call it
         a yawn.

         Mouth must be widely open AND remain
         open for more than 1.5 seconds.
        */

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
        // DROWSINESS
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


        // Confirmed prolonged yawn

        if (yawnDetected) {

            drowsy =
                true;

        }


        // ==================================
        // DISPLAY RESULT
        // ==================================

        if (drowsy) {

            drowsyResult.textContent =
                "DROWSY";


            result.textContent =
                "🚨 Possible drowsiness detected.";


            showDrowsinessAlert();


            // Show quiz after eyes remain
            // closed for more than 3 seconds

            if (
                eyesClosedSince &&
                Date.now() - eyesClosedSince > 3000 &&
                !quizActive
            ) {

                showQuiz();

            }

        }

        else {

            drowsyResult.textContent =
                "ALERT";


            if (!quizActive) {

                result.textContent =
                    "✅ You appear alert.";


                hideDrowsinessAlert();

            }

        }

    });


    // ==================================
    // CAMERA PROCESSING
    // ==================================

    camera =
        new Camera(video, {

            onFrame: async function() {

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


    return vertical / horizontal;

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


    return vertical / horizontal;

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
        x * x + y * y
    );

}


// ==========================================
// SHOW DROWSINESS ALERT
// ==========================================

function showDrowsinessAlert() {

    // Make sure it is always centered

    centerAlertAndQuiz();


    alertBox.style.display =
        "block";


    // Browser notification

    if (!alertShown) {

        alertShown =
            true;


        if (
            "Notification" in window &&
            Notification.permission === "granted"
        ) {

            new Notification(
                "🚨 Drowsiness Alert",
                {
                    body:
                        "Possible drowsiness detected. Please take a break."
                }
            );

        }

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


    // IMPORTANT:
    // Keep quiz exactly in the center

    centerAlertAndQuiz();


    quizBox.style.display =
        "block";


    alertBox.style.display =
        "block";


    quizResult.textContent =
        "";


    continueButton.style.display =
        "none";


    result.textContent =
        "🧠 Please complete the quick alertness check.";


    // Select random question

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


    // Clear old buttons

    quizOptions.innerHTML =
        "";


    // Create buttons

    selectedQuestion.options.forEach(
        function(option, index) {

            const button =
                document.createElement("button");


            button.textContent =
                option;


            button.onclick =
                function() {

                    checkAnswer(index);

                };


            quizOptions.appendChild(
                button
            );

        }
    );

}


// ==========================================
// CHECK ANSWER
// ==========================================

function checkAnswer(selectedAnswer) {

    if (quizAnswered) {

        return;

    }


    quizAnswered =
        true;


    const correctAnswer =
        Number(
            quizBox.dataset.answer
        );


    // Disable buttons

    const buttons =
        quizOptions.querySelectorAll("button");


    buttons.forEach(
        function(button) {

            button.disabled =
                true;

        }
    );


    // Check answer

    if (
        selectedAnswer ===
        correctAnswer
    ) {

        quizResult.textContent =
            "✅ Correct! Alertness check completed successfully.";


        result.textContent =
            "✅ Correct answer. Monitoring can continue.";

    }

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


    eyesClosedSince =
        null;


    alertShown =
        false;


    mouthOpenSince =
        null;


    yawnDetected =
        false;


    result.textContent =
        "🔄 Monitoring continued. Stay alert.";


    drowsyResult.textContent =
        "ALERT";

}