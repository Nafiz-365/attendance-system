import { Sidebar } from "@/components/layout/admin-sidebar"
import { Header } from "@/components/layout/header"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-muted/40">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
