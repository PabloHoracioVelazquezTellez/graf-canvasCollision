
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Dimensiones del canvas
let window_width = window.innerWidth;
let window_height = window.innerHeight;

canvas.width = window_width;
canvas.height = window_height;
canvas.style.background = "#000000";

// Clase Circle
class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.originalColor = color;
        this.text = text;
        this.speed = speed;

        // Dirección y velocidad iniciales
        const angle = Math.random() * Math.PI * 2;
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
    }

    draw(context) {
        context.beginPath();

        // Dibujar el texto
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);

        // Dibujar el círculo
        context.strokeStyle = this.color;
        context.lineWidth = 2;
        context.arc(
            this.posX,
            this.posY,
            this.radius,
            0,
            Math.PI * 2
        );

        context.stroke();
        context.closePath();
    }

    update(context) {
        // Actualizar posición
        this.posX += this.dx;
        this.posY += this.dy;

        // Rebote contra los bordes horizontales
        if (this.posX + this.radius > canvas.width) {
            this.posX = canvas.width - this.radius;
            this.dx = -Math.abs(this.dx);
        } else if (this.posX - this.radius < 0) {
            this.posX = this.radius;
            this.dx = Math.abs(this.dx);
        }

        // Rebote contra los bordes verticales
        if (this.posY + this.radius > canvas.height) {
            this.posY = canvas.height - this.radius;
            this.dy = -Math.abs(this.dy);
        } else if (this.posY - this.radius < 0) {
            this.posY = this.radius;
            this.dy = Math.abs(this.dy);
        }

        this.draw(context);
    }

    // Detectar colisión entre dos círculos
    isColliding(otherCircle) {
        const dx = this.posX - otherCircle.posX;
        const dy = this.posY - otherCircle.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.radius + otherCircle.radius;
    }
}

// Array de círculos
const circles = [];

// Generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        const radius = Math.random() * 30 + 20;

        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;

        const color = "#FFFFFF";

        const speed = Math.random() * 4 + 1;
        const text = `C${i + 1}`;

        circles.push(
            new Circle(x, y, radius, color, text, speed)
        );
    }
}

// Detectar y resolver colisiones
function checkCollisions(circles) {
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            const c1 = circles[i];
            const c2 = circles[j];

            const dx = c2.posX - c1.posX;
            const dy = c2.posY - c1.posY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = c1.radius + c2.radius;

            // Si se están tocando o superponiendo
            if (distance < minDistance) {
                // Color azul durante la colisión
                c1.color = "#0000FF";
                c2.color = "#0000FF";

                // Evitar una distancia igual a cero
                if (distance === 0) {
                    c2.posX += 0.1;
                    continue;
                }

                // Vector unitario de la colisión
                const nx = dx / distance;
                const ny = dy / distance;

                // Velocidad relativa en la dirección del contacto
                const relativeVelocityX = c1.dx - c2.dx;
                const relativeVelocityY = c1.dy - c2.dy;

                const velocityAlongNormal =
                    relativeVelocityX * nx +
                    relativeVelocityY * ny;

                // Rebotar solamente si se están acercando
                if (velocityAlongNormal > 0) {
                    const impulse = velocityAlongNormal;

                    c1.dx -= impulse * nx;
                    c1.dy -= impulse * ny;

                    c2.dx += impulse * nx;
                    c2.dy += impulse * ny;
                }

                // Corregir la superposición
                const overlap = minDistance - distance;
                const correction = overlap / 2;

                c1.posX -= correction * nx;
                c1.posY -= correction * ny;

                c2.posX += correction * nx;
                c2.posY += correction * ny;
            }
        }
    }
}

// Animación principal
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Restaurar colores originales
    circles.forEach(circle => {
        circle.color = circle.originalColor;
    });

    // Resolver colisiones antes de actualizar posiciones
    checkCollisions(circles);

    // Mover y dibujar círculos
    circles.forEach(circle => {
        circle.update(ctx);
    });

    requestAnimationFrame(animate);
}

// Adaptar el canvas al cambiar el tamaño de la ventana
window.addEventListener("resize", () => {
    window_width = window.innerWidth;
    window_height = window.innerHeight;

    canvas.width = window_width;
    canvas.height = window_height;

    // Evitar que los círculos queden fuera del canvas
    circles.forEach(circle => {
        circle.posX = Math.max(
            circle.radius,
            Math.min(canvas.width - circle.radius, circle.posX)
        );

        circle.posY = Math.max(
            circle.radius,
            Math.min(canvas.height - circle.radius, circle.posY)
        );
    });
});

// Iniciar
generateCircles(20);
animate();
