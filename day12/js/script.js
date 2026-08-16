
class TypingKeystrokes {
    strokes = [];

    reset() {
        this.strokes = [];
    }
    trackStroke(key, time) {
        this.strokes.push(
            { key, time }
        );
    }
    computeWordTimingMap() {
        const map = [];
        let word = '';
        let time = 0;
        let lastTime = typing.strokes[0].time;
        let lastBlankTime = lastTime;
        for( let stroke of typing.strokes ) {
            if (stroke.key === ' '){
                time = stroke.time - lastBlankTime;
                map.push({word, time})
                word = '';
                time = 0;
                lastBlankTime = stroke.time;
                console.log('trace', word, time);
                continue;
            }
            word += stroke.key;
        }
        map.push({word, time})
        return map;
    }
    getTimeGap() {
        return (
            typing.strokes[typing.strokes.length - 1].time
            - typing.strokes[0].time
        );
    }
}

class TypingAnalyser {
    content = '';

    setContent(content) {
        this.content = content;
    }

    getContentWords() {
        return this.content.trim().split(/\s+/);
    }

    analyseAccuracy(wordsMap) {
        const actualWords = this.getContentWords();
        const typedWords = wordsMap.map(e => e.word);

        let expectedIndex = 0;
        let correctWords = 0;
        let incorrectWords = 0;
        let skippedWords = 0;
        let retypedWords = 0;

        for (let typedWord of typedWords) {
            const expectedWord = actualWords[expectedIndex];
            const nextExpectedWord = actualWords[expectedIndex + 1];
            const previousExpectedWord = actualWords[expectedIndex - 1];

            if (typedWord === expectedWord) {
                correctWords++;
                expectedIndex++;
                continue;
            }

            if (typedWord === nextExpectedWord) {
                skippedWords++;
                expectedIndex += 2;
                continue;
            }

            if (typedWord === previousExpectedWord) {
                retypedWords++;
                continue;
            }

            incorrectWords++;
            expectedIndex++;
        }

        const totalWords = actualWords.length;
        const accuracy = totalWords === 0
            ? 0
            : (correctWords / totalWords) * 100;

        return {
            totalWords,
            correctWords,
            incorrectWords,
            skippedWords,
            retypedWords,
            accuracy: Math.round(accuracy * 100) / 100
        };
    }
}

var typing = new TypingKeystrokes();
var analyser = new TypingAnalyser();

async function fetchSampleParagraphs() {
    const result = await fetch('assets/samples.json');
    return result.json();
}



function computeResult() {
    const wordsMap = typing.computeWordTimingMap();
    const timeGapMs = typing.getTimeGap() / 1000;
    const wordCount = wordsMap.length;

    const wordsPerSecond = wordCount / timeGapMs;

    return {
        wordsPerSecond,
        wordsPerMinute: Math.round(wordsPerSecond * 60),
        timeTaken: timeGapMs
    }
}

function renderContent(sample) {
    const content = document.getElementById('content-portal');
    console.log('sample: ', sample);
    analyser.setContent(sample.text);
    content.innerHTML = `
        <p>${sample.text}</p>
    `
}

function renderResult(result) {
    const resultPortal = document.getElementById('result-portal');

    const accuracyCardClass = 
        result.accuracy > 90 ? 'success'
            : result.accuracy > 70 ? 'warning' : 'danger'
    
    const incorrectWordsClass =
        result.incorrectWords < 1 ? 'success'
            : result.incorrectWords < 3 ? 'warning' : 'danger'

    resultPortal.innerHTML = `
        <div class="card border-0 shadow-sm result-card">
            <div class="card-body p-4">
                <div class="text-center mb-4">
                    <h2 class="fw-bold mb-1">Typing Result</h2>
                    <p class="text-body-secondary mb-0">Here is how you performed</p>
                </div>

                <div class="row g-3 text-center">
                    <div class="col-6 col-md-3">
                        <div class="bg-primary-subtle rounded-3 p-3 h-100">
                            <div class="fs-3 fw-bold text-primary">
                                ${result.wordsPerMinute}
                            </div>
                            <div class="small text-body-secondary">
                                Words / Minute
                            </div>
                        </div>
                    </div>

                    <div class="col-6 col-md-3">
                        <div class="bg-${accuracyCardClass}-subtle rounded-3 p-3 h-100">
                            <div class="fs-3 fw-bold text-${accuracyCardClass}-emphasis">
                                ${result.accuracy}%
                            </div>
                            <div class="small text-body-secondary">
                                Accuracy
                            </div>
                        </div>
                    </div>

                    <div class="col-6 col-md-3">
                        <div class="bg-warning-subtle rounded-3 p-3 h-100">
                            <div class="fs-3 fw-bold text-warning-emphasis">
                                ${result.correctWords}
                            </div>
                            <div class="small text-body-secondary">
                                Correct Words
                            </div>
                        </div>
                    </div>

                    <div class="col-6 col-md-3">
                        <div class="bg-${incorrectWordsClass}-subtle rounded-3 p-3 h-100">
                            <div class="fs-3 fw-bold text-${incorrectWordsClass}-emphasis">
                                ${result.incorrectWords}
                            </div>
                            <div class="small text-body-secondary">
                                Incorrect Words
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="d-flex justify-content-between border-bottom py-2">
                            <span class="text-body-secondary">Time Taken</span>
                            <strong>${result.timeTaken}s</strong>
                        </div>

                        <div class="d-flex justify-content-between border-bottom py-2">
                            <span class="text-body-secondary">Total Words</span>
                            <strong>${result.totalWords}</strong>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="d-flex justify-content-between border-bottom py-2">
                            <span class="text-body-secondary">Skipped Words</span>
                            <strong>${result.skippedWords}</strong>
                        </div>

                        <div class="d-flex justify-content-between border-bottom py-2">
                            <span class="text-body-secondary">Retyped Words</span>
                            <strong>${result.retypedWords}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRandomSample() {
    fetchSampleParagraphs()
        .then(r => {
            const sample = r.paragraphs[Math.floor(Math.random() * r.paragraphs.length)]
            renderContent(sample);
            return sample;
        });
}

var toSkip = ['Shift', 'Backspace', 'Meta', 'Alt'];
function attachTypingAction() {
    console.log('event')
    const typingArea = document.getElementById('typing-area');

    typingArea.addEventListener(
        'keydown',
        (e) => {
            const key = e.key;
            if (toSkip.includes(key)) return;
            if (key === 'Enter') {
                document.getElementById('computeReult').click();
                return;
            }
            typing.trackStroke(key, Date.now());
            console.log(key);
            
            typingArea.textContent += key;
        }
    )
}

function attachComputeResultAction() {
    document.getElementById('computeReult').addEventListener(
        'click',
        e => {
            const analysisResult = analyser.analyseAccuracy(
                typing.computeWordTimingMap()
            );

            const speedResult = computeResult();

            renderResult({
                ...analysisResult,
                ...speedResult
            });
        }
    )
}

document.addEventListener(
    'readystatechange',
    ($e) => {
        if (document.readyState === 'complete') {
            attachTypingAction();
            renderRandomSample();
            attachComputeResultAction();
        }
        
    }
)