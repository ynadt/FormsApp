import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

dotenv.config();
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import formsRoutes from './routes/forms';
import likesRoutes from './routes/likes';
import templateAccessRoutes from './routes/templateAccess';
import templatesRoutes from './routes/templates';
import usersRoutes from './routes/users';
import topicsRoutes from './routes/topics';
import tagsRoutes from './routes/tags';
import usersAutocompleteRoutes from './routes/usersAutocomplete';
import searchRoutes from './routes/search';
import commentsRoutes from './routes/comments';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/search', searchRoutes);
app.use('/topics', topicsRoutes);
app.use('/tags', tagsRoutes);
app.use('/users/autocomplete', usersAutocompleteRoutes);
app.use('/auth', authRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/comments', commentsRoutes);
app.use('/forms', formsRoutes);
app.use('/likes', likesRoutes);
app.use('/template-access', templateAccessRoutes);
app.use('/templates', templatesRoutes);
app.use('/users', usersRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
