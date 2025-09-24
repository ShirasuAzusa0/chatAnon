import { Link } from 'react-router';

function HomePage() {
  return (
    <>
      <div className="">
        HomeP1age
        <Link to="/role-info/123">RoleInfo</Link>
        <Link to="/favorite-role">FavoriteRole</Link>
        <Link to="/forum">Forum</Link>
        <Link to="/chat/123">Chat123</Link>
        <Link to="/chat/456">Chat456</Link>
      </div>
    </>
  );
}

export default HomePage;
