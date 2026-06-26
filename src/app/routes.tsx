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
import { AuthorPage } from './pages/AuthorPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { AdminPage } from './pages/AdminPage';
import { PublishPage } from './pages/PublishPage';
import { RevisorPage } from './pages/RevisorPage';
import { AprovadorPage } from './pages/AprovadorPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
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
      { path: 'autor/:id', Component: AuthorPage },
      { path: 'subscricoes', Component: SubscriptionsPage },
      { path: 'publicar', Component: PublishPage },
      // Role-specific dashboards
      { path: 'admin', Component: AdminPage },         // ADMIN e SUPERADMIN (CMS)
      { path: 'revisor', Component: RevisorPage },     // REVISOR (revê conteúdos pendentes)
      { path: 'aprovador', Component: AprovadorPage }, // APROVADOR (publica conteúdos revistos)
      { path: 'reset-password', Component: ResetPasswordPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);