import SearchBar from './components/SearchBar';
import RoleCard from './components/RoleCard';
import { popularRoles, recommendedRoles } from './data/rolesList';

function HomePage() {
  return (
    <main className="mx-auto px-4 py-8 space-y-10">
      {/* 搜索框部分 */}
      <SearchBar />

      {/* 角色推荐列表 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">推荐角色</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedRoles.map((role) => (
            <RoleCard
              key={role.id}
              id={role.id}
              name={role.name}
              description={role.description}
              image={role.image}
            />
          ))}
        </div>
      </section>

      {/* 热门角色列表 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">热门角色</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularRoles.map((role) => (
            <RoleCard
              key={role.id}
              id={role.id}
              name={role.name}
              description={role.description}
              image={role.image}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
