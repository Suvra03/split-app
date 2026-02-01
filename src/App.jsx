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
          <a
            href="https://github.com/Suvra03"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 transition-all"
          >
            <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors text-xs font-medium">Design & Developed by</span>
            <span className="text-green-500/80 font-bold group-hover:text-green-400 transition-all text-xs tracking-tight relative">
              Suvra Kinkar
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-green-500/40 group-hover:w-full transition-all duration-300" />
            </span>
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
