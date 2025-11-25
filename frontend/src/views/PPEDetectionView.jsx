import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";

const PPEDetectionView = () => {
  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState([]);
  const [originalMedia, setOriginalMedia] = useState("");
  const [annotatedMedia, setAnnotatedMedia] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef(null);
  const [summary, setSummary] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setIsVideo(selectedFile && selectedFile.type.startsWith("video/"));
  };

  const captureFromWebcam = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("Unable to capture from webcam.");

    // Convert base64 image to File object
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const capturedFile = new File([blob], "webcam_capture.jpg", {
          type: "image/jpeg",
        });
        setFile(capturedFile);
        setIsVideo(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please upload an image or video first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setProgress(30); // Initial progress state

    const res = await axios.post("http://teimsafety.com/api/predict/", formData, {

  headers: { "Content-Type": "multipart/form-data" },
  onUploadProgress: (progressEvent) => {
    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    setProgress(percent);
  },
});


      setProgress(90); // Close to completion

      const data = res.data;
      setDetections(data.detections || []);
      setSummary(data.summary || {});
     

const BASE = "http://teimsafety.com";

if (data.original_image) {
  setOriginalMedia(`${BASE}${data.original_image}`);
}

if (data.annotated_image) {
  setAnnotatedMedia(`${BASE}${data.annotated_image}`);
}



      setProgress(100);
    } catch (err) {
      console.error("Prediction error:", err);
      alert("Something went wrong while detecting PPE.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8 p-4 w-full">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          PPE Detection System
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Upload an image or video to detect Personal Protective Equipment.
        </p>

        <div className="flex justify-center mb-4">
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            className={`px-5 py-2 rounded font-semibold text-white transition-all duration-300 ${
              useWebcam
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {useWebcam ? "Use File Upload" : "Use Webcam"}
          </button>
        </div>

        {!useWebcam ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-3"
          >
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="p-2 border rounded w-full max-w-sm text-gray-700"
            />

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded font-semibold text-white transition-all duration-300 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Upload & Detect"}
            </button>

            {loading && (
              <div className="w-full max-w-sm mt-3">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-600 mt-1">
                  Processing... {progress}%
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg shadow-md w-full max-w-sm"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={captureFromWebcam}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
              >
                Capture
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className={`px-6 py-2 rounded font-semibold text-white transition-all duration-300 ${
                  loading || !file
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : "Detect from Capture"}
              </button>
            </div>
          </div>
        )}
      </div>

      {detections.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Detections
          </h3>

          {Object.keys(summary).length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Summary</h4>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(summary).map(([cls, count]) => (
                  <li key={cls} className="bg-gray-100 px-3 py-1 rounded">
                    <span className="font-medium text-gray-700">{cls}</span>
                    <span className="float-right text-blue-600 font-semibold">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}


      {(originalMedia || annotatedMedia) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {originalMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Original
              </h3>
              {isVideo ? (
                <video
                  src={originalMedia}
                  controls
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              ) : (
                <img
                  src={originalMedia}
                  alt="Original Upload"
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              )}
            </div>
          )}
          {annotatedMedia && (
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Detected PPE
              </h3>
              {isVideo ? (
                <video
                  src={annotatedMedia}
                  controls
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              ) : (
                <img
                  src={annotatedMedia}
                  alt="Detected PPE"
                  className="rounded-lg shadow-lg w-full max-h-[400px] object-contain"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PPEDetectionView;

