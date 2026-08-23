const buttons = document.querySelectorAll('.btn');
const textarea = document.querySelector('textarea');
const deleteBtn = document.querySelector('.delete');
const shiftBtn = document.querySelector('.shift');
const spaceBtn = document.querySelector('.space');
const enterBtn = document.querySelector('.enter');

let isShift = false;

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        let char = btn.innerText;
        if(isShift) char = char.toLowerCase();
        textarea.value += char;
    });
});

deleteBtn.addEventListener('click', () => {
    textarea.value = textarea.value.slice(0, -1);
});

spaceBtn.addEventListener('click', () => {
    textarea.value += ' ';
});

shiftBtn.addEventListener('click', () => {
    isShift = !isShift;
    buttons.forEach(btn => {
        if(isShift) {
            btn.innerText = btn.innerText.toLowerCase();
            btn.classList.add('lower');
        } else {
            btn.innerText = btn.innerText.toUpperCase();
            btn.classList.remove('lower');
        }
    });
});

enterBtn.addEventListener('click', () => {
    textarea.value += '\n';
})