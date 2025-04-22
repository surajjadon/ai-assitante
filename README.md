# 🤖 AI Exercise Evaluation

A real-time push-up and sit-up posture detection app using **MediaPipe Pose**, built with **React**, **Tailwind CSS**, and **Vite**.

## 🚀 Features

- 🧍‍♂️ **Push-Up Detection**  
  Detects push-up position, posture, and counts reps based on elbow angles and body alignment.

- 🪑 **Sit-Up Detection**
  Tracks upper body motion and angle change for sit-up evaluation.

- ✅ **Form Check & Tips**  
  Visual and textual feedback for posture correction (e.g., elbow angle, back alignment).

- 🎥 Live video with overlaid landmarks and posture tracking.

## 🧠 Powered by

- [MediaPipe Pose](https://github.com/google/mediapipe) for landmark detection.
- React & Tailwind CSS for UI and component design.
- Vite for fast dev server and bundling.

## 📦 Tech Stack

| Tech        | Use Case                      |
|-------------|-------------------------------|
| React       | Frontend framework            |
| Tailwind CSS| Styling and responsive layout |
| Vite        | Build tool & dev server       |
| MediaPipe   | Pose estimation               |
| Canvas API  | Overlaying landmarks & posture feedback |

## 📸 Screenshots

![Screenshot 2025-04-22 205007](https://github.com/user-attachments/assets/755dee56-82dd-4650-b47a-d7207f474bc4)


## 🛠️ Installation

```bash
# Clone the repo
git clone https://github.com/surajjadon/ai-assitante
cd pushup-detector

# Install dependencies
yarn install  # or npm install

# Run the development server
yarn dev
