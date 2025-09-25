import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { MainSidebar } from './components/MainSidebar';

function App() {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <main>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
