import SearchBar from '@/components/SearchBar';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { fetchRoleListByTag, fetchSearchRoleList, type RoleData } from '@/api/roles';
import RoleCard from '@/components/RoleCard';
import NewRoleCard from '@/components/NewRoleCard';
import { Button } from '@/components/ui/button';

export default function SearchResultPage() {
  const { searchParam, tagName } = useParams();
  const [roleList, setRoleList] = useState<RoleData[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const searchRoleList = async () => {
      if (!searchParam) {
        return;
      }
      if (tagName) {
        const res = await fetchRoleListByTag(tagName);
        setRoleList(res);
        return;
      }
      const res = await fetchSearchRoleList(searchParam);
      setRoleList(res);
    };
    searchRoleList();
  }, [searchParam, tagName]);

  return (
    <section className="relative mx-auto space-y-10 p-4">
      {!tagName ? (
        <div className="from-background to-background/50 sticky top-[-48px] z-10 h-30 bg-linear-to-b backdrop-blur-xl lg:mx-[-16px]">
          <SearchBar isSearching param={searchParam} />
        </div>
      ) : (
        <div className="bg-background/50 sticky top-0 z-10 mx-[-16px] mt-[-16px] mb-0 flex items-center p-4 backdrop-blur-xl">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => navigate(-1)}>
            返回
          </Button>
          <span className="text-primary text-lg font-bold">{tagName} 标签下的所有角色：</span>
        </div>
      )}

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
