import React, { useRef, useEffect, useState } from 'react';

const landmarkNames = [
  'nose', 'leftEyeInner', 'leftEye', 'leftEyeOuter',
  'rightEyeInner', 'rightEye', 'rightEyeOuter',
  'leftEar', 'rightEar', 'leftMouth', 'rightMouth',
  'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow',
  'leftWrist', 'rightWrist', 'leftPinky', 'rightPinky',
  'leftIndex', 'rightIndex', 'leftThumb', 'rightThumb',
  'leftHip', 'rightHip', 'leftKnee', 'rightKnee',
  'leftAnkle', 'rightAnkle', 'leftHeel', 'rightHeel',
  'leftFootIndex', 'rightFootIndex'
];

function calculateAngle(p1, p2, p3) {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * (180.0 / Math.PI));
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
}

const PushupDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtx = useRef(null);

  const [elbowAngle, setElbowAngle] = useState(0);
  const [pushupCount, setPushupCount] = useState(0);
  const [isLowering, setIsLowering] = useState(false);
  const [pushupState, setPushupState] = useState("Get in position and enter frame 🫠");
  const [formCheck, setFormCheck] = useState("Ensure full body is visible");
  const [tip, setTip] = useState("");

  const updateCanvasSize = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const rect = video.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    canvasCtx.current = canvasElement.getContext('2d');

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file.replace('_simd', '')}`
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!canvasCtx.current) return;
      updateCanvasSize();
      const ctx = canvasCtx.current;
      ctx.save();
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

      if (results.poseLandmarks) {
        const labeled = results.poseLandmarks.map((lm, i) => ({ name: landmarkNames[i], ...lm }));

        const side = labeled.find(p => p.name === 'rightShoulder')?.visibility > 0.5 ? 'right' : 'left';
        const shoulder = labeled.find(p => p.name === `${side}Shoulder`);
        const elbow = labeled.find(p => p.name === `${side}Elbow`);
        const wrist = labeled.find(p => p.name === `${side}Wrist`);
        const hip = labeled.find(p => p.name === `${side}Hip`);
        const ankle = labeled.find(p => p.name === `${side}Ankle`);

        if (shoulder && elbow && wrist && hip && ankle) {
          const angle = calculateAngle(shoulder, elbow, wrist);
          setElbowAngle(angle.toFixed(1));

          let state = '';
          if (angle > 160) {
            state = 'Top Position (Plank)';
            if (!isLowering) {
              setPushupCount(prev => prev + 1);
              setIsLowering(true);
            }
          } else if (angle > 90 && angle <= 160) {
            state = 'Lowering Down';
            setIsLowering(true);
          } else if (angle <= 90) {
            state = 'Bottom of Push-Up';
          } else {
            state = 'Not in Push-Up Position';
          }

          setPushupState(`${state} (${side})`);

          const backAngle = calculateAngle(shoulder, hip, ankle);
          const elbowBad = angle > 130 || angle < 75;
          const backBad = backAngle < 150;

          ctx.font = "bold 18px Arial";
          ctx.fillStyle = "#FF3131";

          if (elbowBad) {
            const x = elbow.x * canvasElement.width;
            const y = elbow.y * canvasElement.height;
            ctx.fillText("↙ Elbow angle wrong", x + 10, y - 10);
            setFormCheck("Elbow angle incorrect");
          } else if (backBad) {
            const x = hip.x * canvasElement.width;
            const y = hip.y * canvasElement.height;
            ctx.fillText("⬇ Back sagging", x + 10, y - 10);
            setFormCheck("Back not aligned");
          } else {
            setFormCheck("Good form!");
          }

          // Visibility check
          const requiredParts = ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'];
          const notVisible = requiredParts.some(part => {
            const lm = labeled.find(p => p.name === part);
            return !lm || lm.visibility < 0.15;
          });

          let postureMessage = '';
          let color = '';

          if (notVisible) {
            postureMessage = "📸 Please come fully in frame";
            color = '#FF9F00';
          } else {
            const postureCorrect = !elbowBad && !backBad;
            postureMessage = postureCorrect ? "✅ Good Posture" : "❌ Bad Posture";
            color = postureCorrect ? '#00FF00' : '#FF3131';
          }

          ctx.font = "bold 24px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = color;
          ctx.fillText(postureMessage, canvasElement.width / 2, 40);

          window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color, lineWidth: 4 });
          window.drawLandmarks(ctx, results.poseLandmarks, { color, lineWidth: 2 });

          setTip("Lower your chest fully and keep your body straight.");
        }
      }

      ctx.restore();
    });

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          updateCanvasSize();

          const detectLoop = async () => {
            if (videoRef.current.readyState >= 2) {
              await pose.send({ image: videoRef.current });
            }
            setTimeout(detectLoop, 100);
          };

          detectLoop();
        };
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startCamera();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      const stream = videoElement.srcObject;
      stream?.getTracks()?.forEach(track => track.stop());
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isLowering]);

  const progress = Math.min(Math.max((180 - elbowAngle) / 90 * 100, 0), 100);

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-[#0f1117] min-h-screen text-white p-4">
      <div className="flex-1 flex flex-col gap-4">
       <div className="relative w-full max-w-2xl mx-auto aspect-[3/4] md:aspect-[4/3] rounded-lg overflow-hidden border-2 border-primary-600 bg-black self-center">

          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-md">
            <h4 className="text-red-400 text-lg font-semibold mb-2">🚨 Form Check</h4>
            <p className={formCheck.includes('incorrect') || formCheck.includes('not') ? 'text-red-500' : 'text-green-400 text-sm'}>
              {formCheck}
            </p>
          </div>
          <div className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-md">
            <h4 className="text-green-400 text-lg font-semibold mb-2">💡 Tips</h4>
            <ul className="list-disc list-inside text-sm text-gray-300">
              {tip ? tip.split('.').filter(Boolean).map((line, i) => (
                <li key={i}>{line.trim()}.</li>
              )) : <li>No tips yet.</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-20 justify-center">
        <div className="bg-gray-900 rounded-xl p-4 shadow-md border border-gray-800">
          <h3 className="text-primary-600 text-lg font-semibold mb-4">🧍‍♂️ Push-Up Tracking</h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-yellow-400 font-semibold">State: {pushupState}</span>
              <span className="text-blue-400 font-mono">{elbowAngle}°</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-[#39FF14] to-[#FF3131]" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Push-Ups Completed:</span>
            <span className="text-[#39FF14] font-bold text-2xl font-mono">{pushupCount}</span>
          </div>
        </div>
        <div className="mt-6 hidden lg:block">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold mb-2">How to use</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ensure you're on a flat surface with full-body visibility.</li>
              <li>Perform push-ups with a straight back and chest lowering fully.</li>
              <li>Elbows should bend to ~90° at the bottom.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushupDetector;
