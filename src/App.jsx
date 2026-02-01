import { SplitProvider } from './contexts/SplitContext'
import PeopleManager from './components/features/PeopleManager'
import ItemManager from './components/features/ItemManager'
import Summary from './components/features/Summary'
import BalanceCards from './components/features/BalanceCards'
import ReportsPage from './components/ReportsPage'
import { motion } from 'framer-motion'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './index.css'

function Dashboard() {
  return (
    <div className="relative z-10 max-w-lg mx-auto space-y-6 pb-32">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="pt-8 mb-4 px-2"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-zinc-500 text-sm font-bold tracking-widest uppercase mb-1">27 JAN 2026</p>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
              SplitApp
            </h1>
          </div>
          <Link to="/reports" className="text-xs text-zinc-500 hover:text-green-400 transition-colors uppercase font-bold tracking-widest border border-zinc-800 px-3 py-1 rounded-full">
            History
          </Link>
        </div>

        <div className="h-0.5 w-full bg-gradient-to-r from-green-500 to-transparent mt-6 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
      </motion.header>

      <main className="space-y-5 sm:space-y-8">
        <section>
          <PeopleManager />
        </section>

        <section>
          <BalanceCards />
        </section>

        <section>
          <ItemManager />
        </section>

        <section>
          <Summary />
        </section>
      </main>

      <footer className="text-center text-zinc-500 text-sm mt-20 pb-12 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-600">Created with Passion</p>
          <a
            href="https://github.com/Suvra03"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-green-500/30 px-5 py-2.5 rounded-2xl transition-all shadow-xl hover:shadow-green-500/5"
          >
            <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">Design and Developed by</span>
            <span className="text-green-400 font-bold group-hover:text-green-300 transition-colors underline-offset-4 decoration-1 decoration-green-500/30 group-hover:underline">Suvra Kinkar</span>
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
              <img src="https://github.com/Suvra03.png" alt="Suvra Kinkar" className="w-full h-full rounded-full border border-zinc-700" />
            </div>
          </a>
        </div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] opacity-40">© 2026 Split App • Personal Edition</p>
          <ResetButton />
        </div>
      </footer>
    </div>
  )
}

function ResetButton() {
  return (
    <button
      onClick={() => {
        if (window.confirm("WARNING: This will delete ALL your data and reset the app. Continue?")) {
          localStorage.removeItem('split_app_data');
          window.location.reload();
        }
      }}
      className="text-[10px] text-zinc-800 hover:text-red-500 transition-colors uppercase font-bold tracking-widest border border-zinc-900 hover:border-red-900 px-3 py-1 rounded-full cursor-pointer"
    >
      Reset Everything
    </button>
  );
}

function App() {
  return (
    <SplitProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 font-inter selection:bg-green-500/30 overflow-x-hidden relative">
          {/* Animated Background Mesh - Dark Green */}
          <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-green-900/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[100px]" />
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </SplitProvider>
  )
}

export default App
