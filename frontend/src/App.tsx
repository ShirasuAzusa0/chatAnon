import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from './components/MainSidebar';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        {/* 移动端顶部操作栏 */}
        <div className="absolute top-2 left-2 z-10 block md:hidden">
          <SidebarTrigger className="hover:bg-neutral-200" />
        </div>
        <main>
          <Outlet />
        </main>
        <Toaster position="top-right" richColors />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
