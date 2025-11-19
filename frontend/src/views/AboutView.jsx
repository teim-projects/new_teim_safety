import React from 'react';
import { Mail, Shield, Zap, Info } from 'lucide-react';

const AboutView = ({ onNavigate }) => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-2xl">
        
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-indigo-700 mb-4 flex items-center justify-center">
            <Info className="w-10 h-10 mr-3" />
            About TEIM Platform
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Quality Checking and Analysis
          </p>
        </header>

        <section className="space-y-10">
          
          {/* Mission */}
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6 p-6 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 shadow-sm">
            <Zap className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                Our core mission is to revolutionize industrial quality control and safety by deploying advanced Computer Vision and Machine Learning models. TEIM provides real-time analysis for both **Machine Quality Checks** and **Personal Protective Equipment (PPE) compliance**, significantly reducing human error and boosting operational efficiency and worker safety.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b pb-2">Key Capabilities</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">PPE Compliance Monitoring</h3>
                  <p className="text-gray-600 text-sm">Automated detection of required safety gear (helmets, gloves, vests) to ensure a safe working environment and instant hazard alerts.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Zap className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">Machine Quality Checkpoints</h3>
                  <p className="text-gray-600 text-sm">Video analysis to confirm that industrial machinery operations meet all predetermined quality standards and critical checkpoints.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Mail className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">Real-time Notifications</h3>
                  <p className="text-gray-600 text-sm">Receive immediate alerts regarding failures in quality checks or breaches in safety protocols.</p>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="text-center pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-indigo-700 mb-3">Get Started</h3>
            <p className="text-gray-600 mb-4">
              If you are not yet logged in, access the platform to start using our AI services.
            </p>
            <button
              onClick={() => onNavigate('Login')}
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>

        </section>
      </div>
    </div>
  );
};

export default AboutView;