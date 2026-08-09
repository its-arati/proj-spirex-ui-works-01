document.getElementById('generateBtn').addEventListener('click', generatePalette);

function generatePalette() {
    const baseColor = document.getElementById('colorPicker').value;
    const paletteContainer = document.getElementById('colorPalette');

    paletteContainer.innerHTML = '';

    const palette = generateVariations(baseColor, 5);
    palette.forEach(color => {
        const colorCard = document.createElement('div');
        colorCard.classList.add('color-card');
        colorCard.style.backgroundColor = color;

        const colorCode = document.createElement('span');
        colorCode.classList.add('color-code');
        colorCode.textContent = color.toUpperCase();

        colorCode.style.color = getContrastColor(color);

        colorCard.appendChild(colorCode);
        paletteContainer.appendChild(colorCard);
    });
}

function generateVariations(hex, steps) {
    let { h, s, l } = hexToHSL(hex);
    let variations = [];

    let startRange = Math.max(10, l - 30);
    let endRange = Math.min(90, l + 30);
    let stepIncrement = (endRange - startRange) / (steps - 1);

    for (let i = 0; i < steps; i++) {
        let newL = startRange + (stepIncrement * i);
        variations.push(hslToHex(h, s, newL));
    }

    return variations;
}

function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h = h/6;
    }
    return { h: h * 360, s: s * 100, l: l * 100};
}

function hslToHex(h, s, l) {
    l = l/100;
    const alpha = (s * Math.min(l, 1 - l))/100;
    const calculateColor = (n) => {
        const k = (n + h/30) % 12;
        const color = l - alpha * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${calculateColor(0)}${calculateColor(8)}${calculateColor(4)}`;
}

function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance;
}

generatePalette();