import { Outlet } from 'react-router';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar } from './components/MainSidebar';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SidebarProvider>
        <MainSidebar />
        <SidebarInset>
          {/* 移动端顶部操作栏 */}
          <div className="absolute top-2 left-2 z-10 block md:hidden">
            <SidebarTrigger className="hover:bg-neutral-200" />
            <ModeToggle />
          </div>

          <main>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
          <Toaster position="top-right" richColors />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
