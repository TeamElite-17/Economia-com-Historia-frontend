import { createBrowserRouter } from 'react-router';
import { Root } from './components/layout/Root';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { QuizPage } from './pages/QuizPage';
import { QuizDetailPage } from './pages/QuizDetailPage';
import { ForumPage } from './pages/ForumPage';
import { ForumThreadPage } from './pages/ForumThreadPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: 'explorar', Component: ExplorePage },
      { path: 'conteudo/:id', Component: ContentDetailPage },
      { path: 'quiz', Component: QuizPage },
      { path: 'quiz/:id', Component: QuizDetailPage },
      { path: 'forum', Component: ForumPage },
      { path: 'forum/:id', Component: ForumThreadPage },
      { path: 'perfil', Component: ProfilePage },
      { path: 'subscricoes', Component: SubscriptionsPage },
      { path: 'admin', Component: AdminPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);