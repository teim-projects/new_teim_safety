
// src/views/CheckView.jsx

import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Download, Mail } from 'lucide-react'; 
import emailjs from '@emailjs/browser'; // EmailJS import

const API_ENDPOINT = 'http://teimsafety.com/api/predict/';
 // YOLO API

const CheckView = ({ checkType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- File selection ---
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setProcessedImageUrl(null);
    setError(null);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  // --- Upload to YOLO API ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image file to upload.");
      return;
    }

    if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);

    setLoading(true);
    setError(null);
    setProcessedImageUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(API_ENDPOINT, { method: 'POST', body: formData });
      if (response.ok) {
        const imageBlob = await response.blob();
        setProcessedImageUrl(URL.createObjectURL(imageBlob));
      } else {
        const errorText = await response.text();
        let errorMessage = `Server responded with status ${response.status}.`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          console.error('Non-JSON error response:', errorText);
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setError("Network error: Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  // --- Send Email for PPE ---
  const handleSendPPEEmail = () => {
    const message = "PPE has been checked for the selected image.";

    emailjs
      .send(
        "service_4ku5fmq",       // replace with your EmailJS service ID
        "template_ppe",          // PPE template ID
        { title: message },      // template variable
        "M3qxulbWtcwpbhfQS"     // replace with your EmailJS public key
      )
      .then(
        (response) => {
          console.log("PPE email sent successfully!", response.status, response.text);
          alert("PPE email sent successfully!");
        },
        (err) => {
          console.error("Failed to send PPE email. Error:", err);
          alert("Failed to send PPE email. Check console.");
        }
      );
  };

  // --- Send Email for Machine ---
  const handleSendMachineEmail = () => {
    const message = "Warning: Some machines have not passed the quality check. Immediate action required!";

    emailjs
      .send(
        "service_eac785b",       // replace with your EmailJS service ID
        "template_resphar",      // Machine template ID
        { title: message },      // template variable
        "M3qxulbWtcwpbhfQS"     // replace with your EmailJS public key
      )
      .then(
        (response) => {
          console.log("Machine email sent successfully!", response.status, response.text);
          alert("Machine email sent successfully!");
        },
        (err) => {
          console.error("Failed to send Machine email. Error:", err);
          alert("Failed to send Machine email. Check console.");
        }
      );
  };

  // --- Cleanup object URLs ---
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    };
  }, [previewUrl, processedImageUrl]);

  // --- PPE Check UI ---
  const renderPPECheck = () => (
    <div className="space-y-8 relative">
      <h2 className="text-3xl font-bold text-gray-800 text-center">
        PPE Compliance Image Analysis
      </h2>
      
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="p-8 bg-white rounded-xl shadow-lg border border-indigo-200">
        <div className="flex flex-col items-center space-y-4">
          <label className="w-full">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg" 
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="cursor-pointer bg-indigo-100 border border-indigo-300 text-indigo-700 py-3 px-6 rounded-lg text-center font-semibold hover:bg-indigo-200 transition flex items-center justify-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              {selectedFile ? selectedFile.name : "Choose Image File (JPG, PNG)"}
            </div>
          </label>
          
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full sm:w-1/2 mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? 'Analyzing Image...' : 'Run PPE Check'}
          </button>
        </div>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center p-10">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-indigo-600 font-medium">Processing image with YOLOv8...</p>
        </div>
      )}

      {/* Preview & Processed Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {previewUrl && (
          <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-3 flex items-center">
              <Camera className="w-5 h-5 mr-2" /> Original Image
            </h3>
            <img src={previewUrl} alt="Original Upload" className="w-full max-h-96 object-contain rounded-lg shadow-inner" />
          </div>
        )}

        {processedImageUrl && (
          <div className="p-4 bg-white rounded-xl shadow-lg border-2 border-green-400">
            <h3 className="text-xl font-bold text-green-700 mb-3 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" /> Detection Output
            </h3>
            <img src={processedImageUrl} alt="Processed Output" className="w-full max-h-96 object-contain rounded-lg shadow-md" />
            <a 
              href={processedImageUrl} 
              download="processed_ppe_detection.jpg" 
              className="mt-4 inline-flex items-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
            >
              <Download className="w-4 h-4 mr-2" /> Download Result
            </a>
          </div>
        )}
      </div>

      {/* Send PPE Email Button */}
      <button
        onClick={handleSendPPEEmail}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition font-semibold flex items-center space-x-2"
      >
        <Mail className="w-5 h-5" />
        <span>Send PPE Email</span>
      </button>
    </div>
  );

  // --- Machine Quality Check UI ---
  const renderMachineCheck = () => {
    const checkpoints = [
      { id: 1, name: "LOCK", status: "Passed", datetime: "2025-10-06 09:15" },
      { id: 2, name: "WIRES", status: "Not Passed", datetime: "2025-10-06 09:45" },
      { id: 3, name: "LOGO", status: "Passed", datetime: "2025-10-06 10:00" },
      { id: 4, name: "STICKERS", status: "Not Passed", datetime: "2025-10-06 10:30" },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Machine Quality Check</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left font-medium text-gray-700">Checkpoint</th>
                <th className="py-3 px-6 text-left font-medium text-gray-700">Status</th>
                <th className="py-3 px-6 text-left font-medium text-gray-700">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map((cp) => (
                <tr key={cp.id} className={cp.status === "Not Passed" ? "bg-red-100" : "bg-green-100"}>
                  <td className="py-3 px-6">{cp.name}</td>
                  <td className={`py-3 px-6 font-semibold ${cp.status === "Not Passed" ? "text-red-700" : "text-green-700"}`}>{cp.status}</td>
                  <td className="py-3 px-6">{cp.datetime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Send Machine Email Button */}
        <div className="text-center mt-6">
          <button
            onClick={handleSendMachineEmail}
            className="bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-red-700 transition"
          >
            Send Machine Warning Email
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {checkType === 'PPE' ? renderPPECheck() : renderMachineCheck()}
    </div>
  );
};

export default CheckView;


