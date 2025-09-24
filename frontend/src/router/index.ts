import { createBrowserRouter } from 'react-router';
import HomePage from '@/pages/Home/HomePage';
import ChatPage from '@/pages/Chat/ChatPage';
import RoleInfoPage from '@/pages/RoleInfo/RoleInfoPage';
import FavoriteRolePage from '@/pages/FavoriteRole/FavoriteRolePage';
import ForumPage from '@/pages/Forum/ForumPage';
import App from '@/App';
import MyRolePage from '@/pages/MyRole/MyRolePage';

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: '/',
        Component: HomePage,
      },
      {
        path: '/chat/:chatId',
        Component: ChatPage,
      },
      {
        path: '/role-info/:roleId',
        Component: RoleInfoPage,
      },
      {
        path: '/favorite-role',
        Component: FavoriteRolePage,
      },
      {
        path: '/forum',
        Component: ForumPage,
      },
      {
        path: '/my-role',
        Component: MyRolePage,
      },
    ],
  },
]);

export default router;
