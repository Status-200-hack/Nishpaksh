'use client'

import { useState } from 'react'
import WebcamCapture from './WebcamCapture'

interface VoterDetailsProps {
  data: any
}

export default function VoterDetails({ data }: VoterDetailsProps) {
  const [faceResult, setFaceResult] = useState<any>(null)
  const [faceError, setFaceError] = useState<string | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)
  const [webcamMode, setWebcamMode] = useState<'register' | 'verify'>('register')

  if (!data) return null

  const voterId = data.epicNumber
  const fullName = data.fullName || `${data.applicantFirstName} ${data.applicantLastName}`

  const handleFaceComplete = (result: any) => {
    setFaceResult(result)
    setFaceError(null)
    setShowWebcam(false)
  }

  const handleFaceError = (error: string) => {
    setFaceError(error)
    setFaceResult(null)
    setShowWebcam(false)
  }

  const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value || 'N/A'}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Voter Details</h2>
        <p className="text-sm text-gray-600 mt-1">Information from Election Commission of India</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <InfoCard
          icon="👤"
          label="Full Name"
          value={data.fullName || `${data.applicantFirstName} ${data.applicantLastName}`}
        />
        <InfoCard
          icon="🆔"
          label="EPIC Number"
          value={data.epicNumber}
        />
        <InfoCard
          icon="👨‍👦"
          label="Relative's Name"
          value={data.relativeFullName || data.relationName}
        />
        <InfoCard
          icon="🔗"
          label="Relation Type"
          value={data.relationType === 'FTHR' ? 'Father' : data.relationType === 'HSBN' ? 'Husband' : data.relationType}
        />
        <InfoCard
          icon="🎂"
          label="Age"
          value={data.age?.toString()}
        />
        <InfoCard
          icon="⚧"
          label="Gender"
          value={data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : data.gender}
        />

        {/* Location Details */}
        <InfoCard
          icon="📍"
          label="State"
          value={data.stateName}
        />
        <InfoCard
          icon="🏙️"
          label="District"
          value={data.districtValue}
        />
        <InfoCard
          icon="🏛️"
          label="Assembly Constituency"
          value={`${data.asmblyName} (AC ${data.acNumber})`}
        />
        <InfoCard
          icon="🏢"
          label="Parliament Constituency"
          value={`${data.prlmntName} (${data.prlmntNo})`}
        />

        {/* Electoral Details */}
        <InfoCard
          icon="📄"
          label="Part Number"
          value={data.partNumber}
        />
        <InfoCard
          icon="#️⃣"
          label="Serial Number"
          value={data.partSerialNumber?.toString()}
        />
        <InfoCard
          icon="🔢"
          label="Section Number"
          value={data.sectionNo?.toString()}
        />
        
        {/* Polling Station Details */}
        <div className="md:col-span-2">
          <InfoCard
            icon="🗳️"
            label="Polling Station"
            value={data.psbuildingName}
          />
        </div>
        <div className="md:col-span-2">
          <InfoCard
            icon="📍"
            label="Polling Station Address"
            value={`${data.buildingAddress} - ${data.psRoomDetails}`}
          />
        </div>
        <div className="md:col-span-2">
          <InfoCard
            icon="📮"
            label="Part Name & Address"
            value={data.partName}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This information is sourced from the Election Commission of India's database.
          Please verify at the polling station on election day.
        </p>
      </div>

      {/* Face Registration/Verification Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Face Recognition</h3>
        
        {!showWebcam && !faceResult && !faceError && (
          <div className="flex gap-3">
            <button
              onClick={() => {
                setWebcamMode('register')
                setShowWebcam(true)
                setFaceError(null)
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              📷 Register Face
            </button>
            <button
              onClick={() => {
                setWebcamMode('verify')
                setShowWebcam(true)
                setFaceError(null)
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              🔍 Verify Face
            </button>
          </div>
        )}

        {showWebcam && (
          <WebcamCapture
            voterId={voterId}
            fullName={fullName}
            mode={webcamMode}
            onComplete={handleFaceComplete}
            onError={handleFaceError}
          />
        )}

        {/* Face Registration Result */}
        {faceResult && webcamMode === 'register' && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-green-900 mb-2">
                  Face Registration Successful!
                </h4>
                <p className="text-green-800 mb-2">{faceResult.message}</p>
                <p className="text-sm text-green-700">
                  Your face has been registered for voter ID: <strong>{voterId}</strong>
                </p>
                <button
                  onClick={() => {
                    setFaceResult(null)
                    setFaceError(null)
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Register Another / Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Face Verification Result */}
        {faceResult && webcamMode === 'verify' && (
          <div className={`mt-6 rounded-lg p-6 ${
            faceResult.verified 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-start gap-4">
              <div className="text-3xl">{faceResult.verified ? '✅' : '⚠️'}</div>
              <div className="flex-1">
                <h4 className={`text-lg font-semibold mb-2 ${
                  faceResult.verified ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {faceResult.verified ? 'Face Verification Successful!' : 'Face Verification Failed'}
                </h4>
                <p className={faceResult.verified ? 'text-green-800' : 'text-yellow-800'}>
                  {faceResult.message}
                </p>
                {faceResult.confidence !== undefined && faceResult.confidence > 0 && (
                  <p className={`text-sm mt-2 ${
                    faceResult.verified ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    Confidence: {(faceResult.confidence * 100).toFixed(1)}%
                  </p>
                )}
                <button
                  onClick={() => {
                    setFaceResult(null)
                    setFaceError(null)
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Face Error */}
        {faceError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">❌</div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-red-900 mb-2">
                  Error
                </h4>
                <p className="text-red-800 mb-2">{faceError}</p>
                <button
                  onClick={() => {
                    setFaceError(null)
                    setShowWebcam(true)
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Raw Data (for debugging) */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
          View Raw Data (Developer)
        </summary>
        <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg text-xs overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}

