"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Activity, ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

const ProcessDetails = () => {
  const searchParams = useSearchParams()
  const uuid = searchParams.get("uuid")
  const [processData, setProcessData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)

  useEffect(() => {
    if (!uuid) {
      setError("UUID not found")
      setLoading(false)
      return
    }

    const fetchProcessDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${apiUrl}/api/dashboard/process-by-id/${uuid}`,{
          method : "GET",
          credentials : "include"

        })

        if (!response.ok) {
          throw new Error(`Failed to fetch process details: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setProcessData(data)
      } catch (err) {
        console.error("Error fetching process details:", err)
        setError(err.message || "Failed to fetch process details")
      } finally {
        setLoading(false)
      }
    }

    fetchProcessDetails()
  }, [uuid])

  const toggleAdditionalInfo = () => {
    setShowAdditionalInfo(!showAdditionalInfo)
  }

  const refreshProcessDetails = async () => {
    if (!uuid) return

    try {
      setLoading(true)
      const response = await fetch(`${apiUrl}/api/dashboard/process-by-id/${uuid}`, {
        method : "GET",
        credentials : "include"
      })

      if (!response.ok) {
        throw new Error(`Failed to refresh process details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setProcessData(data)
    } catch (err) {
      console.error("Error refreshing process details:", err)
      setError(err.message || "Failed to refresh process details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading process details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-red-100 rounded-full">
            <Activity className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-700">Error Loading Process Details</h2>
          <p className="text-red-600">{error}</p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/dashboard/home/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              onClick={refreshProcessDetails}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!processData) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">No Process Data Found</h2>
          <p className="text-gray-500">The requested process could not be found or has been deleted.</p>
          <Link
            href="/dashboard/home/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const { data } = processData

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/home" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Process Details</h1>
        </div>
        <button
          onClick={refreshProcessDetails}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Refresh process details"
        >
          <RefreshCw className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">PM2 Process Details</h2>
          </div>
        </div>

        {/* Process Info */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Name</span>
                <span className="font-semibold text-gray-900">{data.name}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    data.status === "online" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {data.status === "online" ? "Running" : "Stopped"}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Type</span>
                <span className="font-semibold text-gray-900">{data.type || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Memory</span>
                <span className="font-semibold text-gray-900">{(data.memory / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">CPU</span>
                <span className="font-semibold text-gray-900">{data.cpu}%</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Port</span>
                <span className="font-semibold text-gray-900">{data.port || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Domain</span>
                <span className="font-semibold text-gray-900">
                  {data.domain_name ? (
                    <a
                      href={`http://${data.domain_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {data.domain_name}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Public IP</span>
                <span className="font-semibold text-gray-900">{data.public_ip || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">Private IP</span>
                <span className="font-semibold text-gray-900">{data.private_ip || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="font-medium text-gray-500">UUID</span>
                <span className="font-semibold text-gray-900 break-all">{data.uuid}</span>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={toggleAdditionalInfo}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              showAdditionalInfo
                ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {showAdditionalInfo ? "Hide Additional Info" : "Show Additional Info"}
          </button>

          {/* Additional Info */}
          {showAdditionalInfo && (
            <div className="mt-6 border border-gray-200 rounded-md bg-gray-50">
              <div className="max-h-[400px] overflow-y-auto p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {JSON.stringify(processData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProcessDetails
