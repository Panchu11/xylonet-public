export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#01C38E]/30 border-t-[#01C38E] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading Analytics...</p>
      </div>
    </div>
  )
}
