export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-2xl text-center border border-purple-200">
        <h1 className="text-4xl font-extrabold text-purple-700 mb-4">Welcome to PM2 Dashboard</h1>
        <p className="text-gray-600 mb-8 text-base">
          Manage and monitor your Node.js processes with ease. Log in to get real-time status, memory & CPU usage, domain mapping, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/auth/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-200">
              Login to Continue
            </button>
          </a>

          <a href="/auth/dashboard/home" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-white text-purple-700 border-2 border-purple-700 hover:bg-purple-100 text-lg font-semibold py-3 px-8 rounded-xl shadow-md transition-all duration-200">
              Already Logged In? Click to Continue
            </button>
          </a>
        </div>
      </div>
    </main>
  );
}
