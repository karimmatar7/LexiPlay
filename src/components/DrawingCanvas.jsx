import React, {
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

const CANVAS_SIZE = 300;

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { letter, feedback, feedbackGoalLabel, feedbackMissLabel, paused, disabled },
  ref
) {
  const ghostCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPos = useRef(null);

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      canvas.getContext("2d").clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    },

    // Return ONLY the user's draw layer (transparent background + strokes)
    getCompositeImageData() {
      const canvas = drawCanvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext("2d");
      return ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    },
  }));

  // Redraw ghost letter whenever letter changes
  useEffect(() => {
    const canvas = ghostCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.font = `bold ${CANVAS_SIZE * 0.72}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(99,102,241,0.13)";
    ctx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
  }, [letter]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback(
    (e) => {
      if (paused || disabled) return;
      e.preventDefault();

      drawingRef.current = true;
      lastPos.current = getPos(e, drawCanvasRef.current);
    },
    [paused, disabled]
  );

  const draw = useCallback((e) => {
    if (!drawingRef.current) return;
    e.preventDefault();

    const canvas = drawCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);

    if (!lastPos.current) {
      lastPos.current = pos;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPos.current = pos;
  }, []);

  const stopDraw = useCallback(() => {
    drawingRef.current = false;
    lastPos.current = null;
  }, []);

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-200 bg-white">
      {/* Layer 1 — ghost letter, never cleared */}
      <canvas
        ref={ghostCanvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ background: "transparent" }}
      />

      {/* Layer 2 — user strokes */}
      <canvas
        ref={drawCanvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ background: "transparent" }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />

      {/* Feedback overlay */}
      {feedback && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-2"
          style={{
            background:
              feedback === "goal"
                ? "rgba(220,252,231,0.88)"
                : "rgba(254,226,226,0.88)",
          }}
        >
          <span
            className="text-7xl sm:text-8xl animate-bounce"
            style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}
          >
            {feedback === "goal" ? "⚽" : "😅"}
          </span>

          <span
            className={`text-lg sm:text-xl font-extrabold ${
              feedback === "goal" ? "text-green-600" : "text-red-500"
            }`}
          >
            {feedback === "goal" ? feedbackGoalLabel : feedbackMissLabel}
          </span>
        </div>
      )}
    </div>
  );
});

export default DrawingCanvas;
export { CANVAS_SIZE };