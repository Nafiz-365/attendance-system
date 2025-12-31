import { TeacherSidebar } from "@/components/layout/teacher-sidebar"
import { Header } from "@/components/layout/header"

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <TeacherSidebar />
            <div className="flex-1 ml-64 flex flex-col transition-all duration-300">
                <Header />
                <main className="flex-1 p-8 bg-background overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
