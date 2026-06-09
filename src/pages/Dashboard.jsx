import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"



export default function Dashboard() {

  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState("Applied")
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [editId, setEditId] = useState(null)
  const [platform, setPlatform] = useState("")

  const [loading, setLoading] = useState(true)
  // FETCH JOBS
  const fetchJobs = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)

    setJobs(data || [])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs()
  }, [])

  // ADD JOB
  const handleAddJob = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert("Login first")

    if (!company || !role) return alert("Fill all fields")

    const { error } = await supabase.from("jobs").insert([
      { company, role, status, platform, user_id: user.id }
    ])

    if (error) alert(error.message)
    else {
      setCompany("")
      setRole("")
      setStatus("Applied")
      fetchJobs()
    }
  }

  // EDIT CLICK
  const handleEdit = (job) => {
    setCompany(job.company)
    setRole(job.role)
    setStatus(job.status)
    setEditId(job.id)
    setPlatform(job.platform || "")
  }

  // UPDATE JOB
  const updateJob = async () => {
    const { error } = await supabase
      .from("jobs")
      .update({ company, role, status, platform })
      .eq("id", editId)

    if (error) alert(error.message)
    else {
      setEditId(null)
      setCompany("")
      setRole("")
      setStatus("Applied")
      fetchJobs()
    }
  }

  // DELETE
  const deleteJob = async (id) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) alert(error.message)
    else fetchJobs()
  }

  // STATS
  const total = jobs.length
  const applied = jobs.filter(j => j.status === "Applied").length
  const interview = jobs.filter(j => j.status === "Interview").length
  const rejected = jobs.filter(j => j.status === "Rejected").length
  const successRate = total === 0 ? 0 : ((interview / total) * 100).toFixed(1)

  // FILTER + SEARCH
  const filteredJobs = jobs.filter((job) => {
    const matchStatus = filter === "All" || job.status === filter
    const matchSearch = job.company.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })
  const chartData = [
    { name: "Applied", value: applied },
    { name: "Interview", value: interview },
    { name: "Rejected", value: rejected },
  ]

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (!error) {
      navigate("/")
    }
  }
  return (
    <motion.div>
      <div className="p-4 sm:p-6 text-white max-w-5xl mx-auto">

        {/* 🔝 NAVBAR */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide">
            Smart<span className="text-cyan-400">Hire</span>
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 cursor-pointer hover:bg-red-500/40 border border-red-500/40 rounded-xl"
          >
            Logout
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          {[
            { label: "Total", value: total },
            { label: "Applied", value: applied },
            { label: "Interview", value: interview },
            { label: "Rejected", value: rejected },
            { label: "Success", value: `${successRate}%` }
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4"
            >
              <p className="text-gray-400 text-sm">{item.label}</p>
              <h2 className="text-2xl font-bold text-cyan-300">{item.value}</h2>
            </motion.div>
          ))}
        </div>

        <div className="bg-gray-900 p-4 sm:p-5 rounded mb-6 w-full min-h-[320px]">
          <h2 className="text-lg mb-4">Applications Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">

          <input
            placeholder="Search company..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-2 flex-wrap">
            {["All", "Applied", "Interview", "Rejected"].map((f) => (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-xl border cursor-pointer transition ${filter === f
                  ? "bg-cyan-500 text-black"
                  : "bg-white/5 border-white/10"
                  }`}
              >
                {f}
              </motion.button>
            ))}
          </div>

        </div>

        {/*  ADD / EDIT FORM */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 mb-8">

          <h2 className="text-lg mb-4 text-cyan-300">
            {editId ? "Edit Application" : "Add New Application"}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">

            <input
              placeholder="Company"
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />

            <input
              placeholder="Role"
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <input
              placeholder="Platform (LinkedIn, Naukri...)"
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />

            <select
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Rejected</option>
            </select>

          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={editId ? updateJob : handleAddJob}
            className="mt-5 px-6 py-3 bg-cyan-500 text-black cursor-pointer rounded-xl font-semibold"
          >
            {editId ? "Update Job" : "Add Job"}
          </motion.button>

        </div>
        {loading && (
          <div className="text-center text-gray-400 py-10">
            Loading jobs...
          </div>
        )}
        {/*JOB LIST */}

        <div className="grid gap-4">

          {filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 flex justify-between items-center"
            >

              <div>
                <h3 className="text-lg font-bold text-white">{job.company}</h3>
                <p className="text-gray-400">{job.role}</p>
                <p className="text-sm text-purple-300">
                  {job.platform}
                </p>

                <span className="text-sm text-cyan-300">
                  {job.status}
                </span>
              </div>

              <div className="flex gap-3">

                <button
                  onClick={() => handleEdit(job)}
                  className="text-cyan-400 hover:text-cyan-200"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteJob(job.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>

              </div>

            </motion.div>
          ))}

        </div>
      </div>
    </motion.div>
  )
}

// 📦 REUSABLE CARD
const Card = ({ title, value }) => (
  <motion.div
    className="bg-gray-800 p-4 rounded"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.05 }}
  >
    <h2 className="text-sm text-gray-400">{title}</h2>
    <p className="text-2xl font-bold">{value}</p>
  </motion.div>
)