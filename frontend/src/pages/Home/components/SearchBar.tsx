import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import homeBgImage from '/home-bg.png';

function SearchBar() {
  return (
    <div
      className="h-150 flex flex-col items-center justify-center pt-12 pb-10 mx-[-20px] mt-[-32px] relative overflow-hidden"
      style={{
        backgroundImage: `url(${homeBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        objectPosition: 'top',
      }}
    >
      {/* 白色透明层作为前景 */}
      <div className="absolute inset-0 bg-linear-to-b from-white/90 to-white z-0"></div>
      <h1 className="text-4xl font-bold mb-8 text-center relative z-10">寻找你的专属角色</h1>
      <div className="relative w-full max-w-3xl mx-auto z-10">
        <div className="relative group">
          <Input
            type="text"
            placeholder="搜索你感兴趣的角色..."
            className="w-full h-16 text-lg pl-6 pr-24 rounded-full border-2 border-primary/10 shadow-lg focus-visible:ring-2 bg-white  placeholder:text-gray-400 duration-300 hover:shadow-xl"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Button className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90 transition-colors">
              <Search />
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-r from-primary/5 to-secondary/5"></div>
      </div>
    </div>
  );
}

export default SearchBar;
