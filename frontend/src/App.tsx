import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { MainSidebar } from './components/MainSidebar';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <main>
          <Outlet />
        </main>
        <Toaster position="top-right" richColors />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
