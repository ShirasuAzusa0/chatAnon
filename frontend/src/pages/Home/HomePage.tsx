import { useEffect, useState } from 'react';
import SearchBar from '@/components/SearchBar';
import RoleCard from '@/components/RoleCard';
import { fetchNewestRoleList, fetchRecommendedRoleList, type RoleData } from '@/api/roles';

function HomePage() {
  const [recommendedRoles, setRecommendedRoles] = useState<RoleData[]>([]);
  const [newestRoles, setPopularRoles] = useState<RoleData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const recomendedRes = await fetchRecommendedRoleList();
      if (recomendedRes) setRecommendedRoles(recomendedRes);
      const newestRes = await fetchNewestRoleList();
      if (newestRes) setPopularRoles(newestRes);
    };
    fetchData();
  }, []);
  return (
    <section className="mx-auto space-y-10 p-4">
      {/* 搜索框部分 */}
      <SearchBar />

      {/* 最新角色列表 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">最新角色</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {newestRoles.map((role) => (
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

      {/* 角色推荐列表 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">推荐角色</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {recommendedRoles.map((role) => (
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
    </section>
  );
}

export default HomePage;
