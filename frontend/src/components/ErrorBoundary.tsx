import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, type NavigateFunction } from 'react-router';

interface Props {
  children: ReactNode;
}

interface InnerProps extends Props {
  navigate: NavigateFunction;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryInner extends Component<InnerProps, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoBack = () => {
    this.props.navigate(-1);
  };

  private handleGoHome = () => {
    this.props.navigate('/');
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
          <div className="bg-destructive/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
            <AlertCircle className="text-destructive h-10 w-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">出错了</h1>
          <p className="text-muted-foreground mb-8 max-w-[500px]">
            抱歉，发生了一个意外错误。您可以尝试刷新页面、返回上一页或返回首页。
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={this.handleGoBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回上一页
            </Button>
            <Button onClick={this.handleReload} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              刷新页面
            </Button>
            <Button onClick={this.handleGoHome} className="gap-2">
              <Home className="h-4 w-4" />
              返回首页
            </Button>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="bg-muted text-muted-foreground mt-12 w-full max-w-2xl overflow-auto rounded-lg p-4 text-left font-mono text-sm">
              <p className="mb-2 font-bold text-red-500">{this.state.error.toString()}</p>
              <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ErrorBoundaryInner key={location.pathname} navigate={navigate}>
      {children}
    </ErrorBoundaryInner>
  );
}
