import app from './app';
import { PORT } from './models/constants';

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
