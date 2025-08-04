import app from './app';

const PORT: number = parseInt(process.env['PORT'] || '4001', 10);

app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
}); 