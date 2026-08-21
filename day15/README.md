# Day 15 — Online Exam Portal

A timed multiple-choice exam app built as a small front-end assessment flow. It lets a candidate enter a name, answer questions, review progress, and see a final score summary after submission.

## Features

- Start screen with a candidate name form
- Load exam questions from `assets/questions.json`
- Navigate through questions using previous/next controls
- Select answers with radio buttons
- Toggle review status for specific questions
- Clear a selected answer
- View a question palette with attempted, unattempted, and review states
- Countdown timer that auto-submits when time runs out
- Final result page showing score, percentage, and answer breakdown

## Tech / Libraries

- HTML
- CSS
- JavaScript
- Bootstrap 5 for UI styling
- Custom JS state helpers from the shared `/scripts` folder

## How to Run

1. Open [index.html](index.html) in a browser, or launch the folder with Live Server in VS Code.
2. Enter your full name and click the start button.
3. Answer the questions and use the control buttons to move through the exam.
4. Submit the exam to view the final result summary.

## Files of Interest

- [index.html](index.html) — candidate entry screen
- [exam.html](exam.html) — exam-taking interface
- [result.html](result.html) — final score screen
- [js/exam.js](js/exam.js) — exam logic and timer behavior
- [assets/questions.json](assets/questions.json) — question bank

## Notes

- The app stores the candidate name and submitted answer data in `localStorage`.
- The question data is loaded from `assets/questions.json`, so changing the dataset updates the exam automatically.
- The timer is set to 10 minutes and automatically submits the exam when it reaches zero.
