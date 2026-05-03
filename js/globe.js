// globe.js
// This script requires D3 to be loaded first.

class WireframeDottedGlobe {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = options.width || 600;
        this.height = options.height || 600;
        this.landFeatures = null;
        this.allDots = [];
        this.isLoading = true;
        this.autoRotate = true;
        this.rotation = [0, 0];
        this.rotationSpeed = 0.5;
        this.rotationTimer = null;
        
        this.init();
    }

    async init() {
        this.resize();
        this.setupProjection();
        this.bindEvents();
        
        try {
            await this.loadWorldData();
            this.startRotation();
        } catch (error) {
            console.error("Failed to load world data for globe", error);
        }
        
        window.addEventListener('resize', () => {
            this.resize();
            this.setupProjection();
            if (!this.isLoading) {
                this.render();
            }
        });
    }

    resize() {
        const containerWidth = this.canvas.clientWidth || this.width;
        const containerHeight = this.canvas.clientHeight || this.height;
        this.radius = Math.min(containerWidth, containerHeight) / 2.5;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = containerWidth * dpr;
        this.canvas.height = containerHeight * dpr;
        
        this.containerWidth = containerWidth;
        this.containerHeight = containerHeight;
        this.ctx.scale(dpr, dpr);
    }

    setupProjection() {
        this.projection = d3.geoOrthographic()
            .scale(this.radius)
            .translate([this.containerWidth / 2, this.containerHeight / 2])
            .clipAngle(90);

        this.path = d3.geoPath()
            .projection(this.projection)
            .context(this.ctx);
    }

    pointInPolygon(point, polygon) {
        const [x, y] = point;
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];
            if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }

    pointInFeature(point, feature) {
        const geometry = feature.geometry;
        if (geometry.type === "Polygon") {
            const coordinates = geometry.coordinates;
            if (!this.pointInPolygon(point, coordinates[0])) return false;
            for (let i = 1; i < coordinates.length; i++) {
                if (this.pointInPolygon(point, coordinates[i])) return false;
            }
            return true;
        } else if (geometry.type === "MultiPolygon") {
            for (const polygon of geometry.coordinates) {
                if (this.pointInPolygon(point, polygon[0])) {
                    let inHole = false;
                    for (let i = 1; i < polygon.length; i++) {
                        if (this.pointInPolygon(point, polygon[i])) {
                            inHole = true;
                            break;
                        }
                    }
                    if (!inHole) return true;
                }
            }
            return false;
        }
        return false;
    }

    generateDotsInPolygon(feature, dotSpacing = 16) {
        const dots = [];
        const bounds = d3.geoBounds(feature);
        const [[minLng, minLat], [maxLng, maxLat]] = bounds;

        const stepSize = dotSpacing * 0.08;

        for (let lng = minLng; lng <= maxLng; lng += stepSize) {
            for (let lat = minLat; lat <= maxLat; lat += stepSize) {
                const point = [lng, lat];
                if (this.pointInFeature(point, feature)) {
                    dots.push(point);
                }
            }
        }
        return dots;
    }

    async loadWorldData() {
        this.isLoading = true;
        const response = await fetch("https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json");
        if (!response.ok) throw new Error("Failed to load land data");

        this.landFeatures = await response.json();

        this.landFeatures.features.forEach(feature => {
            const dots = this.generateDotsInPolygon(feature, 16);
            dots.forEach(([lng, lat]) => {
                this.allDots.push({ lng, lat, visible: true });
            });
        });

        this.isLoading = false;
        this.render();
    }

    render() {
        this.ctx.clearRect(0, 0, this.containerWidth, this.containerHeight);

        const currentScale = this.projection.scale();
        const scaleFactor = currentScale / this.radius;

        // Draw ocean background
        this.ctx.beginPath();
        this.ctx.arc(this.containerWidth / 2, this.containerHeight / 2, currentScale, 0, 2 * Math.PI);
        this.ctx.fillStyle = "transparent"; // Keep globe transparent to blend with slide background
        this.ctx.fill();
        this.ctx.strokeStyle = "rgba(147, 197, 253, 0.2)"; // Soft blue outer ring
        this.ctx.lineWidth = 2 * scaleFactor;
        this.ctx.stroke();

        if (this.landFeatures && !this.isLoading) {
            // Draw graticule (grid lines)
            const graticule = d3.geoGraticule();
            this.ctx.beginPath();
            this.path(graticule());
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Very faint grid
            this.ctx.lineWidth = 1 * scaleFactor;
            this.ctx.stroke();

            // Draw land outlines
            this.ctx.beginPath();
            this.landFeatures.features.forEach((feature) => {
                this.path(feature);
            });
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"; // White outline
            this.ctx.lineWidth = 1 * scaleFactor;
            this.ctx.stroke();

            // Draw halftone dots
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)"; // White dots
            this.allDots.forEach(dot => {
                const projected = this.projection([dot.lng, dot.lat]);
                if (
                    projected &&
                    projected[0] >= 0 &&
                    projected[0] <= this.containerWidth &&
                    projected[1] >= 0 &&
                    projected[1] <= this.containerHeight
                ) {
                    this.ctx.beginPath();
                    this.ctx.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI);
                    this.ctx.fill();
                }
            });
        }
    }

    startRotation() {
        if (this.rotationTimer) this.rotationTimer.stop();
        this.rotationTimer = d3.timer(() => {
            if (this.autoRotate) {
                this.rotation[0] += this.rotationSpeed;
                this.projection.rotate(this.rotation);
                this.render();
            }
        });
    }

    bindEvents() {
        const handleMouseDown = (event) => {
            this.autoRotate = false;
            const startX = event.clientX;
            const startY = event.clientY;
            const startRotation = [...this.rotation];

            const handleMouseMove = (moveEvent) => {
                const sensitivity = 0.5;
                const dx = moveEvent.clientX - startX;
                const dy = moveEvent.clientY - startY;

                this.rotation[0] = startRotation[0] + dx * sensitivity;
                this.rotation[1] = startRotation[1] - dy * sensitivity;
                this.rotation[1] = Math.max(-90, Math.min(90, this.rotation[1]));

                this.projection.rotate(this.rotation);
                this.render();
            };

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                setTimeout(() => {
                    this.autoRotate = true;
                }, 10);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        };

        const handleWheel = (event) => {
            event.preventDefault();
            const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
            const newRadius = Math.max(this.radius * 0.5, Math.min(this.radius * 3, this.projection.scale() * scaleFactor));
            this.projection.scale(newRadius);
            this.render();
        };

        this.canvas.addEventListener("mousedown", handleMouseDown);
        this.canvas.addEventListener("wheel", handleWheel, { passive: false });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-globe');
    if (canvas && typeof d3 !== 'undefined') {
        new WireframeDottedGlobe(canvas, {
            width: 600,
            height: 600
        });
    } else if (canvas) {
        console.error("D3.js is required for the wireframe globe.");
    }
});
