
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const levelElement = document.getElementById("level");
// Imágenes que podrán aparecer dentro de algunas figuras
const imagePaths = [
    "img/persona1_1.png",
    "img/persona2_2.png",
    "img/persona3_3.png",
    "img/usuario1.jpg",
    "img/usuario2.jpg",
    "img/usuario3.jpg"
];

// Cargar las imágenes
const loadedImages = imagePaths.map(path => {
    const image = new Image();
    image.src = path;
    return image;
});

// ---------------------------------------------
// CONFIGURACIÓN GENERAL
// ---------------------------------------------

let window_width = window.innerWidth;
let window_height = window.innerHeight;

canvas.width = window_width;
canvas.height = window_height;

const TOTAL_FIGURES = 25;
const GRAVITY = 0.20;
const BOUNCE_FACTOR = 0.62;
const MIN_BOUNCE_SPEED = 2.0;

let score = 0;
let speedMultiplier = 1;
let mouseX = 0;
let mouseY = 0;

const figures = [];

const colors = [
    "#00E5FF",
    "#FF4081",
    "#FFD740",
    "#69F0AE",
    "#B388FF",
    "#FF7043",
    "#40C4FF",
    "#EEFF41"
];

// ---------------------------------------------
// CLASE FIGURE
// ---------------------------------------------

class Figure {
    constructor(id) {
        this.id = id;
        this.respawn(true);
    }

    // Reinicia la figura en la parte superior
    respawn(initial = false) {
        this.size = Math.random() * 18 + 22;

        // La figura inicia justo arriba del canvas
        this.x = Math.random() *
            Math.max(1, canvas.width - this.size * 2) +
            this.size;

        this.y = -this.size;

        // Velocidad horizontal aleatoria
        this.vx = (Math.random() - 0.5) * 2.5;

        // Velocidad vertical inicial
        this.vy = (Math.random() * 1.5 + 0.5) *
            speedMultiplier;

        this.color = colors[
            Math.floor(Math.random() * colors.length)
        ];

        // Entre 3 y 8 vértices
        this.sides = Math.floor(Math.random() * 6) + 3;

        // Algunas figuras tendrán puntas de estrella
        this.isStar = Math.random() < 0.35;
         // Aproximadamente el 20 % de las figuras tendrán imagen
        this.hasImage = Math.random() < 0.20;

        // Elegir una imagen aleatoria
        this.image = this.hasImage
            ? loadedImages[
                Math.floor(Math.random() * loadedImages.length)
              ]
            : null;

        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.035;

        this.bounces = 0;
        this.active = true;

        // En la generación inicial, repartir las figuras
        // por diferentes alturas para evitar una sola fila.
        if (initial) {
            this.y = -this.size - Math.random() * 120;
        }
    }

    // Dibuja un polígono o una estrella

    draw() {
        ctx.save();

        // Posicionar y rotar la figura
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Definir la cantidad de vértices
        const vertices = this.isStar
            ? this.sides * 2
            : this.sides;

        // Crear el trazado de la figura
        ctx.beginPath();

        for (let i = 0; i < vertices; i++) {
            const angle =
                (Math.PI * 2 * i / vertices) - Math.PI / 2;

            let radius = this.size;

            // Alternar radios para formar una estrella
            if (this.isStar && i % 2 === 1) {
                radius = this.size * 0.45;
            }

            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }

        ctx.closePath();

        // Rellenar con el color de la figura
        ctx.shadowBlur = 18;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.fill();

        // Dibujar la imagen dentro de la silueta
        ctx.shadowBlur = 0;

        if (
            this.hasImage &&
            this.image &&
            this.image.complete &&
            this.image.naturalWidth > 0
        ) {
            ctx.save();

            // Recortar la imagen con la forma del polígono
            ctx.clip();

            ctx.drawImage(
                this.image,
                -this.size,
                -this.size,
                this.size * 2,
                this.size * 2
            );

            ctx.restore();
        }

        // Dibujar el borde blanco
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.restore();
    }


    // Actualiza el movimiento
    update() {
        if (!this.active) return;

        // Gravedad: aumenta la velocidad hacia abajo
        this.vy += GRAVITY * speedMultiplier;

        this.x += this.vx * speedMultiplier;
        this.y += this.vy;

        this.rotation += this.rotationSpeed;

        // Rebote contra las paredes laterales
        if (this.x + this.size > canvas.width) {
            this.x = canvas.width - this.size;
            this.vx = -Math.abs(this.vx);
        }

        if (this.x - this.size < 0) {
            this.x = this.size;
            this.vx = Math.abs(this.vx);
        }

        // Rebote contra el suelo
        if (this.y + this.size >= canvas.height) {
            this.y = canvas.height - this.size;

            // Rebota con menor fuerza cada vez
            this.vy = -Math.abs(this.vy) * BOUNCE_FACTOR;

            // Reduce el movimiento horizontal por rozamiento
            this.vx *= 0.85;

            this.bounces++;

            // Cuando pierde suficiente fuerza, reaparece arriba
            if (Math.abs(this.vy) < MIN_BOUNCE_SPEED) {
                this.respawn();
            }
        }
    }

