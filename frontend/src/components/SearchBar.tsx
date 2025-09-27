import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import homeBgImage from '/home-bg.png';
import { useState, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  isSearching?: boolean;
  param?: string;
}

function SearchBar({ isSearching = false, param }: SearchBarProps) {
  const [serachParam, setSearchParam] = useState(param || '');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigate = useNavigate();

  const handleSearch = () => {
    if (serachParam.length <= 0) {
      toast.error('请输入想要搜索的角色');
      isSearching = false;
      return;
    }
    isSearching = true;
    navigate(`/search/${serachParam}`);
  };

  return (
    <div
      className={cn(
        'relative mx-[-16px] mt-[-32px] flex flex-col items-center justify-center overflow-hidden pt-12 pb-10',
        isSearching ? 'mb-0 h-40 w-full' : 'h-150'
      )}
      style={
        isSearching
          ? {}
          : {
              backgroundImage: `url(${homeBgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              objectPosition: 'top',
            }
      }
    >
      {!isSearching && (
        <>
          {/* 白色透明层作为前景 */}
          <div className="absolute inset-0 z-0 bg-linear-to-b from-white/90 to-white"></div>
          <h1 className="relative z-10 mb-8 text-center text-4xl font-bold">寻找你的专属角色</h1>
        </>
      )}
      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="group relative">
          <Input
            type="text"
            value={serachParam}
            onChange={(e) => setSearchParam(e.target.value)}
            placeholder="搜索你感兴趣的角色..."
            onKeyDown={handleKeyDown}
            className={cn(
              'border-primary/10 h-16 w-full rounded-full border-2 bg-white pr-24 pl-6 text-lg shadow-lg duration-300 placeholder:text-gray-400 hover:shadow-xl focus-visible:ring-2'
            )}
          />
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <Button
              className="bg-primary hover:bg-primary/90 h-10 w-10 rounded-full transition-colors"
              onClick={handleSearch}
            >
              <Search />
            </Button>
          </div>
        </div>
        <div className="from-primary/5 to-secondary/5 pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r"></div>
      </div>
    </div>
  );
}

export default SearchBar;
