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

const PoseDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtx = useRef(null);

  const [squatState, setSquatState] = useState('You are not standing and coming in frame 🫠');
  const [squatAngle, setSquatAngle] = useState(0);
  const [squatCount, setSquatCount] = useState(0);
  const [isInDescent, setIsInDescent] = useState(false);

  const [formCheck, setFormCheck] = useState('Ensure your full body is visible');
  const [tip, setTip] = useState('');

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
    if (typeof window === 'undefined') return;
    let pose = null;
    const initPose = () => {
      try {
        // Use the global Pose class provided by the CDN script
        pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
    
        pose.onResults(onResults);
        startCamera(pose);
      } catch (error) {
        console.error("Error initializing pose detection:", error);
      }
    };
    

    const onResults = (results) => {
      const canvas = canvasRef.current;
      const ctx = canvasCtx.current;
      const video = videoRef.current;

      if (!ctx || !canvas || !video) return;

      updateCanvasSize();
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        const labeledData = results.poseLandmarks.map((lm, i) => ({
          name: landmarkNames[i],
          ...lm,
        }));

        const useLeft = labeledData.find(p => p.name === 'leftAnkle')?.visibility > 0.1 &&
                        labeledData.find(p => p.name === 'leftKnee')?.visibility > 0.1 &&
                        labeledData.find(p => p.name === 'leftHip')?.visibility > 0.1;

        const useRight = labeledData.find(p => p.name === 'rightAnkle')?.visibility > 0.1 &&
                         labeledData.find(p => p.name === 'rightKnee')?.visibility > 0.1 &&
                         labeledData.find(p => p.name === 'rightHip')?.visibility > 0.1;

        let state = '';
        if (useLeft || useRight) {
          const side = useLeft ? 'left' : 'right';
          const ankle = labeledData.find(p => p.name === `${side}Ankle`);
          const knee = labeledData.find(p => p.name === `${side}Knee`);
          const hip = labeledData.find(p => p.name === `${side}Hip`);

          const verticalAngle = calculateAngle(ankle, knee, hip);
          setSquatAngle(verticalAngle.toFixed(1));

          if (verticalAngle >= 160) {
            state = 'Standing (Start/End Position)';
            if (isInDescent) {
              setSquatCount(prev => prev + 1);
              setIsInDescent(false);
            }
          } else if (verticalAngle >= 120) {
            state = 'Descent Phase';
            if (!isInDescent) setIsInDescent(true);
          } else if (verticalAngle >= 75) {
            state = 'Bottom of Squat';
          } else {
            state = 'Ascent Phase (Coming Up)';
          }

          setSquatState(`${state} (${side} side)`);

          const backAngle = calculateAngle(
            labeledData.find(p => p.name === `${side}Shoulder`),
            labeledData.find(p => p.name === `${side}Hip`),
            labeledData.find(p => p.name === `${side}Knee`)
          );

          const kneeAngle = calculateAngle(
            labeledData.find(p => p.name === `${side}Ankle`),
            labeledData.find(p => p.name === `${side}Knee`),
            labeledData.find(p => p.name === `${side}Hip`)
          );

          if (backAngle < 120) {
            setFormCheck('Back angle too forward');
          } else if (kneeAngle > 160) {
            setFormCheck('Knees not bent enough');
          } else {
            setFormCheck('Back and knee posture good');
          }
        }

        const requiredParts = ['leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle'];

        const notVisible = requiredParts.some(part => {
          const lm = labeledData.find(p => p.name === part);
          return !lm || lm.visibility < 0.15;
        });
        
        let postureMessage = '';
        let color = '';
        
        if (notVisible) {
          postureMessage = "📸 Please come fully in frame";
          color = '#FF9F00'; // orange
        } else {
          const postureCorrect =
            formCheck.includes('good') &&
            (squatState.includes('Standing') || squatState.includes('Descent') || squatState.includes('Bottom'));
        
          postureMessage = postureCorrect ? "✅ Correct Posture" : "❌ Wrong Posture";
          color = postureCorrect ? '#00FF00' : '#FF0000';
        }
        
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = color;
        ctx.fillText(postureMessage, canvas.width / 2, 40);
        
        window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS, { color, lineWidth: 4 });

        window.drawLandmarks(ctx, results.poseLandmarks, { color, lineWidth: 2 });

        setTip('Keep your back straight and chest up throughout the movement.');
      }

      ctx.restore();
    };
    const startCamera = async (poseInstance) => {
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
              await poseInstance.send({ image: videoRef.current });
            }
            setTimeout(detectLoop, 100);
          };
    
          detectLoop();
        };
    
        videoRef.current.onpause = () => {
          console.log("Video paused, attempting to resume...");
          videoRef.current.play(); // Try to resume video if it gets paused
        };
    
        videoRef.current.onerror = (err) => {
          console.error("Error with video stream:", err);
          // Handle errors, such as trying to restart the stream or prompt the user to grant permissions again
        };
      } catch (err) {
        console.error("Error starting webcam:", err);
      }
    };
    

    canvasCtx.current = canvasRef.current.getContext('2d');
    initPose();

    window.addEventListener('resize', updateCanvasSize);
    return () => {
      const stream = videoRef.current?.srcObject;
      stream?.getTracks()?.forEach(track => track.stop());
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isInDescent]);

  const progress = Math.min(Math.max((180 - squatAngle) / 100 * 100, 0), 100);

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
            <p className={formCheck.includes('too') ? 'text-red-500' : 'text-green-400 text-sm'}>
              {formCheck}
            </p>
          </div>
          <div className="flex-1 bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-md">
            <h4 className="text-green-400 text-lg font-semibold mb-2">💡 Tips</h4>
            <ul className="list-disc list-inside text-sm text-gray-300">
              {tip
                ? tip.split('.').filter(Boolean).map((line, i) => (
                    <li key={i}>{line.trim()}.</li>
                  ))
                : <li>No tips yet.</li>}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-20 justify-center">
        <div className="bg-gray-900 rounded-xl p-4 shadow-md border border-gray-800">
          <h3 className="text-primary-600 text-lg font-semibold mb-4">🏋️‍♂️ Squat Tracking</h3>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-yellow-400 font-semibold">State: {squatState}</span>
              <span className="text-blue-400 font-mono">{squatAngle}°</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-[#39FF14] to-[#FF3131]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Squats Completed:</span>
            <span className="text-[#39FF14] font-bold text-2xl font-mono">{squatCount}</span>
          </div>
        </div>
        <div className="mt-6 hidden lg:block">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold mb-2">How to use</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ensure you are in a well-lit area with proper posture.</li>
              <li>Perform squats while keeping your knees aligned with your toes.</li>
              <li>Adjust your camera to ensure your full body is visible.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoseDetector;
