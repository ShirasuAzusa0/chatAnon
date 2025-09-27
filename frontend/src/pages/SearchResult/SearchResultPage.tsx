import SearchBar from '@/components/SearchBar';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { fetchSearchRoleList, type RoleData } from '@/api/roles';
import RoleCard from '@/components/RoleCard';
import NewRoleCard from '@/components/NewRoleCard';

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
    <section className="relative mx-auto space-y-10 p-4">
      <div className="sticky top-[-40px] z-10 h-30 bg-linear-to-b from-white to-white/50 backdrop-blur-xl lg:mx-[-16px]">
        <SearchBar isSearching param={searchParam} />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        <NewRoleCard />
      </div>
    </section>
  );
}
