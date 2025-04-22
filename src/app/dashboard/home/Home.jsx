"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import {
  RefreshCw,
  LogOut,
  Play,
  Square,
  RotateCw,
  Info,
  Edit,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export default function Pm2Dashboard() {
  const router = useRouter()
  const [processes, setProcesses] = useState([])
  const [currentProcessName, setCurrentProcessName] = useState(null)
  const [metadata, setMetadata] = useState({
    domain_name: "",
    public_ip: "",
    private_ip: "",
    type: "",
  })
  const [showModal, setShowModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [isProcessing, setIsProcessing] = useState({
    start: null,
    stop: null,
    restart: null,
  })

  useEffect(() => {
    listProcesses()
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
  }

  const listProcesses = async () => {
    try {
      setIsRefreshing(true)
      setError(null)

      const res = await fetch(`${apiUrl}/api/dashboard/processes`, {
        method: "GET",
        credentials: "include"
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch processes: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      setProcesses(data.data || [])
      showNotification("Processes refreshed successfully")
    } catch (err) {
      console.error("Error fetching processes:", err)
      setError(err.message || "Failed to fetch processes")
      showNotification("Failed to refresh processes", "error")
    } finally {
      setIsRefreshing(false)
    }
  }

  const logout = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      const res = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "GET",
        credentials: "include"
      })

      if (!res.ok) {
        setError("Something went wrong")
        throw new Error(`Failed to fetch processes: ${res.status} ${res.statusText}`)
      }
      showNotification("Logged out successfully")
      router.push("/auth/login")
    }
    catch (error) {
      setError(error.message)
      throw new Error("failed to logout")
    }
    finally {
      setIsRefreshing(true)
    }
  }

  const startProcess = async (name) => {
    try {
      setIsProcessing({ ...isProcessing, start: name })
      setError(null)

      const res = await fetch(`${apiUrl}/api/dashboard/process/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include"
      })

      if (!res.ok) {
        throw new Error(`Failed to start process: ${res.status} ${res.statusText}`)
      }

      await listProcesses()
      showNotification(`Process ${name} started successfully`)
    } catch (err) {
      console.error("Error starting process:", err)
      setError(err.message || "Failed to start process")
      showNotification(`Failed to start process ${name}`, "error")
    } finally {
      setIsProcessing({ ...isProcessing, start: null })
    }
  }

  const stopProcess = async (name) => {
    try {
      const confirmed = window.confirm("Are you sure you want to stop this process?")
      if (!confirmed) return

      setIsProcessing({ ...isProcessing, stop: name })
      setError(null)

      const res = await fetch(`${apiUrl}/api/dashboard/process/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include"
      })

      if (!res.ok) {
        throw new Error(`Failed to stop process: ${res.status} ${res.statusText}`)
      }

      await listProcesses()
      showNotification(`Process ${name} stopped successfully`)
    } catch (err) {
      console.error("Error stopping process:", err)
      setError(err.message || "Failed to stop process")
      showNotification(`Failed to stop process ${name}`, "error")
    } finally {
      setIsProcessing({ ...isProcessing, stop: null })
    }
  }

  const restartProcess = async (name) => {
    try {
      setIsProcessing({ ...isProcessing, restart: name })
      setError(null)

      const res = await fetch(`${apiUrl}/api/dashboard/process/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include"
      })

      if (!res.ok) {
        throw new Error(`Failed to restart process: ${res.status} ${res.statusText}`)
      }

      await listProcesses()
      showNotification(`Process ${name} restarted successfully`)
    } catch (err) {
      console.error("Error restarting process:", err)
      setError(err.message || "Failed to restart process")
      showNotification(`Failed to restart process ${name}`, "error")
    } finally {
      setIsProcessing({ ...isProcessing, restart: null })
    }
  }

  const viewProcessByUUID = (uuid) => {
    if (!uuid || uuid === "undefined") {
      showNotification("No details found for this process", "error")
      return
    }
    router.push(`/dashboard/details?uuid=${uuid}`)
  }

  const viewLogs = (name) => {
    window.location.href = `/logs?name=${name}`
  }

  const openUpdateMetadataModal = async (name) => {
    try {
      setCurrentProcessName(name)
      setError(null)

      const response = await fetch(`${apiUrl}/api/dashboard/process/${name}`, {
        method: "GET",
        credentials: "include"
      })

      if (!response.ok) {
        if (response.status === 404) {
          setMetadata({
            domain_name: "",
            public_ip: "",
            private_ip: "",
            type: "",
          })
        } else {
          throw new Error(`Failed to fetch process metadata: ${response.status} ${response.statusText}`)
        }
      } else {
        const process = await response.json()
        const { domain_name, public_ip, private_ip, type } = process.data
        setMetadata({
          domain_name: domain_name || "",
          public_ip: public_ip || "",
          private_ip: private_ip || "",
          type: type || "",
        })
      }

      setShowModal(true)
    } catch (err) {
      console.error("Error fetching process metadata:", err)
      setError(err.message || "Failed to fetch process metadata")
      showNotification(`Failed to fetch metadata for ${name}`, "error")
    }
  }

  const updateMetadata = async () => {
    try {
      setError(null)
      console.log('processName', currentProcessName);
      const res = await fetch(`${apiUrl}/api/dashboard/process/${currentProcessName}/update-meta-data`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentProcessName, ...metadata }),
        credentials: "include"
      });

      if (!res.ok) {
        throw new Error(`Failed to update metadata: ${res.status} ${res.statusText}`);
      }

      showNotification("Metadata updated successfully")
      setShowModal(false)
      await listProcesses()
    } catch (err) {
      console.error("Error updating metadata:", err)
      setError(err.message || "Failed to update metadata")
      showNotification("Failed to update metadata", "error")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">PM2 Dashboard</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between ${notification.type === "error"
                ? "bg-red-50 text-red-700 border-l-4 border-red-500"
                : "bg-green-50 text-green-700 border-l-4 border-green-500"
              }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "error" ? (
                <AlertTriangle size={20} className="text-red-500" />
              ) : (
                <CheckCircle size={20} className="text-green-500" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-6">
          <button
            className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 ${isRefreshing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            onClick={listProcesses}
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Processes"}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border-l-4 border-red-500 flex items-center gap-2">
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Port
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Memory
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    CPU
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Domain
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                      {isRefreshing ? (
                        <div className="flex flex-col items-center">
                          <RefreshCw size={24} className="animate-spin text-indigo-500 mb-2" />
                          <span>Loading processes...</span>
                        </div>
                      ) : (
                        "No processes found"
                      )}
                    </td>
                  </tr>
                ) : (
                  processes.map((proc) => (
                    <tr
                      key={proc.uuid || `${proc.name}-${proc.process_id}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proc.process_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proc.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.port || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${proc.status === "online" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {proc.status === "online" ? "Running" : "Stopped"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(proc.memory / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.cpu}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {proc.domain_name ? (
                          <a
                            href={`http://${proc.domain_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                          >
                            {proc.domain_name}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                        <div className="flex flex-wrap gap-1">
                          <button
                            className={`inline-flex items-center px-2 py-1 text-xs rounded ${proc.status === "online"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-green-700 bg-green-100 hover:bg-green-200"
                              }`}
                            onClick={() => startProcess(proc.name)}
                            disabled={proc.status === "online" || isProcessing.start === proc.name}
                          >
                            {isProcessing.start === proc.name ? (
                              <RefreshCw size={14} className="animate-spin mr-1" />
                            ) : (
                              <Play size={14} className="mr-1" />
                            )}
                            Start
                          </button>

                          <button
                            className={`inline-flex items-center px-2 py-1 text-xs rounded ${proc.status === "stopped"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-700 bg-red-100 hover:bg-red-200"
                              }`}
                            onClick={() => stopProcess(proc.name)}
                            disabled={proc.status === "stopped" || isProcessing.stop === proc.name}
                          >
                            {isProcessing.stop === proc.name ? (
                              <RefreshCw size={14} className="animate-spin mr-1" />
                            ) : (
                              <Square size={14} className="mr-1" />
                            )}
                            Stop
                          </button>

                          <button
                            className="inline-flex items-center px-2 py-1 text-xs rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                            onClick={() => restartProcess(proc.name)}
                            disabled={isProcessing.restart === proc.name}
                          >
                            {isProcessing.restart === proc.name ? (
                              <RefreshCw size={14} className="animate-spin mr-1" />
                            ) : (
                              <RotateCw size={14} className="mr-1" />
                            )}
                            Restart
                          </button>

                          <button
                            className="inline-flex items-center px-2 py-1 text-xs rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            onClick={() => viewProcessByUUID(proc.uuid)}
                          >
                            <Info size={14} className="mr-1" />
                            Details
                          </button>

                          <button
                            className="inline-flex items-center px-2 py-1 text-xs rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                            onClick={() => openUpdateMetadataModal(proc.name)}
                          >
                            <Edit size={14} className="mr-1" />
                            Update
                          </button>

                          <button
                            className="inline-flex items-center px-2 py-1 text-xs rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                            onClick={() => viewLogs(proc.name)}
                          >
                            <FileText size={14} className="mr-1" />
                            Logs
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Update Metadata Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold">Update Metadata for {currentProcessName}</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="example.com"
                  value={metadata.domain_name}
                  onChange={(e) => setMetadata({ ...metadata, domain_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public IP</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123.456.789.0"
                  value={metadata.public_ip}
                  onChange={(e) => setMetadata({ ...metadata, public_ip: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Private IP</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="10.0.0.1"
                  value={metadata.private_ip}
                  onChange={(e) => setMetadata({ ...metadata, private_ip: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="web, api, worker, etc."
                  value={metadata.type}
                  onChange={(e) => setMetadata({ ...metadata, type: e.target.value })}
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                onClick={updateMetadata}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
