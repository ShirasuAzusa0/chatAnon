import SearchBar from '@/components/SearchBar';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { fetchSearchRoleList, type RoleData } from '@/api/roles';
import RoleCard from '@/components/RoleCard';

export default function SearchResultPage() {
  const { searchParam } = useParams();
  const [roleList, setRoleList] = useState<RoleData[]>([]);

  useEffect(() => {
    const searchRoleList = async () => {
      if (!searchParam) {
        return;
      }
      const res = await fetchSearchRoleList(searchParam);
      setRoleList(res);
    };
    searchRoleList();
  }, [searchParam]);

  return (
    <section className="mx-auto p-4 space-y-10 relative">
      <div className="sticky top-[-40px] lg:mx-[-16px] z-100 bg-linear-to-b from-white to-white/50 backdrop-blur-xl h-30">
        <SearchBar isSearching param={searchParam} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleList.map((role) => (
          <RoleCard
            key={role.roleId}
            id={role.roleId}
            name={role.roleName}
            description={role.short_info}
            image={role.avatarURL}
            collections={role.favoriteCount}
            likes={role.likesCount}
          />
        ))}
      </div>
    </section>
  );
}
