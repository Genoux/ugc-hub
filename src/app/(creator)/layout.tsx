export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl p-8">
        {children}
      </div>
    </div>
  )
}
