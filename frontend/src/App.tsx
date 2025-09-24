import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from './components/MainSidebar';

function App() {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