    // Comprueba si el clic alcanzó la figura
    
    containsPoint(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;

        // Ampliar el área de selección un 35 %
        const hitRadius = this.size * 1.5;

        // Comprobar si el clic está dentro del área ampliada
        return (dx * dx + dy * dy) <= (hitRadius * hitRadius);
    }

}

// ---------------------------------------------
// GENERAR SIEMPRE 25 FIGURAS
// ---------------------------------------------

function generateFigures() {
    figures.length = 0;

    for (let i = 0; i < TOTAL_FIGURES; i++) {
        figures.push(new Figure(i + 1));
    }
}

// ---------------------------------------------
// DIFICULTAD PROGRESIVA
// ---------------------------------------------

function updateDifficulty() {
    if (score > 20) {
        speedMultiplier = 2.0;
        levelElement.textContent = "Velocidad: alta";
    } else if (score > 10) {
        speedMultiplier = 1.5;
        levelElement.textContent = "Velocidad: media";
    } else {
        speedMultiplier = 1.0;
        levelElement.textContent = "Velocidad: normal";
    }
}

// ---------------------------------------------
// CLIC DEL MOUSE: ELIMINAR FIGURAS
// ---------------------------------------------

canvas.addEventListener("click", function (event) {
    // Coordenadas relativas al canvas
    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    // Buscar la figura seleccionada, empezando por la última
    for (let i = figures.length - 1; i >= 0; i--) {
        const figure = figures[i];

        if (figure.active && figure.containsPoint(mouseX, mouseY)) {
            // Sumar un punto
            score++;
            scoreElement.textContent = score;

            // Actualizar la dificultad
            updateDifficulty();

            // Reaparecer en la parte superior
            // sin reducir el total de figuras
            figure.respawn();

            break;
        }
    }
});

// ---------------------------------------------
// COLISIONES ENTRE FIGURAS
// ---------------------------------------------

function checkCollisions() {
    for (let i = 0; i < figures.length; i++) {
        for (let j = i + 1; j < figures.length; j++) {
            const a = figures[i];
            const b = figures[j];

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = a.size + b.size;

            if (distance < minDistance && distance > 0) {
                const nx = dx / distance;
                const ny = dy / distance;

                // Comprobar si se acercan entre sí
                const relativeX = a.vx - b.vx;
                const relativeY = a.vy - b.vy;

                const velocityAlongNormal =
                    relativeX * nx + relativeY * ny;

                if (velocityAlongNormal > 0) {
                    // Intercambiar componentes de velocidad
                    // en la dirección del contacto
                    a.vx -= velocityAlongNormal * nx;
                    a.vy -= velocityAlongNormal * ny;

                    b.vx += velocityAlongNormal * nx;
                    b.vy += velocityAlongNormal * ny;
                }

                // Separar las figuras para evitar que se encimen
                const overlap = minDistance - distance;
                const correction = overlap / 2;

                a.x -= correction * nx;
                a.y -= correction * ny;

                b.x += correction * nx;
                b.y += correction * ny;
            }
        }
    }
}

// ---------------------------------------------
// FONDO DECORATIVO
// ---------------------------------------------

function drawBackground() {
    const gradient = ctx.createLinearGradient(
        0, 0, canvas.width, canvas.height
    );

    gradient.addColorStop(0, "#0B1020");
    gradient.addColorStop(0.5, "#151A35");
    gradient.addColorStop(1, "#091522");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula tenue
    ctx.beginPath();
    ctx.strokeStyle = "rgba(120, 160, 255, 0.09)";
    ctx.lineWidth = 1;

    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();
}

// ---------------------------------------------
// ANIMACIÓN PRINCIPAL
// ---------------------------------------------

function animate() {
    drawBackground();

    // Actualizar movimiento de todas las figuras
    figures.forEach(figure => figure.update());

    // Detectar colisiones entre figuras
    checkCollisions();

    // Dibujar todas las figuras
    figures.forEach(figure => figure.draw());

    requestAnimationFrame(animate);
}

// ---------------------------------------------
// AJUSTAR TAMAÑO DE LA VENTANA
// ---------------------------------------------

window.addEventListener("resize", () => {
    window_width = window.innerWidth;
    window_height = window.innerHeight;

    canvas.width = window_width;
    canvas.height = window_height;

    figures.forEach(figure => {
        figure.x = Math.max(
            figure.size,
            Math.min(canvas.width - figure.size, figure.x)
        );
    });
});

// ---------------------------------------------
// INICIAR JUEGO
// ---------------------------------------------

generateFigures();
updateDifficulty();
animate();
